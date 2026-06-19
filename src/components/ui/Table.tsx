import type { HTMLAttributes, ReactNode, TableHTMLAttributes } from "react";

type TableProps = TableHTMLAttributes<HTMLTableElement> & {
  caption?: string;
  children: ReactNode;
};

export function Table({ caption, children, className = "", ...props }: TableProps) {
  return (
    <div className="ui-table-wrap">
      <table {...props} className={`ui-table ${className}`.trim()}>
        {caption ? <caption>{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

export function EmptyTableState({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={`ui-empty-state ${className}`.trim()}>
      {children}
    </div>
  );
}
