import * as React from 'react';
import { clsx } from 'clsx';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 3, label, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-slate-700">{label}</label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={clsx(
            'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700',
            'placeholder:text-slate-400 transition-colors resize-none',
            'focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
