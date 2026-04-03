import * as React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    leftIcon?: React.ReactNode;
    leftIconClassName?: string;
    rightIcon?: React.ReactNode;
    onRightIconClick?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        { className, leftIconClassName, type, leftIcon, rightIcon, onRightIconClick, ...props },
        ref
    ) => {
        return (
            <div className="relative w-full">
                {leftIcon && (
                    <div
                        className={cn(
                            'absolute left-4 top-1/2 -translate-y-1/2 text-gray-400',
                            leftIconClassName
                        )}
                    >
                        {leftIcon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        'w-full rounded-[12px] border border-[#EDEDED] bg-white',
                        'font-inter font-medium text-[18px]',
                        'placeholder:text-gray-400 placeholder:font-inter placeholder:font-medium placeholder:text-[18px]',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'pt-[14px] pb-[14px]',
                        leftIcon ? 'pl-[52px]' : 'pl-4',
                        rightIcon ? 'pr-[52px]' : 'pr-4',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {rightIcon && (
                    <div
                        className={cn(
                            'absolute right-4 top-1/2 -translate-y-1/2 text-gray-400',
                            onRightIconClick && 'cursor-pointer hover:text-gray-600'
                        )}
                        onClick={onRightIconClick}
                    >
                        {rightIcon}
                    </div>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
