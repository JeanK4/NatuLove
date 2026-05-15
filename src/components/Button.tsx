import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  icon?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  icon,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]";
  const variants = {
    primary:
      "bg-natu-600 text-white hover:bg-natu-700 shadow-sm shadow-natu-600/20",
    secondary:
      "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {icon}
      {children}
    </button>
  );
}
