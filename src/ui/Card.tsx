import React from 'react'
import cn from 'classnames';

export const Card: React.FC<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>> = ({
    children,
    className,
    ...props
}) => {
    return (
        <div
            {...props}
            className={cn('shadow p-4 bg-gray-100 rounded', {
                'bg-gray-100 hover:bg-gray-200 cursor-pointer': props.onClick
            }, className)}
        >
            {children}
        </div>
    );
}
