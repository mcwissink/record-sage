import React from 'react';

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

export class Records {
    public Setup: React.VFC;
    public Login: React.VFC;
    private provider: RecordsProvider;
    constructor(
        { RecordsProvider, Login, Setup }: Provider,
    ) {
        this.Setup = Setup;
        this.Login = Login;
        this.provider = RecordsProvider;
    }

    isAuthenticated = async () => {
        return await this.provider.isAuthenticated();
    }

    isConnected = async () => {
        return await this.provider.isConnected();
    }

    connect = async (options: SetupOptions) => {
        return await this.provider.connect(options);
    }

    disconnect = async () => {
        return await this.provider.disconnect();
    }

    login = async () => {
        return await this.provider.login();
    }

    logout = async () => {
        return await this.provider.logout();
    }

    schema = (table: string) => {
        return this.provider.schema(table);
    }

    insert = async (table: string, row: Array<string>) => {
        return await this.provider.insert(table, row);
    }

    get = async (table: string) => {
        return await this.provider.get(table);
    }

    delete = async (table: string, id: string) => {
        return await this.provider.delete(table, id);
    }
}

export type SetupOptions<T extends Record<string, any> = Record<string, any>> = {
    schema: Schema
} | T;

export class RecordsProvider {
    async connect(_options: SetupOptions): Promise<void> {
        throw new Error(`'connect' is not implemented`);
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
    schema(_table: string) {
        throw new Error(`'schema' is not implemented`);
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

