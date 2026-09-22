import { useEffect, useRef } from 'react';

interface WaterRippleCanvasProps {
  className?: string;
  theme?: 'light' | 'dark';
}

interface WaveRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  amplitude: number;
  wavelength: number;
  age: number;
  maxAge: number;
  decay: number;
  alpha: number;
}

export function WaterRippleCanvas({ className = '', theme = 'light' }: WaterRippleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const ripples: WaveRipple[] = [];

    const addRipple = (x: number, y: number, strength = 1.0) => {
      ripples.push({
        x,
        y,
        radius: 2,
        maxRadius: Math.min(width, height) * (0.35 + Math.random() * 0.2) * (strength > 1 ? 1.25 : 1),
        speed: (2.0 + Math.random() * 0.6) * Math.min(1.4, Math.max(0.7, strength)),
        amplitude: 22 * strength,
        wavelength: 22,
        age: 0,
        maxAge: 180 * (strength > 1 ? 1.25 : 1),
        decay: 0.982,
        alpha: Math.min(1.0, 0.85 * strength)
      });
    };

    // Auto-spawn subtle natural water raindrops periodically for a living water surface
    const dropInterval = setInterval(() => {
      if (ripples.length < 9) {
        addRipple(
          Math.random() * width,
          Math.random() * height,
          0.7 + Math.random() * 0.5
        );
      }
    }, 1200);

    // Initial ripples
    addRipple(width * 0.28, height * 0.38, 1.2);
    addRipple(width * 0.72, height * 0.55, 1.0);
    addRipple(width * 0.5, height * 0.75, 0.9);

    // Interactive mouse move ripples
    let lastMoveTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastMoveTime > 90) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        addRipple(x, y, 0.75);
        lastMoveTime = now;
      }
    };

    // Interactive click splash ripples
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addRipple(x, y, 1.9);
      setTimeout(() => addRipple(x, y, 1.2), 160);
      setTimeout(() => addRipple(x, y, 0.7), 320);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    let time = 0;

    const render = () => {
      time += 0.014;
      ctx.clearRect(0, 0, width, height);

      // 1. Water Base Gradient (Pastel Water Tones)
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      if (theme === 'dark') {
        bgGrad.addColorStop(0, '#041726'); // Deep ocean teal
        bgGrad.addColorStop(0.45, '#03253d'); // Twilight turquoise
        bgGrad.addColorStop(1, '#051b2c'); // Deep calm blue
      } else {
        bgGrad.addColorStop(0, '#e0f2fe'); // Soft pale sky blue
        bgGrad.addColorStop(0.3, '#ccfbf1'); // Delicate pastel mint
        bgGrad.addColorStop(0.65, '#e0e7ff'); // Light lavender periwinkle
        bgGrad.addColorStop(1, '#dbeafe'); // Tranquil pool water
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Underlying Ambient Caustic Light Net (Ánh nước lung linh)
      const numLines = 5;
      for (let c = 0; c < numLines; c++) {
        ctx.beginPath();
        const baseY = (height / (numLines + 1)) * (c + 1);
        ctx.moveTo(0, baseY);

        for (let x = 0; x <= width; x += 16) {
          const waveHeight =
            Math.sin(x * 0.0035 + time * 1.2 + c * 1.7) * 26 +
            Math.cos(x * 0.006 - time * 0.9 + c) * 16;
          ctx.lineTo(x, baseY + waveHeight);
        }

        ctx.strokeStyle =
          theme === 'dark'
            ? `rgba(56, 189, 248, ${0.15 + c * 0.04})`
            : `rgba(255, 255, 255, ${0.75 - c * 0.05})`;
        ctx.lineWidth = 18 + c * 4;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // 3. Concentric Water Ripples (Gợn Sóng Nước Lan Tỏa)
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.age += 1;
        r.radius += r.speed;
        r.alpha *= r.decay;

        // Render multiple concentric rings per ripple
        const ringCount = 3;
        for (let j = 0; j < ringCount; j++) {
          const ringRadius = r.radius - j * r.wavelength;
          if (ringRadius <= 0) continue;

          // Normalized envelope for smooth fade-in and fade-out
          const progress = ringRadius / r.maxRadius;
          const envelope = Math.sin(progress * Math.PI);
          const ringAlpha = r.alpha * (1 - (j * 0.28)) * envelope;

          if (ringAlpha <= 0.004) continue;

          // Crest of the wave (bright specular highlight on the water rim)
          ctx.beginPath();
          ctx.arc(r.x, r.y, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle =
            theme === 'dark'
              ? `rgba(56, 189, 248, ${ringAlpha * 2.5})`
              : `rgba(255, 255, 255, ${ringAlpha * 3.5})`;
          ctx.lineWidth = Math.max(2.5, 7.0 * (1 - r.age / r.maxAge));
          ctx.stroke();

          // Trough of the wave (refraction shadow ring creating 3D depth)
          ctx.beginPath();
          ctx.arc(r.x, r.y, ringRadius + 3.5, 0, Math.PI * 2);
          ctx.strokeStyle =
            theme === 'dark'
              ? `rgba(2, 6, 23, ${ringAlpha * 1.5})`
              : `rgba(14, 116, 144, ${ringAlpha * 0.9})`;
          ctx.lineWidth = 4.0;
          ctx.stroke();
        }

        if (r.age > r.maxAge || r.alpha < 0.008 || r.radius > r.maxRadius) {
          ripples.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(dropInterval);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-auto absolute inset-0 h-full w-full ${className}`}
    />
  );
}
