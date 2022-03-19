import { getTableMetadata, Schema } from "./records";

export class Cache {
    private static STORE = 'record-sage';
    private _db?: IDBDatabase;
    private _schema?: Schema;

    private ensure<T>(value?: T) {
        if (!value) {
            throw new Error('Cache has not been initialized');
        }
        return value;
    }

    get schema() {
        return this.ensure(this._schema);
    }

    set schema(schema) {
        this._schema = schema;
    }

    get db() {
        return this.ensure(this._db);
    }

    set db(db) {
        this._db = db;
    }

    setup = async (schema: Schema) => {
        this.schema = schema;
        const request = window.indexedDB.open(Cache.STORE);
        this.db = await new Promise<IDBDatabase>((resolve, reject) => {
            request.addEventListener('success', () => resolve(request.result));
            request.addEventListener('error', reject);
            request.addEventListener('upgradeneeded', () => {
                schema.forEach(({ table }) => {
                    request.result.createObjectStore(table, { keyPath: 'id' });
                });
            });
        });
    }

    connect = async (schema: Schema) => {
        this.setup(schema);
    }

    insert = async (table: string, row: Array<string>) => {
        const transaction = this.db.transaction(table, 'readwrite')
        const store = transaction.objectStore(table);
        console.log('adding', this.convertRowArray(table, row))
        store.add(this.convertRowArray(table, row));
        return new Promise((resolve, reject) => {
            transaction.addEventListener('complete', resolve);
            transaction.addEventListener('error', reject);
        });
    }

    get = async (table: string): Promise<string[][]> => {
        const request = this.db
            .transaction(table, 'readonly')
            .objectStore(table)
            .getAll();
        return new Promise((resolve, reject) => {
            request.addEventListener('success', () => resolve(
                request.result.map(this.convertRowObject)
            ));
            request.addEventListener('error', reject);
        });
    }

    delete = async (table: string, id: string): Promise<void> => {
        const request = this.db
            .transaction(table, 'readwrite')
            .objectStore(table)
            .delete(id);
        return new Promise((resolve, reject) => {
            request.addEventListener('success', () => resolve());
            request.addEventListener('error', reject);
        });
    }

    private convertRowArray = (table: string, row: Array<string>) => {
        const { columns } = getTableMetadata(this.schema, table);
        return columns.reduce<Record<string, string>>((rowObject, column, index) => {
            rowObject[column] = row[index];
            return rowObject;
        }, {});
    }

    private convertRowObject = (row: Record<string, string>) => {
        return Object.values(row);
    }
}
