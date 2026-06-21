import * as React from 'react';
import { clsx } from 'clsx';
import { Search, Calendar } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            'flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm',
            'placeholder:text-slate-400 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const SearchInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        leftIcon={<Search className="h-4 w-4" />}
        placeholder="搜索学生姓名或班级..."
        className={clsx('h-12 text-base pl-11', className)}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

export const DateInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Calendar className="h-4 w-4" />
        </div>
        <input
          ref={ref}
          type="date"
          className={clsx(
            'flex h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm',
            'text-slate-700 transition-colors',
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

DateInput.displayName = 'DateInput';
