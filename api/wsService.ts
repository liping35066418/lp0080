import { WebSocketServer, WebSocket } from 'ws';
import type { Server as HttpServer } from 'http';
import type { ClientMessage, ServerMessage, EffectConfig } from './types.js';
import { configManager } from './configManager.js';
import { particleEngine } from './particleEngine.js';
import { signScheduler } from './signScheduler.js';

const BROADCAST_INTERVAL = 50;
const STATS_INTERVAL = 1000;

export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private broadcastTimer: ReturnType<typeof setInterval> | null = null;
  private statsTimer: ReturnType<typeof setInterval> | null = null;
  private startTime: number = Date.now();
  private frameCount: number = 0;
  private lastFpsTime: number = Date.now();
  private currentFps: number = 0;

  attach(server: HttpServer): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      console.log('WebSocket client connected. Total clients:', this.clients.size);

      this.sendToClient(ws, { type: 'config', payload: configManager.get() });
      this.sendToClient(ws, { type: 'particle:update', payload: particleEngine.getActiveParticles() });

      ws.on('message', (data) => {
        try {
          const message: ClientMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (e) {
          console.error('Invalid message:', e);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('WebSocket client disconnected. Total clients:', this.clients.size);
      });

      ws.on('error', (err) => {
        console.error('WebSocket error:', err);
        this.clients.delete(ws);
      });
    });

    this.startBroadcast();
    this.startStats();

    signScheduler.onSign((event) => {
      this.broadcast({ type: 'sign:event', payload: event });
    });
  }

  private handleMessage(ws: WebSocket, msg: ClientMessage): void {
    switch (msg.type) {
      case 'ping':
        this.sendToClient(ws, { type: 'pong' });
        break;

      case 'config': {
        const config = configManager.update(msg.payload as Partial<EffectConfig>);
        this.broadcast({ type: 'config', payload: config });
        break;
      }

      case 'sim:start':
        signScheduler.start(msg.payload.interval, msg.payload.names);
        break;

      case 'sim:stop':
        signScheduler.stop();
        break;

      case 'sign': {
        const event = signScheduler.triggerSign(msg.payload.name);
        this.broadcast({ type: 'sign:event', payload: event });
        break;
      }

      case 'reset':
        particleEngine.reset();
        signScheduler.reset();
        signScheduler.stop();
        this.broadcast({ type: 'reset:done' });
        this.broadcast({ type: 'particle:update', payload: particleEngine.getActiveParticles() });
        break;
    }
  }

  private sendToClient(ws: WebSocket, msg: ServerMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  private broadcast(msg: ServerMessage): void {
    const data = JSON.stringify(msg);
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }

  private startBroadcast(): void {
    this.broadcastTimer = setInterval(() => {
      const config = configManager.get();

      if (config.effects.particleFloat) {
        const activeCount = particleEngine.getActiveParticles().filter(p => p.type === 'floating').length;
        if (activeCount < config.particleCount) {
          particleEngine.createFloatingParticles(
            Math.min(5, config.particleCount - activeCount),
            config
          );
        }
      }

      const particles = particleEngine.update(config);
      this.frameCount++;

      this.broadcast({ type: 'particle:update', payload: particles });
    }, BROADCAST_INTERVAL);
  }

  private startStats(): void {
    this.statsTimer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - this.lastFpsTime;
      if (elapsed > 0) {
        this.currentFps = Math.round((this.frameCount * 1000) / elapsed);
      }
      this.frameCount = 0;
      this.lastFpsTime = now;

      this.broadcast({
        type: 'stats',
        payload: {
          fps: this.currentFps,
          signCount: particleEngine.getSignCount(),
          activeParticles: particleEngine.getActiveParticles().length,
          uptime: Math.floor((Date.now() - this.startTime) / 1000),
        },
      });
    }, STATS_INTERVAL);
  }

  getClientCount(): number {
    return this.clients.size;
  }
}

export const wsService = new WebSocketService();
