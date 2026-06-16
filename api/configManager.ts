import type { EffectConfig } from './types.js';

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

export class ConfigManager {
  private config: EffectConfig = { ...DEFAULT_CONFIG, effects: { ...DEFAULT_CONFIG.effects } };

  get(): EffectConfig {
    return { ...this.config, effects: { ...this.config.effects } };
  }

  update(partial: Partial<EffectConfig>): EffectConfig {
    if (partial.effects) {
      this.config.effects = { ...this.config.effects, ...partial.effects };
    }
    const { effects: _e, ...rest } = partial;
    void _e;
    Object.assign(this.config, rest);
    return this.get();
  }

  reset(): EffectConfig {
    this.config = { ...DEFAULT_CONFIG, effects: { ...DEFAULT_CONFIG.effects } };
    return this.get();
  }
}

export const configManager = new ConfigManager();
