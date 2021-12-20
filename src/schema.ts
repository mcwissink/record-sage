import { Schema } from "./records";

export const schema: Schema = [
    {
        table: 'ChemicalApplication',
        columns: ['date', 'field', 'crop', 'acres', 'chemical', 'amount']
    },
    {
        table: 'Chemical',
        columns: ['name']
    },
    {
        table: 'Field',
        columns: ['name']
    },
];
