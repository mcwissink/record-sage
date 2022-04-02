import { Schema } from "./records";

export enum JournalAction {
    Insert = 'insert',
    Delete = 'delete',
}

interface JournalPayload<Action extends JournalAction, Payload> {
    action: Action;
    payload: Payload;
    id: string;
    table: string;
}

type JournalEntry =
    | JournalPayload<JournalAction.Insert, string[]>
    | JournalPayload<JournalAction.Delete, string>

type DatabaseSchema = Schema<IDBObjectStoreParameters | undefined>
class Database {
    private _db?: IDBDatabase;
    constructor(
        private name: string,
        private version?: number,
    ) {
    }

    private ensure<T>(value?: T) {
        if (!value) {
            throw new Error('database has not been initialized');
        }
        return value;
    }

    get db() {
        return this.ensure(this._db);
    }

    set db(db) {
        this._db = db;
    }

    resolve = <Result>(request: IDBRequest<Result>): Promise<Result> => new Promise((resolve, reject) => {
        request.addEventListener('success', () => resolve(request.result));
        request.addEventListener('error', reject);
    });

    connect = async (onUpgradeNeeded: (db: IDBDatabase) => void) => {
        const request = window.indexedDB.open(this.name, this.version);
        this.db = await new Promise((resolve, reject) => {
            request.addEventListener('success', () => resolve(request.result));
            request.addEventListener('error', reject);
            request.addEventListener('upgradeneeded', () => onUpgradeNeeded(request.result));
        });
    }

    insert = async (table: string, row: Record<string, any>) => this.resolve(
        this.db
            .transaction(table, 'readwrite')
            .objectStore(table)
            .add(row)
    );

    get = async (table: string): Promise<any[]> => this.resolve(
        this.db
            .transaction(table, 'readonly')
            .objectStore(table)
            .getAll()
    );

    find = async (table: string, id: string,): Promise<Record<string, any>> => this.resolve(
        this.db
            .transaction(table, 'readonly')
            .objectStore(table)
            .get(id)
    );

    delete = async (table: string, id: string | number) => this.resolve(
        this.db
            .transaction(table, 'readwrite')
            .objectStore(table)
            .delete(id)
    );

    transaction = async <Result>(table: string, cb: (store: IDBObjectStore) => IDBRequest<Result>) => this.resolve<Result>(
        cb(
            this.db
                .transaction(table, 'readwrite')
                .objectStore(table)
        )
    );

    disconnect = () => window.indexedDB.deleteDatabase(this.name);
}

class Journal {
    private static ENTRY = 'entry';
    constructor(
        private db = new Database('record-sage-journal'),
    ) { }

    get = (): Promise<JournalEntry[]> => this.db.get(Journal.ENTRY);

    insert = (entry: Omit<JournalEntry, 'id'>) => this.db.insert(Journal.ENTRY, entry);

    delete = (id: string | number) => this.db.delete(Journal.ENTRY, id);

    connect = async () => {
        await this.db.connect((db) => {
            db.createObjectStore(Journal.ENTRY, {
                keyPath: 'id',
                autoIncrement: true,
            })
        });
    }

    disconnect = () => this.db.disconnect();
}

export class Cache {
    private _schema?: DatabaseSchema;
    constructor(
        private db = new Database('record-sage'),
        public journal = new Journal(),
    ) { }

    private ensure<T>(value?: T) {
        if (!value) {
            throw new Error('cache has not been initialized');
        }
        return value;
    }

    get schema() {
        return this.ensure(this._schema);
    }

    set schema(schema) {
        this._schema = schema;
    }

    connect = async (schema: Schema) => {
        this.schema = schema;
        await this.db.connect(async (db) => {
            Object.keys(schema).forEach((table) => {
                db.createObjectStore(table, { keyPath: 'id' });
            });
        });
        await this.journal.connect();
    }

    insert = async (table: string, row: Array<string>) => {
        await this.db.insert(table, this.convertRowArray(table, row))
        await this.journal.insert({
            payload: row,
            table,
            action: JournalAction.Insert,
        });
    }

    get = async (table: string): Promise<string[][]> => {
        const records = await this.db.get(table);
        return records.map(this.convertRowObject);
    }

    find = async (table: string, id: string): Promise<string[]> => this.convertRowObject(
        await this.db.find(table, id),
    );

    delete = async (table: string, id: string) => {
        await this.db.delete(table, id);
        await this.journal.insert({
            payload: id,
            table,
            action: JournalAction.Delete,
        })
    }

    sync = async (cb: (entry: JournalEntry) => Promise<boolean>) => {
        const entries = await this.journal.get();
        console.log(entries);
        for (const entry of entries) {
            if (await cb(entry)) {
                await this.journal.delete(entry.id);
                if (entry.action === 'insert') {
                    await this.db.delete(entry.table, entry.payload[0]);
                }
            }
        }
        console.log(await this.journal.get());
    }

    disconnect = async () => {
        this.db.disconnect();
        this.journal.disconnect();
    }

    private convertRowArray = (table: string, row: Array<string>): Record<string, any> => {
        const { columns } = this.schema[table];
        return columns.reduce<Record<string, string>>((rowObject, column, index) => {
            rowObject[column] = row[index];
            return rowObject;
        }, {});
    }

    private convertRowObject = (row: Record<string, string>) => Object.values(row);
}
