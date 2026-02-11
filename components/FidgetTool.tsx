import React, { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';
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
  const rockRef = useRef<Matter.Body | null>(null);
  const elasticRef = useRef<Matter.Constraint | null>(null);
  const anchorRef = useRef<{ x: number; y: number } | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

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
      const Constraint = Matter.Constraint;
      const Mouse = Matter.Mouse;
      const MouseConstraint = Matter.MouseConstraint;
      const Events = Matter.Events;

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
      const anchorCategory = 0x0002;
      const otherCategory = 0x0004;

      // Create walls and ground
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Creating walls and ground...');

      const wallThickness = 20;
      const ground = Bodies.rectangle(width / 2, height - 25, width, 50, {
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

      // Left wall
      const leftWall = Bodies.rectangle(wallThickness / 2, height / 2, wallThickness, height, {
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

      // Right wall
      const rightWall = Bodies.rectangle(width - wallThickness / 2, height / 2, wallThickness, height, {
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

      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Ground and walls created');

      // Create random shelves (repisas) with stacked boxes
      const shelves: Matter.Body[] = [];
      const boxes: Matter.Body[] = [];

      // Create 4-6 shelves at different heights on BOTH sides
      const numShelves = 4 + Math.floor(Math.random() * 3); // 4-6 shelves
      if (IS_DEVELOPER_MODE) console.log(`[FidgetTool] Creating ${numShelves} shelves on both sides...`);

      for (let i = 0; i < numShelves; i++) {
        const shelfY = height * 0.2 + (Math.random() * height * 0.5); // Random heights
        // Alternate between left and right, or random
        const isLeft = i % 2 === 0;
        const shelfX = isLeft
          ? wallThickness + 50 + (Math.random() * (width * 0.25)) // Left side
          : width - wallThickness - 50 - (Math.random() * (width * 0.25)); // Right side
        const shelfWidth = 40 + Math.random() * 20; // Very narrow shelves (40-60px)

        // Create shelf
        const shelf = Bodies.rectangle(shelfX, shelfY, shelfWidth, 20, {
          isStatic: true,
          collisionFilter: {
            category: otherCategory,
            mask: rockCategory | otherCategory
          },
          render: {
            fillStyle: '#2a2a2a'
          }
        });
        shelves.push(shelf);

        // Stack boxes on shelf (vertical tower)
        const numBoxes = 5 + Math.floor(Math.random() * 5); // 5-9 boxes
        const boxWidth = 30;
        const boxHeight = 40;

        for (let j = 0; j < numBoxes; j++) {
          const box = Bodies.rectangle(
            shelfX,
            shelfY - 20 - (j * boxHeight) - boxHeight / 2,
            boxWidth,
            boxHeight,
            {
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
            }
          );
          boxes.push(box);
        }
      }

      if (IS_DEVELOPER_MODE) console.log(`[FidgetTool] Created ${shelves.length} shelves and ${boxes.length} boxes`);

      // Create slingshot anchor (bottom center, raised higher)
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Creating slingshot...');
      const anchorX = width * 0.5; // Center horizontally
      const anchorY = height - 250; // Higher up from bottom
      const anchor = { x: anchorX, y: anchorY };
      anchorRef.current = anchor;
      if (IS_DEVELOPER_MODE) console.log(`[FidgetTool] Anchor at (${anchorX}, ${anchorY})`);

      // Create rock (projectile) - collides with everything EXCEPT anchor
      const rockOptions = {
        density: 0.004,
        friction: 0.5,
        restitution: 0.8,
        collisionFilter: {
          category: rockCategory,
          mask: otherCategory // Only collides with "other" objects, not anchor
        },
        render: {
          fillStyle: '#FFFFFF'
        }
      };

      const rock = Bodies.circle(anchorX, anchorY, 15, rockOptions);
      rockRef.current = rock;
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Rock created with collision filter');

      // Create elastic constraint (slingshot)
      const elastic = Constraint.create({
        pointA: anchor,
        bodyB: rock,
        stiffness: 0.05,
        render: {
          lineWidth: 3,
          strokeStyle: '#666666'
        }
      });
      elasticRef.current = elastic;
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Elastic constraint created');

      // Visual anchor point - rock won't collide with it
      const anchorVisual = Bodies.circle(anchorX, anchorY, 8, {
        isStatic: true,
        collisionFilter: {
          category: anchorCategory,
          mask: 0 // Doesn't collide with anything
        },
        render: {
          fillStyle: '#888888'
        }
      });
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Anchor visual created with no collision');

      // Add all bodies to world
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Adding all bodies to world...');
      World.add(world, [ground, leftWall, rightWall, ...shelves, ...boxes, rock, elastic, anchorVisual]);
      if (IS_DEVELOPER_MODE) console.log(`[FidgetTool] Added ${1 + 2 + shelves.length + boxes.length + 2 + 1} bodies to world (including walls)`);

      // Track mouse constraint for drag counting
      let isDragging = false;
      let hasShotThisRock = false;

      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Setting up afterUpdate event...');

      // Reset rock after shot
      Events.on(engine, 'afterUpdate', function() {
        if (!rockRef.current || !elasticRef.current || !anchorRef.current) return;

        const currentRock = rockRef.current;
        const currentElastic = elasticRef.current;
        const distance = Matter.Vector.magnitude(
          Matter.Vector.sub(currentRock.position, anchorRef.current)
        );

        // If rock is released and has moved away from anchor (release the slingshot)
        if (distance > 50 && !isDragging && !hasShotThisRock) {
          hasShotThisRock = true;

          // IMPORTANT: Remove the elastic constraint to release the rock
          World.remove(engineRef.current!.world, currentElastic);
          if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Elastic constraint removed - rock is free!');

          // Count as a shot
          shotCount.current++;
          if (IS_DEVELOPER_MODE) console.log(`[FidgetTool] Shot #${shotCount.current}`);

          // Wait a bit before resetting
          setTimeout(() => {
            if (!engineRef.current || !anchorRef.current) return;

            // Remove old rock
            World.remove(engineRef.current.world, currentRock);
            if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Old rock removed');

            // Create new rock
            const newRock = Bodies.circle(anchorRef.current.x, anchorRef.current.y, 15, rockOptions);
            rockRef.current = newRock;
            World.add(engineRef.current.world, newRock);
            if (IS_DEVELOPER_MODE) console.log('[FidgetTool] New rock created and added');

            // Create NEW elastic constraint for the new rock
            const newElastic = Constraint.create({
              pointA: anchorRef.current,
              bodyB: newRock,
              stiffness: 0.05,
              render: {
                lineWidth: 3,
                strokeStyle: '#666666'
              }
            });
            elasticRef.current = newElastic;
            World.add(engineRef.current.world, newElastic);
            if (IS_DEVELOPER_MODE) console.log('[FidgetTool] New elastic constraint created and added');

            hasShotThisRock = false;
          }, 2000);
        }
      });

      // Add mouse control
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Creating mouse control...');
      const mouse = Mouse.create(render.canvas);
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Mouse created', mouse);

      const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false
          }
        }
      });
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] MouseConstraint created', mouseConstraint);

      // Track dragging
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Setting up drag events...');
      Events.on(mouseConstraint, 'startdrag', function(event: Matter.IEventCollision<Matter.MouseConstraint>) {
        // Only count drags on the rock
        if (event.body === rockRef.current) {
          isDragging = true;
          dragCount.current++;
          if (IS_DEVELOPER_MODE) console.log(`[FidgetTool] Drag #${dragCount.current}`);
        }
      });

      Events.on(mouseConstraint, 'enddrag', function() {
        isDragging = false;
      });

      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Adding mouseConstraint to world...');
      World.add(world, mouseConstraint);
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] MouseConstraint added');

      // Keep mouse in sync with rendering
      render.mouse = mouse;
      if (IS_DEVELOPER_MODE) console.log('[FidgetTool] Mouse synced with renderer');

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
          <p className="text-sm">Arrastra y suelta el círculo blanco para derribar las torres</p>
        </div>
      )}
    </div>
  );
};

export default FidgetTool;
