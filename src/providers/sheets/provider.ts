import { RecordsProvider, Schema, RecordsSetupOptions } from '../../records';
import gapi from './../../gapi';

export class SheetsProvider extends RecordsProvider {
    private initialized?: Promise<void>;
    private api: any = gapi;
    private _schema?: Schema;
    private _spreadsheetId?: string;

    private initialize = async () => {
        if (!this.initialized) {
            this.initialized = new Promise((resolve, reject) => {
                this.api.load('client:auth2', async () => {
                    try {
                        await this.api.client.init({
                            apiKey: 'AIzaSyCNEjUa-oT-sppE2yix52q4KeudcJpdIXw',
                            clientId: '794158492809-ukkr1lfsml3ghmclr4po0rfongru44dq.apps.googleusercontent.com',
                            scope: 'https://www.googleapis.com/auth/spreadsheets',
                            discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
                        });
                        resolve();
                    } catch (error) {
                        console.error(error);
                        reject(error);
                    }
                });
            });
        }
        return this.initialized;
    }

    private ensure<T>(value?: T) {
        if (!value) {
            throw new Error('provider has not been initialized');
        }
        return value;
    }

    get schema() {
        return this.ensure(this._schema);
    }

    set schema(schema) {
        this._schema = schema;
    }

    // https://docs.microsoft.com/en-US/office/troubleshoot/excel/convert-excel-column-numbers
    // Convert zero-based row/column index to A1 notation 
    private static alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    private getA1Notation(row: number, column: number) {
        let a1Column = '';
        let columnReducer = column + 1;
        while (--columnReducer >= 0) {
            const quotient = Math.floor(columnReducer / 26);
            const remainder = columnReducer % 26;
            a1Column = SheetsProvider.alphabet[remainder] + a1Column;
            columnReducer = quotient;
        }
        return `${a1Column}${row + 1}`;
    }

    private static SPREADSHEET_ID_KEY = 'spreadsheedId';
    get spreadsheetId() {
        if (!this._spreadsheetId) {
            const spreadsheetId = localStorage.getItem(SheetsProvider.SPREADSHEET_ID_KEY);
            if (!spreadsheetId) {
                throw new Error('missing spreadsheet ID');
            }
            this._spreadsheetId = spreadsheetId;
        }
        return this._spreadsheetId;
    }
    set spreadsheetId(spreadsheetId: string) {
        localStorage.setItem(SheetsProvider.SPREADSHEET_ID_KEY, spreadsheetId);
    }

    isAuthenticated = async () => {
        await this.initialize();
        return this.api.auth2.getAuthInstance().isSignedIn.get();
    }

    isConnected = async () => {
        await this.initialize();
        return Boolean(localStorage.getItem(SheetsProvider.SPREADSHEET_ID_KEY));
    }

    async login() {
        await this.api.auth2.getAuthInstance().signIn()
        return this.isAuthenticated();
    }

    async logout() {
        await this.api.auth2.getAuthInstance().signOut();
        return this.isAuthenticated();
    }

    async disconnect() {
        localStorage.removeItem(SheetsProvider.SPREADSHEET_ID_KEY);
    }

    connect = async (schema: Schema) => {
        await this.initialize();
        this.schema = schema;
    }

    async setup(options: RecordsSetupOptions<{ spreadsheetId: string }>) {
        await this.initialize();
        this.schema = options.schema;
        if (options.provider) {
            await this.api.client.sheets.spreadsheets.get({
                spreadsheetId: options.provider.spreadsheetId
            });
            this.spreadsheetId = options.provider.spreadsheetId;
        } else {
            const schema: Schema = {
                ...options.schema,
                query: {
                    columns: [''],
                }
            };
            const { body } = await this.api.client.sheets.spreadsheets.create({
                properties: {
                    title: `record sage - ${new Date().toLocaleString()}`
                },
                sheets: Object.entries(schema).map(([table, { columns, rows }]) => ({
                    properties: {
                        title: table,
                        gridProperties: {
                            rowCount: (rows?.length ?? 0) + 1,
                            columnCount: columns.length,
                        },
                    },
                    data: [
                        {
                            startRow: 0,
                            startColumn: 0,
                            rowData: [
                                {
                                    values: columns.map(header => ({
                                        userEnteredValue: {
                                            stringValue: String(header)
                                        }
                                    }))
                                }
                            ].concat(rows?.map(row => ({
                                values: row.map(value => ({
                                    userEnteredValue: {
                                        stringValue: String(value)
                                    }
                                }))
                            })) ?? []),
                        },
                    ],
                })),
            });
            const { spreadsheetId } = JSON.parse(body);
            this.spreadsheetId = spreadsheetId;
        }
    }

    insert = async (table: string, row: Array<string>) => {
        const start = this.getA1Notation(1, 0);
        const end = this.getA1Notation(1, row.length - 1);
        await this.api.client.sheets.spreadsheets.values.append({
            spreadsheetId: this.spreadsheetId,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            range: SheetsProvider.range(table, start, end),
            values: [row],
        });
    }

    private getRowCount = async (table: string) => {
        const { body } = await this.api.client.sheets.spreadsheets.get({

            spreadsheetId: this.spreadsheetId,
        });
        const { sheets } = JSON.parse(body);
        const { properties } = sheets.find((sheet: any) => sheet.properties.title === table);
        // Subtract 1 to account for header row
        return properties.gridProperties.rowCount - 1;
    }

    private getSheetId = async (table: string): Promise<string> => {
        const { body } = await this.api.client.sheets.spreadsheets.get({

            spreadsheetId: this.spreadsheetId,
        });
        const { sheets } = JSON.parse(body);
        const { properties } = sheets.find((sheet: any) => sheet.properties.title === table);
        return properties.sheetId;
    }

    private getIndexById = async (table: string, id: string): Promise<number> => {
        const rowCount = await this.getRowCount(table);
        const start = this.getA1Notation(0, 0);
        const end = this.getA1Notation(0, 0);
        const queryStart = this.getA1Notation(1, 0);
        const queryEnd = this.getA1Notation(1 + rowCount, 0);
        const { body } = await this.api.client.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            valueInputOption: 'USER_ENTERED',
            range: SheetsProvider.range('query', start, end),
            values: [[`=MATCH("${id}", '${table}'!${queryStart}:${queryEnd}, 0)`]],
            includeValuesInResponse: true,
        });
        const { updatedData } = JSON.parse(body);
        const index = Number(updatedData.values[0][0]);
        return isNaN(index) ? -1 : index;
    }

    get = async (table: string): Promise<string[][]> => {
        const rowCount = await this.getRowCount(table);
        if (rowCount > 0) {
            const { columns } = this.schema[table];
            const start = this.getA1Notation(1, 0);
            const end = this.getA1Notation(1 + rowCount, columns.length - 1);

            const { body } = await this.api.client.sheets.spreadsheets.values.get({

                spreadsheetId: this.spreadsheetId,
                range: SheetsProvider.range(table, start, end),
            });
            const { values } = JSON.parse(body);
            return values;
        } else {
            return [];
        }
    }

    find = async (table: string, id: string) => {
        const rowIndex = await this.getIndexById(table, id);
        if (rowIndex === -1) {
            return null;
        }
        const { columns } = this.schema[table];
        const start = this.getA1Notation(1, 0);
        const end = this.getA1Notation(rowIndex, columns.length - 1);

        const { body } = await this.api.client.sheets.spreadsheets.values.get({

            spreadsheetId: this.spreadsheetId,
            range: SheetsProvider.range(table, start, end),
        });
        const { values } = JSON.parse(body);
        return values;
    }

    delete = async (table: string, id: string) => {
        const rowIndex = await this.getIndexById(table, id);
        if (rowIndex === -1) {
            return;
        }
        await this.api.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            requests: [
                {
                    deleteDimension: {
                        range: {
                            sheetId: await this.getSheetId(table),
                            dimension: 'ROWS',
                            startIndex: rowIndex,
                            endIndex: rowIndex + 1,
                        }
                    }
                }
            ]
        });
    }

    private static range = (table: string, start: string, end: string) => `'${table}'!${start}:${end}`;
}
