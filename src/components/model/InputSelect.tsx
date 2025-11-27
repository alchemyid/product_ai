import React from 'react';

interface Props {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
}

const InputSelect: React.FC<Props> = ({ label, value, onChange, options, placeholder = "Select..." }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5 hover:bg-slate-750 transition-colors"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
};

export default InputSelect;