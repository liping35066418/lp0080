import { useAppStore } from '@/store/useAppStore';

export default function Header() {
  const stats = useAppStore((s) => s.stats);

  return (
    <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
      <div
        className="h-24 flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(to bottom, rgba(10, 14, 39, 0.8) 0%, rgba(10, 14, 39, 0.4) 60%, transparent 100%)',
        }}
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <h1
            className="text-2xl font-bold tracking-[0.3em] uppercase"
            style={{
              background: 'linear-gradient(90deg, #00f0ff 0%, #8a2be2 50%, #ff00aa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(0, 240, 255, 0.5)',
              fontFamily: '"Orbitron", "PingFang SC", sans-serif',
            }}
          >
            大屏签到墙
          </h1>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent" />
        </div>

        <div className="flex items-center gap-8">
          <div className="text-[10px] font-mono tracking-widest text-slate-500">
            SIGNATURE WALL SYSTEM v1.0
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono text-cyan-400/80">
              {stats.signCount} PARTICLES ACTIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
