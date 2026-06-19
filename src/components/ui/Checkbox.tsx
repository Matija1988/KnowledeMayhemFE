import type { InputHTMLAttributes } from "react";

export function Checkbox({ className = "", type: _type, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} type="checkbox" className={`ui-checkbox ${className}`.trim()} />;
}
