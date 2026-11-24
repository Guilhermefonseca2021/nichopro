import type { ChangeEventHandler, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type AuthInputProps = {
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  autoComplete: string;
  type?: string;
  minLength?: number;
  hint?: string;
  rightSlot?: ReactNode;
};

export function AuthInput({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  autoComplete,
  type = "text",
  minLength,
  hint,
  rightSlot,
}: AuthInputProps) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#4c4356]">
        <span>{label}</span>
        {hint && <span className="font-normal text-[#9a91a2]">{hint}</span>}
      </span>
      <span className="relative block">
        <Icon
          size={17}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a198aa]"
        />
        <input
          autoComplete={autoComplete}
          type={type}
          required
          minLength={minLength}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`h-12 w-full rounded-xl border border-[#e7e2eb] bg-white pl-10 text-sm outline-none transition placeholder:text-[#aaa2b2] focus:border-[#9c60e9] focus:ring-4 focus:ring-purple-100 ${rightSlot ? "pr-12" : "pr-4"}`}
        />
        {rightSlot && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightSlot}
          </span>
        )}
      </span>
    </label>
  );
}
