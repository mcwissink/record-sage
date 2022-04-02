import create from 'zustand/vanilla';
import { Records, RecordsSetupOptions } from './records';
import * as Providers from './providers';

export const records = new Records(Providers.Sheets);

export const store = create<{
    isInitialized: boolean;
    isAuthenticated: boolean;
    isConnected: boolean;
    isOnline: boolean;
    records: Records;
    setup: (options: RecordsSetupOptions) => Promise<void>;
    disconnect: () => void;
    initialize: () => void;
    login: () => void;
    logout: () => void;
}>((set, get) => ({
    isOnline: navigator.onLine,
    isInitialized: false,
    isAuthenticated: false,
    isConnected: false,
    records,
    setup: async (options) => {
        await get().records.setup(options)
        set({
            isConnected: await get().records.isConnected(),
        })
    },
    disconnect: async () => {
        await get().records.disconnect()
        set({
            isConnected: await get().records.isConnected(),
        })
    },
    initialize: async () => set({
        isInitialized: true,
        isAuthenticated: await get().records.isAuthenticated(),
        isConnected: await get().records.isConnected(),
    }),
    login: async () => set({
        isAuthenticated: await get().records.login()
    }),
    logout: async () => set({
        isAuthenticated: await get().records.logout()
    }),
}));

const setOnline = () => store.setState({ isOnline: navigator.onLine });

window.addEventListener('online', setOnline);
window.addEventListener('offline', setOnline);
