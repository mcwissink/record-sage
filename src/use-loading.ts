import { useState } from 'react';

export const useLoading = () => {
    const [isLoading, setLoading] = useState(false);
    return {
        isLoading,
        loading: <Args extends any[]>(fn: (...args: Args) => Promise<any>) => async (...args: Args) => {
            setLoading(true);
            await fn(...args);
            setLoading(false);
        }
    }
}
