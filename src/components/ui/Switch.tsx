import React from "react";

interface SwitchProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked = false, onChange, disabled = false, id, className = "" }) => {
    return (
        <label className={`relative inline-flex cursor-pointer items-center ${className}`}>
            <input
                type="checkbox"
                className="peer sr-only"
                checked={checked}
                onChange={(e) => onChange?.(e.target.checked)}
                disabled={disabled}
                id={id}
            />
            <div className="peer relative h-6 w-11 rounded-full bg-gray-200 shadow-md peer-checked:bg-emerald-600 peer-focus:ring-2 peer-focus:ring-black after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
        </label>
    );
};
