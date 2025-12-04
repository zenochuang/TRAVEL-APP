import React from 'react';
import { ICONS, ICON_KEYS } from '../constants';
import { IconName } from '../types';

interface IconPickerProps {
  selected: IconName;
  onSelect: (icon: IconName) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-8 gap-2 p-2 max-h-48 overflow-y-auto">
      {ICON_KEYS.map((key) => {
        const Icon = ICONS[key];
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`p-2 rounded-lg flex items-center justify-center transition-all ${
              selected === key 
                ? 'bg-primary text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]' 
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
};
