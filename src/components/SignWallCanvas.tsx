import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
}

export default function SignWallCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);
  const scanlineOffsetRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const config = useAppStore((s) => s.config);
  const particles = useAppStore((s) => s.particles);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
      initStars();
    };

    const initStars = () => {
      const count = 200;
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.clientWidth,
        y: Math.random() * canvas.clientHeight,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      }));
    };

    const drawBackground = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.8);
      gradient.addColorStop(0, '#0d1233');
      gradient.addColorStop(0.5, '#0a0e27');
      gradient.addColorStop(1, '#050715');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    };

    const drawStars = () => {
      if (!config.effects.starfield) return;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(timeRef.current * star.twinkleSpeed * 10) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * twinkle})`;
        ctx.fill();
      });

      const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.8);
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
    };

    const drawGrid = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const gridSize = 60;

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
      ctx.lineWidth = 1;

      for (let x = 0; x <= w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      for (let y = 0; y <= h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    };

    const drawScanlines = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const scanlineSpacing = 4;
      scanlineOffsetRef.current = (scanlineOffsetRef.current + 0.5) % (scanlineSpacing * 2);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';

      for (let y = scanlineOffsetRef.current; y < h; y += scanlineSpacing * 2) {
        ctx.fillRect(0, y, w, scanlineSpacing);
      }
    };

    const drawParticle = (p: typeof particles[0]) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const scaleX = w / 1920;
      const scaleY = h / 1080;

      const x = p.x * scaleX;
      const y = p.y * scaleY;

      if (p.type === 'signature' && p.text) {
        drawSignature(p, x, y);
      } else if (p.type === 'floating') {
        drawFloatingParticle(p, x, y);
      } else if (p.type === 'burst') {
        drawBurstParticle(p, x, y);
      }
    };

    const drawSignature = (p: typeof particles[0], x: number, y: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;

      const fontSize = p.size;
      const gradient = ctx.createLinearGradient(-50, 0, 50, 0);
      if (config.effects.colorGradient) {
        gradient.addColorStop(0, config.gradientStart);
        gradient.addColorStop(0.5, p.color);
        gradient.addColorStop(1, config.gradientEnd);
      } else {
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, p.color);
      }

      if (p.settled) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 20;
      } else {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
      }

      ctx.font = `bold ${fontSize}px "Orbitron", "PingFang SC", "Microsoft YaHei", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = gradient;
      ctx.fillText(p.text || '', 0, 0);

      if (p.settled) {
        ctx.shadowBlur = 40;
        ctx.fillStyle = `rgba(0, 240, 255, 0.15)`;
        ctx.beginPath();
        ctx.arc(0, 0, fontSize * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const drawFloatingParticle = (p: typeof particles[0], x: number, y: number) => {
      if (!config.effects.particleFloat) return;

      ctx.save();
      ctx.globalAlpha = p.alpha * 0.8;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawBurstParticle = (p: typeof particles[0], x: number, y: number) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 15;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      timeRef.current++;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      ctx.clearRect(0, 0, w, h);

      drawBackground();
      drawGrid();
      drawStars();

      const floatingParticles = particles.filter((p) => p.type === 'floating');
      const burstParticles = particles.filter((p) => p.type === 'burst');
      const signatureParticles = particles.filter((p) => p.type === 'signature');

      floatingParticles.forEach(drawParticle);
      signatureParticles.forEach(drawParticle);
      burstParticles.forEach(drawParticle);

      drawScanlines();

      rafRef.current = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize);
    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [particles, config]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
