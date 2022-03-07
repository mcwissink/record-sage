import { RecordsProvider, Schema, SetupOptions } from '../../records';
import { v4 as uuid } from 'uuid';

export class SheetsProvider extends RecordsProvider {
    constructor(
        private api: any = gapi,
        private initialized?: Promise<void>,
    ) {
        super();
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

    private static spreadsheetSchemaKey = 'spreadsheetSchema';
    private getSchema(): Schema {
        const schema = localStorage.getItem(SheetsProvider.spreadsheetSchemaKey)
        if (schema) {
            return JSON.parse(schema);
        }
        throw new Error('Failed to load schema');
    }

    private setSchema(schema: Schema) {
        return localStorage.setItem(SheetsProvider.spreadsheetSchemaKey, JSON.stringify(schema));
    }

    private static spreadsheetIdKey = 'spreadsheedId';
    private getSpreadsheetId() {
        return localStorage.getItem(SheetsProvider.spreadsheetIdKey);
    }

    private setSpreadsheetId(spreadsheetId: string) {
        localStorage.setItem(SheetsProvider.spreadsheetIdKey, spreadsheetId);
    }

    async isAuthenticated() {
        await this.initialized;
        return this.api.auth2.getAuthInstance().isSignedIn.get();
    }

    async isConnected() {
        await this.initialized;
        return Boolean(this.getSpreadsheetId());
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
        localStorage.removeItem(SheetsProvider.spreadsheetIdKey);
    }

    schema(table: string) {
        const schema = this.getSchema();
        const tableSchema = schema.find(({ table: key }) => key === table);
        if (tableSchema) {
            return tableSchema;
        }
        throw new Error('Table does not exist');
    }

    async connect(options: SetupOptions<{ spreadsheetId: string }>) {
        if ('spreadsheetId' in options) {
            await this.api.client.sheets.spreadsheets.get({
                spreadsheetId: options.spreadsheetId
            });
            this.setSpreadsheetId(options.spreadsheetId);
        } else {
            this.setSchema(options.schema);
            const schema = options.schema.concat([{
                table: 'Query',
                columns: [''],
            }]);
            const { body } = await this.api.client.sheets.spreadsheets.create({
                properties: {
                    title: `Record Sage - ${new Date().toLocaleString()}`
                },
                sheets: schema.map(({ table, columns, rows }) => ({
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
            this.setSpreadsheetId(spreadsheetId);
        }
    }

    insert = async (table: string, row: Array<string>) => {
        const start = this.getA1Notation(1, 0);
        const end = this.getA1Notation(1, row.length - 1);
        await (this.api.client as any).sheets.spreadsheets.values.append({
            spreadsheetId: this.getSpreadsheetId(),
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            range: `${table}!${start}:${end}`,
            values: [[uuid()].concat(row)],
        });
    }

    private getRowCount = async (table: string) => {
        const { body } = await this.api.client.sheets.spreadsheets.get({

            spreadsheetId: this.getSpreadsheetId(),
        });
        const { sheets } = JSON.parse(body);
        const { properties } = sheets.find((sheet: any) => sheet.properties.title === table);
        // Subtract 1 to account for header row
        return properties.gridProperties.rowCount - 1;
    }

    private getSheetId = async (table: string): Promise<string> => {
        const { body } = await this.api.client.sheets.spreadsheets.get({

            spreadsheetId: this.getSpreadsheetId(),
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
            spreadsheetId: this.getSpreadsheetId(),
            valueInputOption: 'USER_ENTERED',
            range: `Query!${start}:${end}`,
            values: [[`=MATCH("${id}", ${table}!${queryStart}:${queryEnd}, 0)`]],
            includeValuesInResponse: true,
        });
        const { updatedData } = JSON.parse(body);
        return Number(updatedData.values[0][0]);
    }

    get = async (table: string): Promise<string[][]> => {
        const rowCount = await this.getRowCount(table);
        if (rowCount > 0) {
            const start = this.getA1Notation(1, 0);
            const end = this.getA1Notation(1 + rowCount, this.schema(table).columns.length - 1);

            const { body } = await this.api.client.sheets.spreadsheets.values.get({

                spreadsheetId: this.getSpreadsheetId(),
                range: `${table}!${start}:${end}`,
            });
            const { values } = JSON.parse(body);
            return values;
        } else {
            return [];
        }
    }

    delete = async (table: string, id: string) => {
        const rowIndex = await this.getIndexById(table, id);
        await this.api.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.getSpreadsheetId(),
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
}
