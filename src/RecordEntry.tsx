import React, { useEffect, useState } from 'react'
import { useRecords } from './use-records';
import { schema } from './schema';

export const RecordEntry: React.VFC = () => {
    const [table, setTable] = useState('');
    const [rows, setRows] = useState<string[][]>([]);
    const [insert, setInsert] = useState('');
    const {
        records,
        disconnect,
    } = useRecords();

    useEffect(() => {
        if (table) {
            records.get(table).then(setRows);
        }
    }, [records, table]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await records.insert(table, insert.split(','));
        setInsert('');
        records.get(table).then(setRows);
    };

    return (
        <div>
            <select defaultValue={'empty'} onChange={e => setTable(e.target.value)}>
                <option disabled value={'empty'}>Select a table</option>
                {schema.map(({ table }) => (
                    <option key={table} value={table}>{table}</option>
                ))}
            </select>
            <br />
            <br />
            {rows.map((row, i) => (
                <div key={i}>
                    {row.map((cell, j) => <span key={j}>{cell}</span>)}
                </div>
            ))}
            <br />
            <form onSubmit={onSubmit}>
                <input onChange={e => setInsert(e.target.value)} />
                <button>Submit</button>
            </form>
            <br />
            <button onClick={disconnect}>Disconnect</button>
        </div >
    );
}
