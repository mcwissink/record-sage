import React from 'react';
import { log } from './app-store';
import { v4 as uuid } from 'uuid';
import { Cache, JournalAction } from './cache';
import { Schema } from './schema';
import { online } from './utils/online';

export type Provider = {
    RecordsProvider: RecordsProvider;
    Login: React.VFC;
    Setup: React.VFC;
}

export interface Pagination {
    offset: number;
    limit: number;
    id?: string;
}

export type GetOptions = Pagination | null;

export interface Paginated<T> extends Pagination {
    rows: T;
    total: number;
}

export type PartialRow<T extends keyof Schema> = {
    [C in Schema[T]['columns'][number]]: string;
}

export type Row<T extends keyof Schema> = PartialRow<T> & { id: string };

export type Rows<T extends keyof Schema> = Record<string, Row<T>>;

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

    isSetup = () => localStorage.getItem(Records.SCHEMA_KEY) && this.provider.isSetup();

    isAuthenticated = () => online(this.provider.isAuthenticated, true)();

    isConnected = () => online(this.provider.isConnected, true)();

    setup = log('records:setup', async (options: RecordsSetupOptions) => {
        if (options.schema) {
            this.schema = options.schema;
        }
        const schema = options.schema || this.schema;

        await this.cache.connect(schema);
        await this.provider.setup({ ...options, schema });
        const tables = Object.keys(this.schema) as Array<keyof Schema>;
        await Promise.all(tables.map(this.syncTable));
    });

    disconnect = log('records:disconnect', async () => {
        localStorage.removeItem(Records.SCHEMA_KEY);
        await this.provider.disconnect();
        await this.cache.disconnect();
    });

    login = log('records:login', () => this.provider.login());

    logout = log('records:logout', async () => {
        await this.disconnect();
        return await this.provider.logout();
    });

    insert = log('records:insert', async <T extends keyof Schema>(table: T, row: Omit<Row<T>, 'id'>) => {
        await this.cache.insert(table, {
            id: this.generateId(),
            ...row,
        } as Row<T>);
        const response = online(this.sync)();
        if (!this.schema[table].cache) {
            await response;
        }
    });

    get = log('records:get', async <T extends keyof Schema>(table: T, options?: GetOptions): Promise<Paginated<Rows<T>>> => {
        const cache = await this.cache.get(table, options);
        return this.schema[table].cache ? cache : await online(this.provider.get, cache)(table, options);
    });

    find = log('records:find', async <T extends keyof Schema>(table: T, id: string): Promise<Row<T> | undefined> => {
        return await online(this.provider.find, undefined)(table, id);
    });

    query = log('records:query', async <T extends keyof Schema>(table: T, query: string): Promise<Paginated<Rows<T>>> => {
        return await online(this.provider.query, {
            rows: {},
            total: 0,
            limit: 0,
            offset: 0,
        })(table, query);
    });

    private generateId() {
        return uuid();
    }

    delete = log('records:delete', async <T extends keyof Schema>(table: T, id: string) => {
        await this.cache.delete(table, id);
        online(this.sync)();
    });

    private syncTable = async <T extends keyof Schema>(table: T) => {
        const { rows } = await this.provider.get(
            table,
            this.schema[table].cache ? null : { limit: 5, offset: 0 }
        );
        await this.cache.reset(table, rows);
    }

    sync = log('records:sync', async () => {
        window.dispatchEvent(new Event('records:syncing'));
        const updates = await this.cache.sync(async (entry) => {
            try {
                switch (entry.action) {
                    case JournalAction.Insert:
                        await log(`sync:inserting:${entry.id}`, this.provider.insert)(entry.table, entry.payload as Row<typeof entry.table>);
                        break;
                    case JournalAction.Delete:
                        await log(`sync:deleting:${entry.id}`, this.provider.delete)(entry.table, entry.payload);
                        break;
                }
                return true;
            } catch (error) {
                console.error(error);
                return false;
            }
        }) as Array<keyof Schema>;
        await Promise.all(updates.map(this.syncTable));

        window.dispatchEvent(new Event('records:synced'));
    });

    generateCloneUrl = () => this.provider.generateCloneUrl();
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
    isSetup() {
        return false;
    };
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
    async insert<T extends keyof Schema>(_table: T, _row: Row<T>) {
        throw new Error(`'insert' is not implemented`);
    }
    async get<T extends keyof Schema>(_table: string, _options?: GetOptions): Promise<Paginated<Rows<T>>> {
        throw new Error(`'get' is not implemented`);
    }
    async find<T extends keyof Schema>(_table: string, _id: string): Promise<Row<T>> {
        throw new Error(`'find' is not implemented`);
    }
    async query<T extends keyof Schema>(_table: string, _query: string): Promise<Paginated<Rows<T>>> {
        throw new Error(`'query' is not implemented`);
    }
    async update(_table: string): Promise<any> {
        throw new Error(`'update' is not implemented`);
    }
    async delete(_table: string, _id: string): Promise<any> {
        throw new Error(`'delete' is not implemented`);
    }
    generateCloneUrl(): string {
        throw new Error(`'generateCloeUrl' is not implemented`);
    }
}

