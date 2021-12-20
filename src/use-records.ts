import create from 'zustand';
import { Records, SetupOptions } from './records';
import * as Providers from './providers';

const records = new Records(Providers.Sheets);

export const Setup = records.Setup;
export const Login = records.Login;

type State = {
    isInitialized: boolean;
    isAuthenticated: boolean;
    isConnected: boolean;
    records: Records;
    connect: (options: SetupOptions) => void;
    disconnect: () => void;
    initialize: () => void;
    login: () => void;
    logout: () => void;
}
export const useRecords = create<State>((set, get) => ({
    isInitialized: false,
    isAuthenticated: false,
    isConnected: false,
    records,
    connect: async (options) => {
        await get().records.connect(options)
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
