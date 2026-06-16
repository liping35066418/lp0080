interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer group">
      <span className="text-xs font-medium text-slate-300 group-hover:text-cyan-300 transition-colors">
        {label}
      </span>
      <div className="relative">
        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`w-11 h-6 rounded-full transition-all duration-300 relative ${
            checked
              ? 'bg-gradient-to-r from-cyan-500 to-pink-500 shadow-lg'
              : 'bg-slate-700 hover:bg-slate-600'
          }`}
          style={checked ? { boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)' } : {}}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 ${
              checked ? 'left-[22px]' : 'left-0.5'
            }`}
            style={checked ? { boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)' } : {}}
          />
        </button>
      </div>
    </label>
  );
}
