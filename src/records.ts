import React from 'react';
import { v4 as uuid } from 'uuid';
import { Cache } from './cache';

export type Schema = Array<{
    table: string;
    columns: string[];
    rows?: Array<Array<number | string>>;
}>;

export type Provider = {
    RecordsProvider: RecordsProvider;
    Login: React.VFC;
    Setup: React.VFC;
}

export const getTableMetadata = (schema: Schema, table: string) => {
    const metadata = schema.find(({ table: key }) => key === table);
    if (!metadata) {
        throw new Error('table not in schema')
    }
    return metadata;
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
            this.provider.connect(this.schema);
        }
    }

    get schema() {
        if (!this._schema) {
            const schema = localStorage.getItem(Records.SCHEMA_KEY)
            if (!schema) {
                throw new Error('Missing schema');
            }
            this._schema = JSON.parse(schema) as Schema;
        }
        return this._schema;
    }

    set schema(schema: Schema) {
        localStorage.setItem(Records.SCHEMA_KEY, JSON.stringify(schema));
    }

    isSetup = () => localStorage.getItem(Records.SCHEMA_KEY);

    isAuthenticated = async () => {
        return await this.provider.isAuthenticated();
    }

    isConnected = async () => {
        return await this.provider.isConnected();
    }

    connect = async (options: RecordsSetupOptions) => {
        if (options.schema) {
            this.schema = options.schema;
        }
        const schema = options.schema || this.schema;

        await this.cache.setup(schema);
        return await this.provider.setup({ ...options, schema });
    }

    disconnect = async () => {
        localStorage.removeItem(Records.SCHEMA_KEY);
        return await this.provider.disconnect();
    }

    login = async () => {
        return await this.provider.login();
    }

    logout = async () => {
        return await this.provider.logout();
    }

    insert = async (table: string, row: Array<string>) => {
        const rowWithId = [this.generateId()].concat(row);
        // await this.cache.insert(table, rowWithId);
        return await this.provider.insert(table, rowWithId);
    }

    get = async (table: string) => {
        const cachedData = await this.cache.get(table);
        return cachedData.map(data => [...data, 'cached']).concat(
            await this.provider.get(table)
        );
    }

    private generateId() {
        return uuid();
    }

    delete = async (table: string, id: string) => {
        await this.cache.delete(table, id);
        // return await this.provider.delete(table, id);
    }
}

type ProviderSetup = Record<string, any>;
export type RecordsSetupOptions<T extends ProviderSetup = ProviderSetup> = {
    schema: Schema
    provider?: never;
} | {
    schema?: never;
    provider: T
};

export type ProviderSetupOptions<T extends ProviderSetup = ProviderSetup> = {
    schema: Schema
    provider?: T;
};

export class RecordsProvider {
    async connect(_schema: Schema): Promise<void> {
        throw new Error(`'connect' is not implemented`);
    }
    async setup(_options: ProviderSetupOptions): Promise<void> {
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
    async update(_table: string): Promise<any> {
        throw new Error(`'update' is not implemented`);
    }
    async delete(_table: string, _id: string): Promise<any> {
        throw new Error(`'delete' is not implemented`);
    }
}

