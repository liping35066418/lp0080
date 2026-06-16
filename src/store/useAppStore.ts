import { create } from 'zustand';
import type { EffectConfig, Particle, SignEvent, RuntimeStats } from '@/types';

interface AppState {
  config: EffectConfig;
  particles: Particle[];
  recentSigns: SignEvent[];
  stats: RuntimeStats;
  connected: boolean;
  simRunning: boolean;
  signInterval: number;
  customSignName: string;

  setConfig: (config: EffectConfig) => void;
  setParticles: (particles: Particle[]) => void;
  addSignEvent: (event: SignEvent) => void;
  setStats: (stats: RuntimeStats) => void;
  setConnected: (connected: boolean) => void;
  setSimRunning: (running: boolean) => void;
  setSignInterval: (interval: number) => void;
  setCustomSignName: (name: string) => void;
  reset: () => void;
}

const DEFAULT_CONFIG: EffectConfig = {
  textSize: 32,
  textDensity: 0.8,
  fallSpeed: 2.0,
  gradientStart: '#00f0ff',
  gradientEnd: '#ff00aa',
  particleCount: 100,
  particleSpeed: 0.8,
  layoutMode: 'spiral',
  effects: {
    signatureFall: true,
    colorGradient: true,
    particleFloat: true,
    starfield: true,
    glowBurst: true,
  },
};

const DEFAULT_STATS: RuntimeStats = {
  fps: 0,
  signCount: 0,
  activeParticles: 0,
  uptime: 0,
};

export const useAppStore = create<AppState>((set) => ({
  config: DEFAULT_CONFIG,
  particles: [],
  recentSigns: [],
  stats: DEFAULT_STATS,
  connected: false,
  simRunning: false,
  signInterval: 1500,
  customSignName: '',

  setConfig: (config) => set({ config }),
  setParticles: (particles) => set({ particles }),
  addSignEvent: (event) =>
    set((state) => ({
      recentSigns: [event, ...state.recentSigns].slice(0, 20),
    })),
  setStats: (stats) => set({ stats }),
  setConnected: (connected) => set({ connected }),
  setSimRunning: (simRunning) => set({ simRunning }),
  setSignInterval: (signInterval) => set({ signInterval }),
  setCustomSignName: (customSignName) => set({ customSignName }),
  reset: () => set({ particles: [], recentSigns: [], stats: DEFAULT_STATS }),
}));
