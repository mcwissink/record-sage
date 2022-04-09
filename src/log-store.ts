import vanilla from 'zustand/vanilla';
import create from 'zustand';

export const logStore = vanilla<{
    message: string;
}>(() => ({
    message: '',
}));


export const log = <Result = any, Args extends any[] = any[]>(message: string, fn: (...args: Args) => Promise<Result>) => async (...args: Args): Promise<Result> => {
    logStore.setState({ message: `${message}:starting` })
    console.log(message);
    const result = await fn(...args);
    logStore.setState({ message: `${message}:done` })
    return result;
}

export const useLog = create(logStore);
