export interface EffectConfig {
  textSize: number;
  textDensity: number;
  fallSpeed: number;
  gradientStart: string;
  gradientEnd: string;
  particleCount: number;
  particleSpeed: number;
  layoutMode: 'spiral' | 'matrix' | 'random';
  effects: {
    signatureFall: boolean;
    colorGradient: boolean;
    particleFloat: boolean;
    starfield: boolean;
    glowBurst: boolean;
  };
}

export interface SignEvent {
  id: string;
  name: string;
  timestamp: number;
  targetX: number;
  targetY: number;
  color: string;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'signature' | 'floating' | 'burst';
  text?: string;
  color: string;
  alpha: number;
  size: number;
  rotation: number;
  settled: boolean;
  life: number;
  maxLife: number;
}

export interface RuntimeStats {
  fps: number;
  signCount: number;
  activeParticles: number;
  uptime: number;
}

export type ClientMessage =
  | { type: 'config'; payload: Partial<EffectConfig> }
  | { type: 'sim:start'; payload: { interval: number; names?: string[] } }
  | { type: 'sim:stop' }
  | { type: 'sign'; payload: { name: string } }
  | { type: 'reset' }
  | { type: 'ping' };

export type ServerMessage =
  | { type: 'config'; payload: EffectConfig }
  | { type: 'particle:update'; payload: Particle[] }
  | { type: 'sign:event'; payload: SignEvent }
  | { type: 'stats'; payload: RuntimeStats }
  | { type: 'reset:done' }
  | { type: 'pong' };
