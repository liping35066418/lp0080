import { Activity, Users, Sparkles, Clock, Wifi, WifiOff } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function StatusBar() {
  const stats = useAppStore((s) => s.stats);
  const connected = useAppStore((s) => s.connected);
  const simRunning = useAppStore((s) => s.simRunning);
  const recentSigns = useAppStore((s) => s.recentSigns);

  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-14 z-10 flex items-center justify-between px-6"
      style={{
        background: 'linear-gradient(to top, rgba(10, 14, 39, 0.9) 0%, rgba(10, 14, 39, 0.6) 50%, transparent 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Activity className="w-4 h-4 text-cyan-400" />
            {stats.fps >= 50 && (
              <div className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            FPS: <span className={`${stats.fps >= 50 ? 'text-green-400' : stats.fps >= 30 ? 'text-yellow-400' : 'text-red-400'} font-bold`}>{stats.fps}</span>
          </span>
        </div>

        <div className="w-px h-4 bg-slate-700/50" />

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-pink-400" />
          <span className="text-[11px] font-mono text-slate-400">
            签到: <span className="text-pink-300 font-bold">{stats.signCount}</span> 人
          </span>
        </div>

        <div className="w-px h-4 bg-slate-700/50" />

        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-[11px] font-mono text-slate-400">
            粒子: <span className="text-purple-300 font-bold">{stats.activeParticles}</span>
          </span>
        </div>

        <div className="w-px h-4 bg-slate-700/50" />

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-400" />
          <span className="text-[11px] font-mono text-slate-400">
            运行: <span className="text-yellow-300 font-bold">{formatUptime(stats.uptime)}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {simRunning && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-medium text-green-400 tracking-wider uppercase">
              Simulation Running
            </span>
          </div>
        )}

        {recentSigns.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 max-w-[200px] overflow-hidden">
            <span
              className="text-[10px] text-cyan-300 font-medium truncate"
              style={{ textShadow: `0 0 8px ${recentSigns[0].color}` }}
            >
              最近: {recentSigns[0].name}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {connected ? (
            <Wifi className="w-4 h-4 text-green-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-[10px] font-mono ${connected ? 'text-green-400' : 'text-red-400'}`}>
            {connected ? 'WS OK' : 'WS FAIL'}
          </span>
        </div>
      </div>
    </div>
  );
}
