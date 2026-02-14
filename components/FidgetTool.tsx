import React, { useRef, useEffect, useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { IS_DEVELOPER_MODE } from '../constants';
import Matter from 'matter-js';

interface FidgetToolProps {
  onClose: (sessionData: { startTime: string; durationSeconds: number; shots: number; drags: number }) => void;
  reducedMotion?: boolean;
}

const FidgetTool: React.FC<FidgetToolProps> = ({ onClose, reducedMotion = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [startTime] = useState(Date.now());
  const shotCount = useRef(0);
  const dragCount = useRef(0);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [regenerateKey, setRegenerateKey] = useState(0);

  // Slingshot state (situational)
  const slingshotState = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const towerBodiesRef = useRef<Matter.Body[]>([]);

  const colors = ['#E94B91', '#03A9F5', '#00BCD4', '#FFA500', '#FFEB3B', '#8BC34A'];

  useEffect(() => {
    if (IS_DEVELOPER_MODE) console.log('[FidgetTool] useEffect started');

    const container = containerRef.current;
    if (!container) {
      if (IS_DEVELOPER_MODE) console.error('[FidgetTool] Container ref is null');
      return;
    }

    // Clear any existing canvases (in case of remount)
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Container ref OK', container);
    if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Container cleared, children count:', container.children.length);

    try {
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Extracting Matter.js modules...');

      const Engine = Matter.Engine;
      const Render = Matter.Render;
      const Runner = Matter.Runner;
      const World = Matter.World;
      const Bodies = Matter.Bodies;
      const Events = Matter.Events;
      const Mouse = Matter.Mouse;
      const MouseConstraint = Matter.MouseConstraint;

      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Matter.js modules extracted successfully');

      // Get dimensions
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (IS_DEVELOPER_MODE) console.log(`[FidgetTool] Dimensions: ${width}x${height}`);

      // Create engine
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Creating Matter.js engine...');
      const engine = Engine.create();
      engineRef.current = engine;
      const world = engine.world;
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Engine created successfully', engine);

      // Create renderer
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Creating renderer...');
      const render = Render.create({
        element: container,
        engine: engine,
        options: {
          width: width,
          height: height,
          wireframes: false,
          background: '#000000'
        }
      });
      renderRef.current = render;
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Renderer created', render);

      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Starting renderer...');
      Render.run(render);
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Renderer running');

      // Create runner
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Creating runner...');
      const runner = Runner.create();
      runnerRef.current = runner;
      Runner.run(runner, engine);
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Runner created and running');

      // Define collision categories
      const rockCategory = 0x0001;
      const otherCategory = 0x0004;

      // Create walls and ground - OUTSIDE visible area, very thick
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Creating walls and ground...');

      const wallThickness = width; // Very thick walls

      // Ground - below visible area
      const ground = Bodies.rectangle(width / 2, height + wallThickness / 2, width * 3, wallThickness, {
        isStatic: true,
        restitution: 0.8,
        collisionFilter: {
          category: otherCategory,
          mask: rockCategory | otherCategory
        },
        render: {
          fillStyle: '#1a1a1a'
        }
      });

      // Ceiling - above visible area
      const ceiling = Bodies.rectangle(width / 2, -wallThickness / 2, width * 3, wallThickness, {
        isStatic: true,
        restitution: 0.8,
        collisionFilter: {
          category: otherCategory,
          mask: rockCategory | otherCategory
        },
        render: {
          fillStyle: '#1a1a1a'
        }
      });

      // Left wall - outside left edge
      const leftWall = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 3, {
        isStatic: true,
        restitution: 0.8,
        collisionFilter: {
          category: otherCategory,
          mask: rockCategory | otherCategory
        },
        render: {
          fillStyle: '#2a2a2a'
        }
      });

      // Right wall - outside right edge
      const rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 3, {
        isStatic: true,
        restitution: 0.8,
        collisionFilter: {
          category: otherCategory,
          mask: rockCategory | otherCategory
        },
        render: {
          fillStyle: '#2a2a2a'
        }
      });

      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Ground and walls created (outside visible area)');

      // Function to create a central tower
      const createTower = () => {
        const towerBodies: Matter.Body[] = [];

        // Tower configuration
        const centerX = width / 2;
        const towerHeight = height * 0.75; // 3/4 of screen height
        const numElements = 3 + Math.floor(Math.random() * 2); // 3-4 elements
        const elementHeight = towerHeight / numElements;

        if (IS_DEVELOPER_MODE) console.log(`[FidgetTool] Creating central tower with ${numElements} elements`);

        for (let i = 0; i < numElements; i++) {
          // Start from bottom, stack upwards
          const yPos = height - (i + 0.5) * elementHeight;

          // Larger, wider elements
          const elementWidth = 80 + Math.random() * 60; // 80-140px wide
          const elementH = elementHeight * 0.8; // Use 80% of available space

          let shape: Matter.Body;

          // Top element (last one) can be a triangle (most unstable)
          if (i === numElements - 1) {
            // Triangle at the top (cusp)
            shape = Bodies.polygon(centerX, yPos, 3, elementWidth / 3, {
              density: 0.001,
              friction: 0.8,
              restitution: 0.3,
              collisionFilter: {
                category: otherCategory,
                mask: rockCategory | otherCategory
              },
              render: {
                fillStyle: colors[Math.floor(Math.random() * colors.length)]
              }
            });
          } else {
            // Bottom and middle elements: stable shapes only
            const shapeType = Math.floor(Math.random() * 3);

            switch (shapeType) {
              case 0: // Trapezoid with WIDE base (more stable)
                shape = Bodies.trapezoid(centerX, yPos, elementWidth, elementH, 0.3 + Math.random() * 0.2, {
                  density: 0.001,
                  friction: 0.8,
                  restitution: 0.3,
                  collisionFilter: {
                    category: otherCategory,
                    mask: rockCategory | otherCategory
                  },
                  render: {
                    fillStyle: colors[Math.floor(Math.random() * colors.length)]
                  }
                });
                break;

              case 1: // Hexagon (6 sides - even, stable)
                shape = Bodies.polygon(centerX, yPos, 6, elementWidth / 2, {
                  density: 0.001,
                  friction: 0.8,
                  restitution: 0.3,
                  angle: Math.PI / 6, // 30 degrees - flat base
                  collisionFilter: {
                    category: otherCategory,
                    mask: rockCategory | otherCategory
                  },
                  render: {
                    fillStyle: colors[Math.floor(Math.random() * colors.length)]
                  }
                });
                break;

              default: // Rectangle (most stable)
                shape = Bodies.rectangle(centerX, yPos, elementWidth, elementH, {
                  density: 0.001,
                  friction: 0.8,
                  restitution: 0.3,
                  angle: (Math.random() - 0.5) * 0.1, // Very slight rotation
                  collisionFilter: {
                    category: otherCategory,
                    mask: rockCategory | otherCategory
                  },
                  render: {
                    fillStyle: colors[Math.floor(Math.random() * colors.length)]
                  }
                });
            }
          }

          towerBodies.push(shape);
        }

        if (IS_DEVELOPER_MODE) console.log(`[FidgetTool] Created ${towerBodies.length} tower elements`);
        return towerBodies;
      };

      // Create initial tower
      const towerBodies = createTower();

      // Add all bodies to world
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Adding all bodies to world...');
      World.add(world, [ground, ceiling, leftWall, rightWall, ...towerBodies]);
      if (IS_DEVELOPER_MODE) console.log(`[FidgetTool] Added ${4 + towerBodies.length} bodies to world`);

      // Store reference to tower bodies for regeneration
      towerBodiesRef.current = towerBodies;

      // Function to regenerate tower
      const regenerateTower = () => {
        if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Regenerating tower...');

        // Remove old tower bodies from world
        towerBodiesRef.current.forEach(body => {
          World.remove(engine.world, body);
        });

        // Create new tower
        const newTowerBodies = createTower();

        // Add new tower to world
        World.add(engine.world, newTowerBodies);

        // Update reference
        towerBodiesRef.current = newTowerBodies;

        if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Tower regenerated!');
      };

      // Expose regenerate function
      (window as any).__fidgetRegenerate = regenerateTower;

      // Add mouse control for dragging bodies
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Setting up mouse control...');
      const mouse = Mouse.create(render.canvas);
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false
          }
        }
      });

      World.add(world, mouseConstraint);
      render.mouse = mouse;

      // Track if user is dragging a body
      let isDraggingBody = false;

      // Situational Slingshot Logic (only when NOT dragging a body)
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Setting up situational slingshot...');

      canvasRef.current = render.canvas;

      Events.on(mouseConstraint, 'startdrag', function() {
        isDraggingBody = true;
        dragCount.current++;
        if (IS_DEVELOPER_MODE) console.log(`[FidgetTool] Dragging body #${dragCount.current}`);
      });

      Events.on(mouseConstraint, 'enddrag', function() {
        isDraggingBody = false;
      });

      // Mouse/Touch down: check if on empty space
      const handlePointerDown = (x: number, y: number) => {

        // Check if there's a body at this position
        const bodies = Matter.Composite.allBodies(engine.world);
        let bodyFound = false;

        for (const body of bodies) {
          if (!body.isStatic &&
              Matter.Bounds.contains(body.bounds, { x, y }) &&
              Matter.Vertices.contains(body.vertices, { x, y })) {
            bodyFound = true;
            break;
          }
        }

        // Only start slingshot if clicking on empty space
        if (!bodyFound) {
          slingshotState.current = {
            active: true,
            startX: x,
            startY: y,
            currentX: x,
            currentY: y
          };
          if (IS_DEVELOPER_MODE) console.log(`[FidgetTool] Slingshot started at (${x}, ${y})`);
        }
      };

      const handlePointerMove = (x: number, y: number) => {
        if (slingshotState.current?.active && !isDraggingBody) {
          slingshotState.current.currentX = x;
          slingshotState.current.currentY = y;
        }
      };

      const handlePointerUp = () => {
        if (slingshotState.current?.active && !isDraggingBody) {
          const { startX, startY, currentX, currentY } = slingshotState.current;

          // Calculate force vector (opposite direction of drag)
          const deltaX = startX - currentX;
          const deltaY = startY - currentY;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          if (distance > 10) { // Minimum drag distance
            // Create and launch projectile
            const rock = Bodies.circle(startX, startY, 15, {
              density: 0.004,
              friction: 0.5,
              restitution: 0.8,
              collisionFilter: {
                category: rockCategory,
                mask: otherCategory
              },
              render: {
                fillStyle: '#FFFFFF'
              }
            });

            // Apply force (scale by distance for power) - MULTIPLIED BY 15x
            const forceMagnitude = Math.min(distance * 0.0045, 0.75); // Cap max force (15x stronger)
            const forceX = (deltaX / distance) * forceMagnitude;
            const forceY = (deltaY / distance) * forceMagnitude;

            World.add(engine.world, rock);
            Matter.Body.applyForce(rock, { x: startX, y: startY }, { x: forceX, y: forceY });

            shotCount.current++;
            if (IS_DEVELOPER_MODE) console.log(`[FidgetTool] Shot #${shotCount.current} with force (${forceX}, ${forceY})`);

            // Remove rock after 5 seconds to prevent clutter
            setTimeout(() => {
              if (engineRef.current) {
                World.remove(engineRef.current.world, rock);
              }
            }, 5000);
          }

          slingshotState.current = null;
        }
      };

      // Mouse events
      render.canvas.addEventListener('mousedown', (e: MouseEvent) => {
        const rect = render.canvas.getBoundingClientRect();
        handlePointerDown(e.clientX - rect.left, e.clientY - rect.top);
      });

      render.canvas.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = render.canvas.getBoundingClientRect();
        handlePointerMove(e.clientX - rect.left, e.clientY - rect.top);
      });

      render.canvas.addEventListener('mouseup', () => {
        handlePointerUp();
      });

      // Touch events
      render.canvas.addEventListener('touchstart', (e: TouchEvent) => {
        e.preventDefault();
        if (e.touches.length > 0) {
          const rect = render.canvas.getBoundingClientRect();
          handlePointerDown(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
        }
      });

      render.canvas.addEventListener('touchmove', (e: TouchEvent) => {
        if (e.touches.length > 0) {
          const rect = render.canvas.getBoundingClientRect();
          handlePointerMove(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
        }
      });

      render.canvas.addEventListener('touchend', () => {
        handlePointerUp();
      });

      // Custom render to draw red slingshot line
      Events.on(render, 'afterRender', function() {
        if (slingshotState.current?.active) {
          const { startX, startY, currentX, currentY } = slingshotState.current;
          const context = render.context;

          // Draw red line
          context.strokeStyle = '#FF0000';
          context.lineWidth = 3;
          context.beginPath();
          context.moveTo(startX, startY);
          context.lineTo(currentX, currentY);
          context.stroke();

          // Draw circle at start point
          context.fillStyle = '#FF0000';
          context.beginPath();
          context.arc(startX, startY, 8, 0, 2 * Math.PI);
          context.fill();
        }
      });

      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Situational slingshot setup complete');

      // Handle window resize
      const handleResize = () => {
        if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Window resized');
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        render.canvas.width = newWidth;
        render.canvas.height = newHeight;
        render.options.width = newWidth;
        render.options.height = newHeight;

        Render.lookAt(render, {
          min: { x: 0, y: 0 },
          max: { x: newWidth, y: newHeight }
        });
      };

      window.addEventListener('resize', handleResize);

      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] ✅ Slingshot initialized successfully!');
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Canvas element:', render.canvas);
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Canvas dimensions:', render.canvas.width, 'x', render.canvas.height);
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Canvas parent:', render.canvas.parentElement);
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Canvas style:', window.getComputedStyle(render.canvas));
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Container children:', container.children);

      // Force canvas to be visible and interactive
      render.canvas.style.display = 'block';
      render.canvas.style.position = 'absolute';
      render.canvas.style.top = '0';
      render.canvas.style.left = '0';
      render.canvas.style.width = '100%';
      render.canvas.style.height = '100%';
      render.canvas.style.pointerEvents = 'auto';
      render.canvas.style.touchAction = 'none';
      render.canvas.style.zIndex = '1';

      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Canvas styles applied');

      // Hide instructions after 5 seconds
      setTimeout(() => {
        if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Hiding instructions');
        setShowInstructions(false);
      }, 5000);

      // Cleanup
      return () => {
        if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Cleaning up...');

        window.removeEventListener('resize', handleResize);

        if (runnerRef.current && engineRef.current) {
          if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Stopping runner');
          Runner.stop(runnerRef.current);
        }
        if (renderRef.current) {
          if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Stopping renderer');
          Render.stop(renderRef.current);

          // Remove canvas from DOM
          if (render.canvas && render.canvas.parentElement) {
            render.canvas.parentElement.removeChild(render.canvas);
            if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Canvas removed from DOM');
          }
        }
        if (engineRef.current) {
          if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Clearing engine');
          Engine.clear(engineRef.current);
        }

        if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Cleanup complete');
      };
    } catch (err) {
      if (IS_DEVELOPER_MODE) {
        console.error('[FidgetTool] ❌ FATAL ERROR during initialization:', err);
        if (err instanceof Error) {
          console.error('[FidgetTool] Error message:', err.message);
          console.error('[FidgetTool] Error stack:', err.stack);
        }
      }
    }
  }, []);

  const handleClose = () => {
    if (IS_DEVELOPER_MODE) console.log('[FidgetTool] handleClose called');

    const durationSeconds = (Date.now() - startTime) / 1000;
    const startTimeISO = new Date(startTime).toISOString();

    if (IS_DEVELOPER_MODE) {
      console.log('[FidgetTool] Session stats:');
      console.log(`  - Duration: ${durationSeconds.toFixed(2)}s`);
      console.log(`  - Shots: ${shotCount.current}`);
      console.log(`  - Drags: ${dragCount.current}`);
    }

    // Cleanup engine
    if (runnerRef.current && engineRef.current) {
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Stopping runner (handleClose)');
      Matter.Runner.stop(runnerRef.current);
    }
    if (renderRef.current) {
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Stopping renderer (handleClose)');
      Matter.Render.stop(renderRef.current);
    }
    if (engineRef.current) {
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Clearing engine (handleClose)');
      Matter.Engine.clear(engineRef.current);
    }

    if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Calling onClose callback');

    onClose({
      startTime: startTimeISO,
      durationSeconds,
      shots: shotCount.current,
      drags: dragCount.current
    });
  };

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startTime]);

  if (IS_DEVELOPER_MODE) {
    console.log('[FidgetTool] Rendering component');
    console.log('[FidgetTool] showInstructions:', showInstructions);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div ref={containerRef} className="w-full h-full relative" style={{ pointerEvents: 'auto' }} />

      {/* Regenerate button - Top Left */}
      <button
        onClick={() => {
          if ((window as any).__fidgetRegenerate) {
            (window as any).__fidgetRegenerate();
          }
        }}
        className="absolute top-6 left-6 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 active:bg-white/30 transition-all border border-white/20 z-50 hover:scale-110 active:scale-95"
        aria-label="Regenerar escena"
        title="Generar nueva torre"
      >
        <RefreshCw size={28} />
      </button>

      {/* Close button - Top Right */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 active:bg-white/30 transition-all border border-white/20 z-50 hover:scale-110 active:scale-95"
        aria-label="Cerrar"
        title="Toca aquí para salir (o presiona ESC)"
      >
        <X size={28} />
      </button>

      {/* Instructions overlay (shows briefly at start) */}
      {showInstructions && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-md rounded-lg px-6 py-3 text-white text-center border border-white/20 animate-pulse-slow">
          <p className="text-sm">Toca un espacio vacío y arrastra para lanzar pelotas y derribar las torres</p>
        </div>
      )}
    </div>
  );
};

export default FidgetTool;
