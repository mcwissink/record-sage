import React from 'react';
import cn from 'classnames';

type Props = React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, Props>(({
    className,
    ...props
}, ref) => (
    <select
        ref={ref}
        className={cn('p-1', className)}
        {...props}
    />
));
