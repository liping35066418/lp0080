import type { EffectConfig, SignEvent } from './types.js';
import { particleEngine } from './particleEngine.js';
import { configManager } from './configManager.js';

const DEFAULT_NAMES = [
  '张伟', '王芳', '李娜', '刘洋', '陈静', '杨磊', '赵敏', '黄强',
  '周杰', '吴优', '徐明', '孙悦', '马超', '朱琳', '胡军', '郭涛',
  '何雪', '高翔', '林风', '罗雨', '郑华', '梁爽', '谢婷', '宋凯',
  '唐宁', '许诺', '韩梅', '冯刚', '邓超', '曹颖', '彭博', '曾黎',
  '萧蔷', '田亮', '董卿', '袁泉', '潘玮', '于谦', '蒋欣', '蔡琴',
  '余文乐', '杜淳', '叶璇', '程蝶衣', '苏有朋', '魏晨', '吕方',
  '丁俊晖', '任贤齐', '沈腾', '姚晨', '卢靖姗', '姜文', '崔健',
  '章子怡', '谭维维', '廖凡', '范晓萱', '汪峰', '陆毅', '金莎',
];

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

export type OnSignCallback = (event: SignEvent) => void;

export class SignScheduler {
  private timer: ReturnType<typeof setInterval> | null = null;
  private interval: number = 1500;
  private customNames: string[] = [];
  private onSignCallbacks: OnSignCallback[] = [];
  private spiralIndex: number = 0;
  private matrixIndex: number = 0;
  private randomPositions: { x: number; y: number }[] = [];

  onSign(callback: OnSignCallback): () => void {
    this.onSignCallbacks.push(callback);
    return () => {
      this.onSignCallbacks = this.onSignCallbacks.filter(cb => cb !== callback);
    };
  }

  start(interval?: number, names?: string[]): void {
    this.stop();
    if (interval) this.interval = interval;
    if (names && names.length > 0) this.customNames = names;

    this.timer = setInterval(() => {
      this.triggerSign();
    }, this.interval);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  isRunning(): boolean {
    return this.timer !== null;
  }

  triggerSign(customName?: string): SignEvent {
    const name = customName || this.getRandomName();
    const config = configManager.get();
    const position = this.getNextPosition(config);

    const event: SignEvent = {
      id: `sign-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      timestamp: Date.now(),
      targetX: position.x,
      targetY: position.y,
      color: this.getRandomColor(config),
    };

    particleEngine.registerSignEvent(event);
    particleEngine.addSignature(event, config);

    this.onSignCallbacks.forEach(cb => {
      try {
        cb(event);
      } catch (e) {
        console.error('Sign callback error:', e);
      }
    });

    return event;
  }

  reset(): void {
    this.spiralIndex = 0;
    this.matrixIndex = 0;
    this.randomPositions = [];
  }

  private getRandomName(): string {
    const pool = this.customNames.length > 0 ? this.customNames : DEFAULT_NAMES;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  private getRandomColor(config: EffectConfig): string {
    if (!config.effects.colorGradient) {
      return config.gradientStart;
    }
    const colors = ['#00f0ff', '#ff00aa', '#8a2be2', '#ffd700', '#00ff88', '#ff6b35'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private getNextPosition(config: EffectConfig): { x: number; y: number } {
    const padding = 100;

    switch (config.layoutMode) {
      case 'spiral':
        return this.getSpiralPosition(padding);
      case 'matrix':
        return this.getMatrixPosition(config, padding);
      case 'random':
      default:
        return this.getRandomPosition(padding);
    }
  }

  private getSpiralPosition(padding: number): { x: number; y: number } {
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    const maxRadius = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) / 2 - padding;

    this.spiralIndex++;
    const t = this.spiralIndex * 0.3;
    const radius = Math.min(t * 8, maxRadius);
    const angle = t * 1.2;

    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    return {
      x: Math.max(padding, Math.min(CANVAS_WIDTH - padding, x)),
      y: Math.max(padding, Math.min(CANVAS_HEIGHT - padding, y)),
    };
  }

  private getMatrixPosition(config: EffectConfig, padding: number): { x: number; y: number } {
    const cols = Math.max(6, Math.floor(12 / config.textDensity));
    const rows = Math.max(4, Math.floor(8 / config.textDensity));
    const cellW = (CANVAS_WIDTH - padding * 2) / cols;
    const cellH = (CANVAS_HEIGHT - padding * 2) / rows;

    const col = this.matrixIndex % cols;
    const row = Math.floor(this.matrixIndex / cols) % rows;

    this.matrixIndex++;

    return {
      x: padding + cellW * (col + 0.5) + (Math.random() - 0.5) * cellW * 0.3,
      y: padding + cellH * (row + 0.5) + (Math.random() - 0.5) * cellH * 0.3,
    };
  }

  private getRandomPosition(padding: number): { x: number; y: number } {
    return {
      x: padding + Math.random() * (CANVAS_WIDTH - padding * 2),
      y: padding + Math.random() * (CANVAS_HEIGHT - padding * 2),
    };
  }
}

export const signScheduler = new SignScheduler();
