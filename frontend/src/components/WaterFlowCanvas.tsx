import { useEffect, useRef } from 'react';

interface WaterFlowCanvasProps {
  className?: string;
  speedMultiplier?: number;
}

export function WaterFlowCanvas({ className = '', speedMultiplier = 1 }: WaterFlowCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Mouse tracking for interactive ripples
    let mouse = { x: -1000, y: -1000, active: false, targetRadius: 0 };
    const ripples: Array<{ x: number; y: number; radius: number; maxRadius: number; alpha: number }> = [];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;

      // Occasionally spawn ripple on movement
      if (Math.random() < 0.25) {
        ripples.push({
          x: mouse.x,
          y: mouse.y,
          radius: 5,
          maxRadius: Math.random() * 80 + 40,
          alpha: 0.45
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      for (let i = 0; i < 3; i++) {
        ripples.push({
          x: clickX,
          y: clickY,
          radius: 5 + i * 15,
          maxRadius: 120 + i * 20,
          alpha: 0.6 - i * 0.15
        });
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Floating water particles
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 4 + 1.5,
      speedX: (Math.random() * 0.8 + 0.2) * speedMultiplier,
      speedY: (Math.sin(Math.random() * Math.PI) * 0.4 - 0.2) * speedMultiplier,
      alpha: Math.random() * 0.35 + 0.15,
      hueOffset: Math.random() * 30
    }));

    // Multi-layer wave definition in pastel tones
    const waves = [
      {
        baseY: 0.35,
        amplitude: 45,
        frequency: 0.003,
        speed: 0.008 * speedMultiplier,
        colorStart: 'rgba(186, 230, 253, 0.45)', // Pastel Sky
        colorEnd: 'rgba(165, 243, 252, 0.35)'     // Pastel Cyan
      },
      {
        baseY: 0.52,
        amplitude: 55,
        frequency: 0.0025,
        speed: -0.006 * speedMultiplier,
        colorStart: 'rgba(167, 243, 208, 0.4)',  // Pastel Mint
        colorEnd: 'rgba(186, 230, 253, 0.45)'     // Pastel Sky
      },
      {
        baseY: 0.68,
        amplitude: 65,
        frequency: 0.002,
        speed: 0.007 * speedMultiplier,
        colorStart: 'rgba(199, 210, 254, 0.35)', // Pastel Lavender
        colorEnd: 'rgba(153, 246, 228, 0.4)'     // Pastel Aqua
      },
      {
        baseY: 0.82,
        amplitude: 50,
        frequency: 0.0035,
        speed: -0.009 * speedMultiplier,
        colorStart: 'rgba(204, 251, 241, 0.5)',  // Soft Teal
        colorEnd: 'rgba(186, 230, 253, 0.35)'     // Soft Sky
      }
    ];

    let step = 0;

    const render = () => {
      step += 1;
      ctx.clearRect(0, 0, width, height);

      // 1. Soft pastel background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#f0fdfa'); // Soft minty white
      bgGrad.addColorStop(0.35, '#f0f9ff'); // Pastel sky tint
      bgGrad.addColorStop(0.7, '#f5f3ff'); // Soft lavender wash
      bgGrad.addColorStop(1, '#ecfeff'); // Aqua fresh
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Render each smooth flowing wave
      waves.forEach((w, index) => {
        ctx.beginPath();
        const startY = height * w.baseY;
        ctx.moveTo(0, height);
        ctx.lineTo(0, startY);

        for (let x = 0; x <= width; x += 6) {
          const dx = x * w.frequency;
          const t = step * w.speed;
          // Harmonic composite sine waves for fluid organic motion
          let y =
            startY +
            Math.sin(dx + t) * w.amplitude +
            Math.cos(dx * 0.7 - t * 0.8) * (w.amplitude * 0.45) +
            Math.sin(dx * 1.5 + t * 1.2) * (w.amplitude * 0.2);

          // Subtle interaction: if mouse is near, softly deform water surface
          if (mouse.active) {
            const dist = Math.hypot(x - mouse.x, y - mouse.y);
            if (dist < 180) {
              const force = (1 - dist / 180) * 22;
              y += Math.sin(dist * 0.08 - step * 0.05) * force;
            }
          }

          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const waveGrad = ctx.createLinearGradient(0, startY - w.amplitude, width, height);
        waveGrad.addColorStop(0, w.colorStart);
        waveGrad.addColorStop(1, w.colorEnd);
        ctx.fillStyle = waveGrad;
        ctx.fill();

        // Wave crest highlight shimmer
        ctx.beginPath();
        for (let x = 0; x <= width; x += 12) {
          const dx = x * w.frequency;
          const t = step * w.speed;
          const y =
            startY +
            Math.sin(dx + t) * w.amplitude +
            Math.cos(dx * 0.7 - t * 0.8) * (w.amplitude * 0.45) +
            Math.sin(dx * 1.5 + t * 1.2) * (w.amplitude * 0.2);

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 - index * 0.08})`;
        ctx.lineWidth = 1.75;
        ctx.stroke();
      });

      // 3. Render water droplets / bubbles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around horizontally & vertically
        if (p.x > width + 20) p.x = -20;
        if (p.y > height + 20) p.y = -20;
        if (p.y < -20) p.y = height + 20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();

        // Tiny inner specular reflection
        ctx.beginPath();
        ctx.arc(p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 1.6})`;
        ctx.fill();
      });

      // 4. Render interactive ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 1.8;
        r.alpha *= 0.96;

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(165, 243, 252, ${r.alpha * 0.8})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        if (r.alpha < 0.02 || r.radius > r.maxRadius) {
          ripples.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [speedMultiplier]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-auto absolute inset-0 h-full w-full ${className}`}
    />
  );
}
