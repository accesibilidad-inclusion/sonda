import React, { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { IS_DEVELOPER_MODE } from '../constants';

interface FidgetToolProps {
  onClose: (sessionData: { duration: number; intensity: string }) => void;
  reducedMotion?: boolean;
}

const FidgetTool: React.FC<FidgetToolProps> = ({ onClose, reducedMotion = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [startTime] = useState(Date.now());
  const interactionCount = useRef(0);
  
  // Use a ref for pointers to handle multitouch without re-renders
  const pointers = useRef(new Map<number, { x: number, y: number, color: number[], dx: number, dy: number }>());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
        if (IS_DEVELOPER_MODE) console.error("[FidgetTool] Canvas ref is null");
        return;
    }

    // Configuration
    const config = {
      TEXTURE_DOWNSAMPLE: 1,
      DENSITY_DISSIPATION: 0.995,  // Higher = longer trails
      VELOCITY_DISSIPATION: 0.995,  // Higher = longer fluid motion
      PRESSURE: 0.8,
      PRESSURE_ITERATIONS: 20,
      CURL: 20,  // Reduced from 30 for more stability
      SPLAT_RADIUS: 0.010,  // Slightly larger splats for visibility
      SPLAT_FORCE: 8000  // Increased force for better responsiveness
    };

    if (reducedMotion) {
      config.CURL = 0;
      config.VELOCITY_DISSIPATION = 0.90;
      config.DENSITY_DISSIPATION = 0.92;
    }

    // WebGL Setup
    if (IS_DEVELOPER_MODE) console.log("[FidgetTool] Initializing WebGL...");
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) {
        if (IS_DEVELOPER_MODE) console.error("[FidgetTool] WebGL not supported");
        return;
    }

    const ext = gl.getExtension('OES_texture_half_float');
    const supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
    if (IS_DEVELOPER_MODE) {
        console.log(`[FidgetTool] OES_texture_half_float: ${!!ext}`);
        console.log(`[FidgetTool] OES_texture_half_float_linear: ${!!supportLinearFiltering}`);
    }
    const halfFloat = ext ? ext.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
    
    // --- SHADERS ---
    
    const baseVertexShader = `
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main () {
          vUv = aPosition * 0.5 + 0.5;
          gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const clearShader = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
      void main () {
          gl_FragColor = value * texture2D(uTexture, vUv);
      }
    `;

    const splatShader = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
      void main () {
          vec2 p = vUv - point.xy;
          p.x *= aspectRatio;
          vec3 splat = exp(-dot(p, p) / radius) * color;
          vec3 base = texture2D(uTarget, vUv).xyz;
          gl_FragColor = vec4(base + splat, 1.0);
      }
    `;

    const advectionShader = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform float dt;
      uniform float dissipation;
      void main () {
          vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
          gl_FragColor = dissipation * texture2D(uSource, coord);
      }
    `;

    const divergenceShader = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uVelocity;
      uniform vec2 texelSize;
      void main () {
          vec2 vL = vUv - vec2(texelSize.x, 0.0);
          vec2 vR = vUv + vec2(texelSize.x, 0.0);
          vec2 vT = vUv + vec2(0.0, texelSize.y);
          vec2 vB = vUv - vec2(0.0, texelSize.y);
          
          float L = texture2D(uVelocity, vL).x;
          float R = texture2D(uVelocity, vR).x;
          float T = texture2D(uVelocity, vT).y;
          float B = texture2D(uVelocity, vB).y;
          
          vec2 C = texture2D(uVelocity, vUv).xy;
          if (vL.x < 0.0) { L = -C.x; }
          if (vR.x > 1.0) { R = -C.x; }
          if (vT.y > 1.0) { T = -C.y; }
          if (vB.y < 0.0) { B = -C.y; }
          
          float div = 0.5 * (R - L + T - B);
          gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `;

    const curlShader = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uVelocity;
      uniform vec2 texelSize;
      void main () {
          vec2 vL = vUv - vec2(texelSize.x, 0.0);
          vec2 vR = vUv + vec2(texelSize.x, 0.0);
          vec2 vT = vUv + vec2(0.0, texelSize.y);
          vec2 vB = vUv - vec2(0.0, texelSize.y);

          float L = texture2D(uVelocity, vL).y;
          float R = texture2D(uVelocity, vR).y;
          float T = texture2D(uVelocity, vT).x;
          float B = texture2D(uVelocity, vB).x;
          float vorticity = R - L - T + B;
          gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
    `;

    const vorticityShader = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform vec2 texelSize;
      uniform float curl;
      uniform float dt;
      void main () {
          vec2 vL = vUv - vec2(texelSize.x, 0.0);
          vec2 vR = vUv + vec2(texelSize.x, 0.0);
          vec2 vT = vUv + vec2(0.0, texelSize.y);
          vec2 vB = vUv - vec2(0.0, texelSize.y);

          float L = texture2D(uCurl, vL).x;
          float R = texture2D(uCurl, vR).x;
          float T = texture2D(uCurl, vT).x;
          float B = texture2D(uCurl, vB).x;
          float C = texture2D(uCurl, vUv).x;
          
          vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
          force /= length(force) + 0.0001;
          force *= curl * C;
          force.y *= -1.0;
          
          vec2 vel = texture2D(uVelocity, vUv).xy;
          gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
      }
    `;

    const pressureShader = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      uniform vec2 texelSize;
      void main () {
          vec2 vL = vUv - vec2(texelSize.x, 0.0);
          vec2 vR = vUv + vec2(texelSize.x, 0.0);
          vec2 vT = vUv + vec2(0.0, texelSize.y);
          vec2 vB = vUv - vec2(0.0, texelSize.y);

          float L = texture2D(uPressure, vL).x;
          float R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).x;
          float B = texture2D(uPressure, vB).x;
          float C = texture2D(uPressure, vUv).x;
          float divergence = texture2D(uDivergence, vUv).x;
          float pressure = (L + R + B + T - divergence) * 0.25;
          gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `;

    const gradientSubtractShader = `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      uniform vec2 texelSize;
      void main () {
          vec2 vL = vUv - vec2(texelSize.x, 0.0);
          vec2 vR = vUv + vec2(texelSize.x, 0.0);
          vec2 vT = vUv + vec2(0.0, texelSize.y);
          vec2 vB = vUv - vec2(0.0, texelSize.y);

          float L = texture2D(uPressure, vL).x;
          float R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).x;
          float B = texture2D(uPressure, vB).x;
          vec2 velocity = texture2D(uVelocity, vUv).xy;
          velocity.xy -= vec2(R - L, T - B);
          gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `;

    // --- UTILS ---

    const createProgram = (vertexShader: string, fragmentShader: string, name?: string) => {
      const createShader = (source: string, type: number) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            if (IS_DEVELOPER_MODE) console.error(`[FidgetTool] Error compiling shader (${name}):`, gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
      };

      const program = gl.createProgram();
      if (!program) return null;
      const vs = createShader(vertexShader, gl.VERTEX_SHADER);
      const fs = createShader(fragmentShader, gl.FRAGMENT_SHADER);
      if (!vs || !fs) return null;
      
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          if (IS_DEVELOPER_MODE) console.error(`[FidgetTool] Error linking program (${name}):`, gl.getProgramInfoLog(program));
          return null;
      }
      return program;
    };

    const blit = (destination: WebGLFramebuffer | null) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, destination);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };

    let simWidth: number, simHeight: number;
    let dyeWidth: number, dyeHeight: number;

    const createFBO = (w: number, h: number, type: number = halfFloat) => {
        gl.activeTexture(gl.TEXTURE0);
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, type === halfFloat && supportLinearFiltering ? gl.LINEAR : gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, type === halfFloat && supportLinearFiltering ? gl.LINEAR : gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, type, null);

        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.viewport(0, 0, w, h);
        gl.clear(gl.COLOR_BUFFER_BIT);

        return {
            fbo,
            texture,
            width: w,
            height: h,
            attach: (id: number) => {
                gl.activeTexture(gl.TEXTURE0 + id);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                return id;
            }
        };
    };

    const createDoubleFBO = (w: number, h: number, type: number = halfFloat) => {
        let fbo1 = createFBO(w, h, type);
        let fbo2 = createFBO(w, h, type);
        return {
            width: w,
            height: h,
            texelSizeX: 1.0 / w,
            texelSizeY: 1.0 / h,
            get read() { return fbo1; },
            set read(value) { fbo1 = value; },
            get write() { return fbo2; },
            set write(value) { fbo2 = value; },
            swap: () => {
                let temp = fbo1;
                fbo1 = fbo2;
                fbo2 = temp;
            }
        };
    };

    // --- INIT ---

    let density: any;
    let velocity: any;
    let divergence: any;
    let curl: any;
    let pressure: any;

    const resizeCanvas = () => {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        simWidth = Math.floor(canvas.width / 2); 
        simHeight = Math.floor(canvas.height / 2);
        dyeWidth = Math.floor(canvas.width / 1); 
        dyeHeight = Math.floor(canvas.height / 1);
        
        if (IS_DEVELOPER_MODE) console.log(`[FidgetTool] Resizing: ${canvas.width}x${canvas.height}`);

        density = createDoubleFBO(dyeWidth, dyeHeight);
        velocity = createDoubleFBO(simWidth, simHeight);
        divergence = createFBO(simWidth, simHeight);
        curl = createFBO(simWidth, simHeight);
        pressure = createDoubleFBO(simWidth, simHeight);
    };

    resizeCanvas();

    const displayProgram = createProgram(baseVertexShader, `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;
        void main () {
            gl_FragColor = texture2D(uTexture, vUv);
        }
    `, 'Display');
    
    const splatProgram = createProgram(baseVertexShader, splatShader, 'Splat');
    const advectionProgram = createProgram(baseVertexShader, advectionShader, 'Advection');
    const divergenceProgram = createProgram(baseVertexShader, divergenceShader, 'Divergence');
    const curlProgram = createProgram(baseVertexShader, curlShader, 'Curl');
    const vorticityProgram = createProgram(baseVertexShader, vorticityShader, 'Vorticity');
    const pressureProgram = createProgram(baseVertexShader, pressureShader, 'Pressure');
    const gradienSubtractProgram = createProgram(baseVertexShader, gradientSubtractShader, 'GradientSubtract');
    const clearProgram = createProgram(baseVertexShader, clearShader, 'Clear');

    const glQuadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, glQuadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const glQuadIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glQuadIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);

    let lastTime = Date.now();
    let animId: number;

    const update = () => {
        const dt = Math.min((Date.now() - lastTime) / 1000, 0.016);
        lastTime = Date.now();

        gl.disable(gl.BLEND);
        gl.viewport(0, 0, simWidth, simHeight);

        if (advectionProgram) {
             const posLoc = gl.getAttribLocation(advectionProgram, 'aPosition');
             gl.bindBuffer(gl.ARRAY_BUFFER, glQuadBuffer);
             gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
             gl.enableVertexAttribArray(posLoc);
             gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glQuadIndexBuffer);
        }

        // 1. Curl
        if(curlProgram) {
            gl.useProgram(curlProgram);
            gl.uniform1i(gl.getUniformLocation(curlProgram!, 'uVelocity'), velocity.read.attach(0));
            gl.uniform2f(gl.getUniformLocation(curlProgram!, 'texelSize'), velocity.texelSizeX, velocity.texelSizeY);
            blit(curl.fbo);
        }

        // 2. Vorticity
        if(vorticityProgram) {
            gl.useProgram(vorticityProgram);
            gl.uniform1i(gl.getUniformLocation(vorticityProgram!, 'uVelocity'), velocity.read.attach(0));
            gl.uniform1i(gl.getUniformLocation(vorticityProgram!, 'uCurl'), curl.attach(1));
            gl.uniform2f(gl.getUniformLocation(vorticityProgram!, 'texelSize'), velocity.texelSizeX, velocity.texelSizeY);
            gl.uniform1f(gl.getUniformLocation(vorticityProgram!, 'curl'), config.CURL);
            gl.uniform1f(gl.getUniformLocation(vorticityProgram!, 'dt'), dt);
            blit(velocity.write.fbo);
            velocity.swap();
        }

        // 3. Divergence
        if(divergenceProgram) {
            gl.useProgram(divergenceProgram);
            gl.uniform1i(gl.getUniformLocation(divergenceProgram!, 'uVelocity'), velocity.read.attach(0));
            gl.uniform2f(gl.getUniformLocation(divergenceProgram!, 'texelSize'), velocity.texelSizeX, velocity.texelSizeY);
            blit(divergence.fbo);
        }

        // 4. Clear Pressure
        if(clearProgram) {
            gl.useProgram(clearProgram);
            gl.uniform1i(gl.getUniformLocation(clearProgram!, 'uTexture'), pressure.read.attach(0));
            gl.uniform1f(gl.getUniformLocation(clearProgram!, 'value'), config.PRESSURE);
            blit(pressure.write.fbo);
            pressure.swap();
        }

        // 5. Pressure (Jacobi)
        if(pressureProgram) {
            gl.useProgram(pressureProgram);
            gl.uniform1i(gl.getUniformLocation(pressureProgram!, 'uDivergence'), divergence.attach(0));
            gl.uniform2f(gl.getUniformLocation(pressureProgram!, 'texelSize'), velocity.texelSizeX, velocity.texelSizeY);
            for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
                gl.uniform1i(gl.getUniformLocation(pressureProgram!, 'uPressure'), pressure.read.attach(1));
                blit(pressure.write.fbo);
                pressure.swap();
            }
        }

        // 6. Gradient Subtract
        if(gradienSubtractProgram) {
            gl.useProgram(gradienSubtractProgram);
            gl.uniform1i(gl.getUniformLocation(gradienSubtractProgram!, 'uPressure'), pressure.read.attach(0));
            gl.uniform1i(gl.getUniformLocation(gradienSubtractProgram!, 'uVelocity'), velocity.read.attach(1));
            gl.uniform2f(gl.getUniformLocation(gradienSubtractProgram!, 'texelSize'), velocity.texelSizeX, velocity.texelSizeY);
            blit(velocity.write.fbo);
            velocity.swap();
        }

        // 7. Advection Velocity
        if(advectionProgram) {
            gl.useProgram(advectionProgram);
            gl.uniform2f(gl.getUniformLocation(advectionProgram!, 'texelSize'), velocity.texelSizeX, velocity.texelSizeY);
            if (!velocity.read.attach(0)) return;
            gl.uniform1i(gl.getUniformLocation(advectionProgram!, 'uVelocity'), 0);
            gl.uniform1i(gl.getUniformLocation(advectionProgram!, 'uSource'), 0);
            gl.uniform1f(gl.getUniformLocation(advectionProgram!, 'dt'), dt);
            gl.uniform1f(gl.getUniformLocation(advectionProgram!, 'dissipation'), config.VELOCITY_DISSIPATION);
            blit(velocity.write.fbo);
            velocity.swap();
        }

        // 8. Advection Density (Dye)
        gl.viewport(0, 0, dyeWidth, dyeHeight);
        if(advectionProgram) {
            gl.useProgram(advectionProgram);
            gl.uniform2f(gl.getUniformLocation(advectionProgram!, 'texelSize'), density.texelSizeX, density.texelSizeY);
            gl.uniform1i(gl.getUniformLocation(advectionProgram!, 'uVelocity'), velocity.read.attach(0));
            gl.uniform1i(gl.getUniformLocation(advectionProgram!, 'uSource'), density.read.attach(1));
            gl.uniform1f(gl.getUniformLocation(advectionProgram!, 'dissipation'), config.DENSITY_DISSIPATION);
            blit(density.write.fbo);
            density.swap();
        }

        // 9. Display
        gl.viewport(0, 0, canvas.width, canvas.height);
        if(displayProgram) {
            gl.useProgram(displayProgram);
            gl.uniform1i(gl.getUniformLocation(displayProgram!, 'uTexture'), density.read.attach(0));
            blit(null);
        }

        animId = requestAnimationFrame(update);
    };

    update();

    const splat = (x: number, y: number, dx: number, dy: number, color: number[]) => {
        if (!splatProgram) return;
        
        gl.useProgram(splatProgram);
        gl.uniform1i(gl.getUniformLocation(splatProgram, 'uTarget'), velocity.read.attach(0));
        gl.uniform1f(gl.getUniformLocation(splatProgram, 'aspectRatio'), canvas.width / canvas.height);
        // Correcting coordinate system: WebGL 0,0 is bottom-left, clientY is top-left
        gl.uniform2f(gl.getUniformLocation(splatProgram, 'point'), x / canvas.width, 1.0 - y / canvas.height);
        gl.uniform3f(gl.getUniformLocation(splatProgram, 'color'), dx, -dy, 1.0);
        gl.uniform1f(gl.getUniformLocation(splatProgram, 'radius'), config.SPLAT_RADIUS);
        gl.viewport(0, 0, simWidth, simHeight);
        blit(velocity.write.fbo);
        velocity.swap();

        gl.uniform1i(gl.getUniformLocation(splatProgram, 'uTarget'), density.read.attach(0));
        gl.uniform3f(gl.getUniformLocation(splatProgram, 'color'), color[0], color[1], color[2]);
        gl.viewport(0, 0, dyeWidth, dyeHeight);
        blit(density.write.fbo);
        density.swap();
        
        interactionCount.current++;
        if (IS_DEVELOPER_MODE && interactionCount.current % 100 === 0) {
            console.log(`[FidgetTool] Interactions: ${interactionCount.current}`);
        }
    };

    const generateColor = () => {
        const c = HSVtoRGB(Math.random(), 1.0, 1.0);
        c.r *= 0.25; c.g *= 0.25; c.b *= 0.25;  // Increased from 0.15 to 0.25 for better visibility
        return [c.r, c.g, c.b];
    };

    const HSVtoRGB = (h: number, s: number, v: number) => {
        let r=0, g=0, b=0, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        return { r, g, b };
    };

    // --- INPUT HANDLING ---
    
    // Helper to process pointers (Mouse + Touch)
    const updatePointer = (id: number, x: number, y: number, isDown: boolean) => {
        if (isDown) {
            let p = pointers.current.get(id);
            if (!p) {
                // New pointer
                p = { x, y, color: generateColor(), dx: 0, dy: 0 };
                pointers.current.set(id, p);
                // Initial splat on touch down
                splat(x, y, (Math.random()-0.5)*20, (Math.random()-0.5)*20, p.color);
            } else {
                // Moving pointer
                const dx = x - p.x;
                const dy = y - p.y;
                p.x = x;
                p.y = y;
                // Add force proportional to movement
                if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
                    splat(x, y, dx * 8.0, dy * 8.0, p.color);
                }
            }
        } else {
            pointers.current.delete(id);
        }
    };

    // Mouse Handlers
    const onMouseDown = (e: MouseEvent) => {
        if(IS_DEVELOPER_MODE) console.log("[FidgetTool] Mouse Down");
        updatePointer(-1, e.offsetX, e.offsetY, true);
    };

    const onMouseMove = (e: MouseEvent) => {
        // Only track mouse move if button is pressed (or if you want hover effect, remove checks)
        // For standard "fluid" feel, usually tracking only on drag is preferred, but let's allow "hover" interaction?
        // Actually, previous code only did drag. Let's stick to drag for mouse (buttons === 1).
        if (e.buttons === 1) {
            updatePointer(-1, e.offsetX, e.offsetY, true);
        }
    };

    const onMouseUp = (e: MouseEvent) => {
        if(IS_DEVELOPER_MODE) console.log("[FidgetTool] Mouse Up");
        updatePointer(-1, e.offsetX, e.offsetY, false);
    };

    // Touch Handlers
    const onTouchStart = (e: TouchEvent) => {
        if(IS_DEVELOPER_MODE) console.log(`[FidgetTool] Touch Start (${e.changedTouches.length} touches)`);
        e.preventDefault(); // Critical to prevent scrolling/zooming
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            // Provide offset coordinates manually if needed, but clientX/Y usually work if canvas is full screen
            // Getting bounding rect ensures accuracy
            const rect = canvas?.getBoundingClientRect();
            if (rect) {
                updatePointer(t.identifier, t.clientX - rect.left, t.clientY - rect.top, true);
            }
        }
    };

    const onTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            const rect = canvas?.getBoundingClientRect();
            if (rect) {
                updatePointer(t.identifier, t.clientX - rect.left, t.clientY - rect.top, true);
            }
        }
    };

    const onTouchEnd = (e: TouchEvent) => {
        if(IS_DEVELOPER_MODE) console.log("[FidgetTool] Touch End");
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            const rect = canvas?.getBoundingClientRect();
            if (rect) {
                updatePointer(t.identifier, t.clientX - rect.left, t.clientY - rect.top, false);
            }
        }
    };

    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    
    // Add passive: false to allow preventDefault
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);

    // Initial Splash
    for(let i=0; i<3; i++) {
        splat(Math.random()*canvas.width, Math.random()*canvas.height, (Math.random()-0.5)*200, (Math.random()-0.5)*200, generateColor());
    }

    return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', resizeCanvas);
        
        if (canvas) {
            canvas.removeEventListener('mousedown', onMouseDown);
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('touchstart', onTouchStart);
            canvas.removeEventListener('touchmove', onTouchMove);
            canvas.removeEventListener('touchend', onTouchEnd);
            canvas.removeEventListener('touchcancel', onTouchEnd);
        }
        window.removeEventListener('mouseup', onMouseUp);
    };

  }, [reducedMotion]);

  const handleClose = () => {
    const durationSeconds = (Date.now() - startTime) / 1000;
    const intensity = interactionCount.current > 200 ? 'high' : interactionCount.current > 50 ? 'medium' : 'low';
    const startTimeISO = new Date(startTime).toISOString();
    onClose({ 
      startTime: startTimeISO,
      durationSeconds, 
      intensity,
      interactions: interactionCount.current
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black touch-none">
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full cursor-pointer"
      />
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/20 z-50"
        aria-label="Cerrar"
      >
        <X size={24} />
      </button>
    </div>
  );
};

export default FidgetTool;