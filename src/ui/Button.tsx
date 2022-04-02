import React from 'react';
import { useLoading } from '../use-loading';

export const Button: React.FC<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    onClick?: () => Promise<void>;
    loading?: boolean;
}> = ({
    children,
    onClick,
    loading: isLoadingProp,
    ...props
}) => {
        const { isLoading: isLoadingClick, loading } = useLoading();
        const isLoading = isLoadingClick || isLoadingProp;
        return (
            <button
                onClick={onClick ? loading(onClick) : undefined}
                disabled={isLoading}
                {...props}
            >
                {children}
            </button>
        );
    }
