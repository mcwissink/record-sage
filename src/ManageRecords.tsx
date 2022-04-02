import React, { useEffect, useState } from 'react'
import { useRecords } from './use-records';
import { schema } from './schema';
import { useLoading } from './use-loading';

export const ManageRecords: React.VFC = () => {
    const [table, setTable] = useState(Object.keys(schema)[0]);
    const [rows, setRows] = useState<string[][]>([]);
    const [insert, setInsert] = useState('');
    const [syncing, setSyncing] = useState(false);
    const { isLoading, loading } = useLoading();
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

    return (
        <div>
            {syncing ? <div>Syncing...</div> : null}
            <select defaultValue={'empty'} onChange={e => setTable(e.target.value)}>
                {Object.keys(schema).map((table) => (
                    <option key={table} value={table}>{table}</option>
                ))}
            </select>
            <br />
            <table>
                <thead>
                    <tr>
                        {schema[table].columns.map((column) =>
                            <td className="p-2" key={column}><b>{column}</b></td>
                        )}
                        <td className="p-2"><b>actions</b></td>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (

                        <tr key={row[0]}>
                            {row.map((cell, j) =>
                                <td className="p-2" key={j}>{cell} </td>
                            )}
                            <td className="p-2">
                                <button onClick={onDelete(row[0])}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <br />
            <form onSubmit={loading(onSubmit)}>
                <input disabled={!table} value={insert} onChange={e => setInsert(e.target.value)} />
                <button disabled={isLoading}>Submit</button>
            </form>
            <br />
        </div >
    );
}
