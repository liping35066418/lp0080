import type { EffectConfig, Particle, SignEvent } from './types.js';

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

export class ParticleEngine {
  private particles: Map<string, Particle> = new Map();
  private settledSignatures: Particle[] = [];
  private signCount: number = 0;

  addSignature(signEvent: SignEvent, config: EffectConfig): Particle {
    const particle: Particle = {
      id: signEvent.id,
      x: config.effects.signatureFall ? Math.random() * CANVAS_WIDTH : signEvent.targetX,
      y: config.effects.signatureFall ? -50 : signEvent.targetY,
      vx: config.effects.signatureFall ? (Math.random() - 0.5) * 2 : 0,
      vy: config.effects.signatureFall ? config.fallSpeed + Math.random() * 2 : 0,
      type: 'signature',
      text: signEvent.name,
      color: signEvent.color,
      alpha: 0,
      size: config.textSize,
      rotation: (Math.random() - 0.5) * 0.4,
      settled: !config.effects.signatureFall,
      life: 0,
      maxLife: Infinity,
    };
    this.particles.set(particle.id, particle);
    this.signCount++;
    return particle;
  }

  addBurst(x: number, y: number, color: string, count: number = 12): Particle[] {
    const bursts: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      const burst: Particle = {
        id: `burst-${Date.now()}-${i}-${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        type: 'burst',
        color,
        alpha: 1,
        size: 3 + Math.random() * 4,
        rotation: 0,
        settled: false,
        life: 0,
        maxLife: 40 + Math.random() * 20,
      };
      this.particles.set(burst.id, burst);
      bursts.push(burst);
    }
    return bursts;
  }

  update(config: EffectConfig): Particle[] {
    const toRemove: string[] = [];

    this.particles.forEach((p, id) => {
      if (p.type === 'signature') {
        this.updateSignature(p, config, toRemove, id);
      } else if (p.type === 'burst') {
        this.updateBurst(p, toRemove, id);
      } else if (p.type === 'floating') {
        this.updateFloating(p, config);
      }
    });

    toRemove.forEach(id => this.particles.delete(id));
    return this.getActiveParticles();
  }

  private updateSignature(p: Particle, config: EffectConfig, toRemove: string[], id: string) {
    if (p.alpha < 1) {
      p.alpha = Math.min(1, p.alpha + 0.05);
    }

    if (!p.settled) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.y >= 100 + (this.settledSignatures.length % 10) * 80) {
        p.vy *= 0.92;
      }

      const signEvent = this.findSignEvent(id);
      const targetY = signEvent ? signEvent.targetY : CANVAS_HEIGHT / 2;
      const targetX = signEvent ? signEvent.targetX : CANVAS_WIDTH / 2;

      if (Math.abs(p.y - targetY) < 5 && Math.abs(p.vy) < 0.5) {
        p.settled = true;
        p.x = targetX;
        p.y = targetY;
        p.vx = 0;
        p.vy = 0;
        p.rotation = 0;
        this.settledSignatures.push(p);

        if (config.effects.glowBurst) {
          this.addBurst(targetX, targetY, p.color, 16);
        }
      }
    }
  }

  private updateBurst(p: Particle, toRemove: string[], id: string) {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.96;
    p.vy *= 0.96;
    p.life++;
    p.alpha = Math.max(0, 1 - p.life / p.maxLife);
    p.size *= 0.98;

    if (p.life >= p.maxLife || p.alpha <= 0) {
      toRemove.push(id);
    }
  }

  private updateFloating(p: Particle, config: EffectConfig) {
    p.x += p.vx * config.particleSpeed;
    p.y += p.vy * config.particleSpeed;

    if (p.x < 0) p.x = CANVAS_WIDTH;
    if (p.x > CANVAS_WIDTH) p.x = 0;
    if (p.y < 0) p.y = CANVAS_HEIGHT;
    if (p.y > CANVAS_HEIGHT) p.y = 0;

    p.alpha = 0.3 + Math.sin(Date.now() * 0.001 + p.x * 0.01) * 0.2;
  }

  createFloatingParticles(count: number, _config: EffectConfig): Particle[] {
    const colors = ['#00f0ff', '#ff00aa', '#8a2be2', '#ffd700', '#ffffff'];
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const p: Particle = {
        id: `float-${Date.now()}-${i}-${Math.random()}`,
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        type: 'floating',
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.3 + Math.random() * 0.4,
        size: 1 + Math.random() * 2.5,
        rotation: 0,
        settled: false,
        life: 0,
        maxLife: Infinity,
      };
      this.particles.set(p.id, p);
      newParticles.push(p);
    }
    return newParticles;
  }

  getActiveParticles(): Particle[] {
    return Array.from(this.particles.values());
  }

  getSignCount(): number {
    return this.signCount;
  }

  reset(): void {
    this.particles.clear();
    this.settledSignatures = [];
    this.signCount = 0;
  }

  private signEvents: Map<string, SignEvent> = new Map();

  registerSignEvent(event: SignEvent): void {
    this.signEvents.set(event.id, event);
  }

  private findSignEvent(id: string): SignEvent | undefined {
    return this.signEvents.get(id);
  }

  getSettledCount(): number {
    return this.settledSignatures.length;
  }
}

export const particleEngine = new ParticleEngine();
