import React from 'react';
import clsx from 'clsx';

type ButtonStyle = 'submit' | 'cancel' | 'default';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  buttonStyle?: ButtonStyle;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  buttonStyle = 'default',
  disabled = false,
  className,
  ...props
}) => {
  const baseStyles = clsx(
    'px-4 py-2 rounded border-2 font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
    'shadow-md hover:shadow-lg active:shadow-sm',
    'font-cinzel tracking-wide',
    'disabled:cursor-not-allowed disabled:shadow-none'
  );
  
  const styleVariants = {
    submit: clsx(
      'bg-emerald-900 text-emerald-100 border-emerald-700',
      'hover:bg-emerald-800 hover:border-emerald-600',
      'focus:ring-emerald-700',
      'disabled:bg-emerald-900/50 disabled:border-emerald-800/50 disabled:text-emerald-100/50'
    ),
    cancel: clsx(
      'bg-amber-900 text-amber-100 border-amber-700',
      'hover:bg-amber-800 hover:border-amber-600',
      'focus:ring-amber-700',
      'disabled:bg-amber-900/50 disabled:border-amber-800/50 disabled:text-amber-100/50'
    ),
    default: clsx(
      'bg-gray-800 text-gray-100 border-gray-600',
      'hover:bg-gray-700 hover:border-gray-500',
      'focus:ring-gray-600',
      'disabled:bg-gray-800/50 disabled:border-gray-700/50 disabled:text-gray-100/50'
    ),
  };

  return (
    <button
      className={clsx(
        baseStyles,
        styleVariants[buttonStyle],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {label}
    </button>
  );
}; 