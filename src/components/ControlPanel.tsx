import { useState } from 'react';
import { ChevronLeft, ChevronRight, Settings, Sparkles, Users, RotateCcw, Play, Pause, Plus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import Slider from './ui/Slider';
import Toggle from './ui/Toggle';
import ColorPicker from './ui/ColorPicker';

interface ControlPanelProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function ControlPanel({ collapsed, onToggleCollapse }: ControlPanelProps) {
  const config = useAppStore((s) => s.config);
  const simRunning = useAppStore((s) => s.simRunning);
  const signInterval = useAppStore((s) => s.signInterval);
  const customSignName = useAppStore((s) => s.customSignName);
  const setSignInterval = useAppStore((s) => s.setSignInterval);
  const setCustomSignName = useAppStore((s) => s.setCustomSignName);
  const connected = useAppStore((s) => s.connected);

  const { updateConfig, startSimulation, stopSimulation, triggerSign, doReset } = useWebSocket();

  const [activeTab, setActiveTab] = useState<'effects' | 'signs'>('effects');

  const handleToggleEffect = (key: keyof typeof config.effects) => {
    updateConfig({
      effects: { ...config.effects, [key]: !config.effects[key] },
    });
  };

  if (collapsed) {
    return (
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20">
        <button
          onClick={onToggleCollapse}
          className="w-10 h-20 rounded-l-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 flex items-center justify-center hover:bg-slate-800/90 transition-all group"
          style={{ boxShadow: '-4px 0 20px rgba(0, 240, 255, 0.15)' }}
        >
          <ChevronLeft className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 group-hover:-translate-x-0.5 transition-all" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="absolute right-0 top-0 h-full w-80 z-20 flex flex-col"
      style={{
        background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(15, 20, 50, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(0, 240, 255, 0.2)',
        boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="text-sm font-bold tracking-widest text-cyan-300 uppercase">
            Control Panel
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {connected ? 'ONLINE' : 'OFFLINE'}
          </span>
          <button
            onClick={onToggleCollapse}
            className="w-7 h-7 rounded-lg bg-slate-800/50 hover:bg-slate-700/70 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="flex border-b border-cyan-500/20">
        <button
          onClick={() => setActiveTab('effects')}
          className={`flex-1 py-3 text-xs font-medium tracking-wide transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'effects'
              ? 'text-cyan-300 border-b-2 border-cyan-400 bg-cyan-500/5'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          动效配置
        </button>
        <button
          onClick={() => setActiveTab('signs')}
          className={`flex-1 py-3 text-xs font-medium tracking-wide transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'signs'
              ? 'text-cyan-300 border-b-2 border-cyan-400 bg-cyan-500/5'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          签到模拟
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'effects' ? (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-purple-300 tracking-wider uppercase">
                  文字参数
                </span>
              </div>

              <Slider
                label="文字大小"
                value={config.textSize}
                min={12}
                max={72}
                unit="px"
                onChange={(v) => updateConfig({ textSize: v })}
              />
              <Slider
                label="排列密度"
                value={config.textDensity}
                min={0.1}
                max={2.0}
                step={0.1}
                onChange={(v) => updateConfig({ textDensity: v })}
              />
              <Slider
                label="飘落速度"
                value={config.fallSpeed}
                min={0.5}
                max={5.0}
                step={0.1}
                onChange={(v) => updateConfig({ fallSpeed: v })}
              />

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-cyan-300 tracking-wide">排列模式</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['spiral', 'matrix', 'random'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateConfig({ layoutMode: mode })}
                      className={`py-2 px-2 rounded-lg text-[10px] font-medium tracking-wide transition-all ${
                        config.layoutMode === mode
                          ? 'bg-gradient-to-r from-cyan-500/30 to-pink-500/30 text-white border border-cyan-400/50'
                          : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {mode === 'spiral' ? '螺旋' : mode === 'matrix' ? '矩阵' : '随机'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-xs font-semibold text-pink-300 tracking-wider uppercase">
                  色彩渐变
                </span>
              </div>

              <ColorPicker
                label="起始颜色"
                value={config.gradientStart}
                onChange={(v) => updateConfig({ gradientStart: v })}
              />
              <ColorPicker
                label="结束颜色"
                value={config.gradientEnd}
                onChange={(v) => updateConfig({ gradientEnd: v })}
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-300 tracking-wider uppercase">
                  粒子参数
                </span>
              </div>

              <Slider
                label="背景粒子数量"
                value={config.particleCount}
                min={0}
                max={500}
                unit="个"
                onChange={(v) => updateConfig({ particleCount: v })}
              />
              <Slider
                label="粒子浮动速度"
                value={config.particleSpeed}
                min={0.1}
                max={3.0}
                step={0.1}
                onChange={(v) => updateConfig({ particleSpeed: v })}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs font-semibold text-yellow-300 tracking-wider uppercase">
                  特效开关
                </span>
              </div>

              <div className="space-y-1 p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
                <Toggle
                  label="签名飘落动效"
                  checked={config.effects.signatureFall}
                  onChange={() => handleToggleEffect('signatureFall')}
                />
                <Toggle
                  label="文字色彩渐变"
                  checked={config.effects.colorGradient}
                  onChange={() => handleToggleEffect('colorGradient')}
                />
                <Toggle
                  label="粒子浮动效果"
                  checked={config.effects.particleFloat}
                  onChange={() => handleToggleEffect('particleFloat')}
                />
                <Toggle
                  label="背景星空特效"
                  checked={config.effects.starfield}
                  onChange={() => handleToggleEffect('starfield')}
                />
                <Toggle
                  label="定格光爆特效"
                  checked={config.effects.glowBurst}
                  onChange={() => handleToggleEffect('glowBurst')}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-purple-300 tracking-wider uppercase">
                  单次签到
                </span>
              </div>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={customSignName}
                  onChange={(e) => setCustomSignName(e.target.value)}
                  placeholder="输入签到姓名（可选）"
                  className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-900/80 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                />
                <button
                  onClick={() => {
                    triggerSign(customSignName || undefined);
                    setCustomSignName('');
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-medium hover:from-cyan-400 hover:to-purple-400 transition-all flex items-center gap-1.5"
                  style={{ boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)' }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  签到
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Play className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-xs font-semibold text-pink-300 tracking-wider uppercase">
                  循环模拟
                </span>
              </div>

              <Slider
                label="签到间隔"
                value={signInterval}
                min={300}
                max={5000}
                step={100}
                unit="ms"
                onChange={setSignInterval}
              />

              <div className="flex gap-2 mt-4">
                {!simRunning ? (
                  <button
                    onClick={() => startSimulation(signInterval)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold tracking-wide hover:from-green-400 hover:to-emerald-400 transition-all flex items-center justify-center gap-2"
                    style={{ boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' }}
                  >
                    <Play className="w-4 h-4" />
                    开始模拟
                  </button>
                ) : (
                  <button
                    onClick={stopSimulation}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold tracking-wide hover:from-orange-400 hover:to-red-400 transition-all flex items-center justify-center gap-2"
                    style={{ boxShadow: '0 0 20px rgba(249, 115, 22, 0.3)' }}
                  >
                    <Pause className="w-4 h-4" />
                    停止模拟
                  </button>
                )}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-semibold text-red-300 tracking-wider uppercase">
                  重置操作
                </span>
              </div>

              <button
                onClick={doReset}
                className="w-full py-3 rounded-xl bg-slate-900/80 border border-red-500/30 text-red-300 text-sm font-medium hover:bg-red-500/10 hover:border-red-500/50 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                重置签到墙
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
