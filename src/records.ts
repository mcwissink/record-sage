import React from 'react';
import { v4 as uuid } from 'uuid';
import { Cache, JournalAction } from './cache';
import { online } from './utils';

export type Schema<T = any> = Record<string, {
    columns: string[];
    rows?: Array<Array<number | string>>;
    options?: T;
}>;

export type Provider = {
    RecordsProvider: RecordsProvider;
    Login: React.VFC;
    Setup: React.VFC;
}

export class Records {
    private static SCHEMA_KEY = 'schema';
    public Setup: React.VFC;
    public Login: React.VFC;
    private provider: RecordsProvider;
    private cache: Cache;
    private _schema?: Schema;
    constructor(
        { RecordsProvider, Login, Setup }: Provider,
    ) {
        this.Setup = Setup;
        this.Login = Login;
        this.provider = RecordsProvider;
        this.cache = new Cache();
        if (this.isSetup()) {
            this.cache.connect(this.schema);
            online(this.provider.connect)(this.schema);
        }

        window.addEventListener('online', async () => {
            await this.provider.connect(this.schema);
            await this.sync();
        });
    }

    get schema() {
        if (!this._schema) {
            const schema = localStorage.getItem(Records.SCHEMA_KEY)
            if (!schema) {
                throw new Error('missing schema');
            }
            this._schema = JSON.parse(schema) as Schema;
        }
        return this._schema;
    }

    set schema(schema: Schema) {
        localStorage.setItem(Records.SCHEMA_KEY, JSON.stringify(schema));
    }

    isSetup = () => localStorage.getItem(Records.SCHEMA_KEY);

    isAuthenticated = () => online(this.provider.isAuthenticated, true)();

    isConnected = () => online(this.provider.isConnected, true)();

    setup = async (options: RecordsSetupOptions) => {
        if (options.schema) {
            this.schema = options.schema;
        }
        const schema = options.schema || this.schema;

        await this.cache.connect(schema);
        await this.provider.setup({ ...options, schema });
    }

    disconnect = async () => {
        localStorage.removeItem(Records.SCHEMA_KEY);
        await this.provider.disconnect();
        await this.cache.disconnect();
    }

    login = () => this.provider.login();

    logout = async () => {
        await this.disconnect();
        return await this.provider.logout();
    };

    insert = async (table: string, row: Array<string>) => {
        await this.cache.insert(table, [this.generateId()].concat(row));
        await online(this.sync)();
    }

    get = async (table: string): Promise<string[][]> => (await this.cache.get(table)).concat(await online(this.provider.get, [])(table));

    private generateId() {
        return uuid();
    }

    delete = async (table: string, id: string) => {
        await this.cache.delete(table, id);
        await online(this.sync)();
    }

    sync = async () => {
        window.dispatchEvent(new Event('records:syncing'));
        await this.cache.sync(async (entry) => {
            try {
                switch (entry.action) {
                    case JournalAction.Insert:
                        await this.provider.insert(entry.table, entry.payload);
                        break;
                    case JournalAction.Delete:
                        await this.provider.delete(entry.table, entry.payload);
                        break;
                }
                return true;
            } catch {
                return false;
            }
        });
        window.dispatchEvent(new Event('records:synced'));
    }
}

type ProviderSetup = Record<string, any>;
export type RecordsSetupOptions<T extends ProviderSetup = ProviderSetup> = {
    schema: Schema
    provider?: T;
};

export class RecordsProvider {
    async connect(_schema: Schema): Promise<void> {
        throw new Error(`'connect' is not implemented`);
    }
    async setup(_options: RecordsSetupOptions): Promise<void> {
        throw new Error(`'setup' is not implemented`);
    }
    async disconnect(): Promise<void> {
        throw new Error(`'disconnect' is not implemented`);
    }
    async isAuthenticated() {
        return false;
    };
    async isConnected() {
        return false;
    };
    async login() {
        return await this.isAuthenticated();
    }
    async logout() {
        return await this.isAuthenticated();
    }
    async insert(_table: string, _row: Array<string>) {
        throw new Error(`'insert' is not implemented`);
    }
    async get(_table: string): Promise<any> {
        throw new Error(`'get' is not implemented`);
    }
    async find(_table: string, _id: string): Promise<any> {
        throw new Error(`'find' is not implemented`);
    }
    async update(_table: string): Promise<any> {
        throw new Error(`'update' is not implemented`);
    }
    async delete(_table: string, _id: string): Promise<any> {
        throw new Error(`'delete' is not implemented`);
    }
}

