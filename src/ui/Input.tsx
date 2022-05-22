import React from 'react';
import cn from 'classnames';

type Props = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, Props>(({
    className,
    ...props
}, ref) => (
    <input
        ref={ref}
        className={cn('p-1', className)}
        {...props}
    />
));
