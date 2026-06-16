interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const PRESET_COLORS = [
  '#00f0ff', '#ff00aa', '#8a2be2', '#ffd700',
  '#00ff88', '#ff6b35', '#ffffff', '#ff3366',
];

export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-cyan-300 tracking-wide">{label}</span>
        <span className="text-xs font-mono text-pink-300 uppercase">{value}</span>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-7 h-7 rounded-lg transition-all duration-200 hover:scale-110 ${
              value.toLowerCase() === color.toLowerCase()
                ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                : 'hover:ring-1 hover:ring-cyan-400'
            }`}
            style={{ backgroundColor: color, boxShadow: value.toLowerCase() === color.toLowerCase() ? `0 0 12px ${color}` : 'none' }}
          />
        ))}
        <label className="relative w-7 h-7 rounded-lg overflow-hidden cursor-pointer group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">+</span>
          </div>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}
