import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "info" | "success" | "warning" | "danger";
};

export function Badge({ children, tone = "info" }: BadgeProps) {
  return <span className={`ui-badge ui-badge--${tone}`}>{children}</span>;
}
