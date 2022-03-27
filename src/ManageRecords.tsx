import React, { useEffect, useState } from 'react'
import { useRecords } from './use-records';
import { schema } from './schema';

export const ManageRecords: React.VFC = () => {
    const [table, setTable] = useState('');
    const [rows, setRows] = useState<string[][]>([]);
    const [insert, setInsert] = useState('');
    const [syncing, setSyncing] = useState(false);
    const {
        records,
    } = useRecords();

    useEffect(() => {
        if (table) {
            records.get(table).then(setRows);
        }
    }, [records, table]);

    useEffect(() => {
        const onSyncing = () => setSyncing(true);
        const onSynced = () => {
            setSyncing(false);
            records.get(table).then(setRows);
        };
        window.addEventListener('records:syncing', onSyncing);
        window.addEventListener('records:synced', onSynced);
        return () => {
            window.removeEventListener('records:syncing', onSyncing);
            window.removeEventListener('records:synced', onSynced);
        }
    }, [records, table]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await records.insert(table, insert.split(','));
        setInsert('');
        records.get(table).then(setRows);
    };

    const onDelete = (id: string) => async () => {
        await records.delete(table, id);
        records.get(table).then(setRows);
    };

    const onSync = () => async () => {
        await records.sync();
        records.get(table).then(setRows);
    };

    return (
        <div>
            {syncing ? <div>Syncing...</div> : null}
            <select defaultValue={'empty'} onChange={e => setTable(e.target.value)}>
                <option disabled value={'empty'}>Select a table</option>
                {schema.map(({ table }) => (
                    <option key={table} value={table}>{table}</option>
                ))}
            </select>
            <br />
            <br />
            {rows.map((row) => (
                <div key={row[0]}>
                    {row.map((cell, j) => <span key={j}>{cell} </span>)}
                    <button onClick={onDelete(row[0])}>Delete</button>
                    {row[row.length - 1] === 'cached' ? (
                        <button onClick={onSync()}>Sync</button>
                    ) : null}
                </div>
            ))}
            <br />
            <form onSubmit={onSubmit}>
                <input value={insert} onChange={e => setInsert(e.target.value)} />
                <button>Submit</button>
            </form>
            <br />
        </div >
    );
}
