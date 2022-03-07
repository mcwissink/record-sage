import React, { useState } from 'react'
import { useRecords } from '../../use-records';
import { schema } from '../../schema';

export const Setup: React.VFC = () => {
    const { connect, logout } = useRecords();
    const [spreadsheetId, setSpreadsheetId] = useState('');

    return (
        <>
            <button onClick={logout}>Logout</button>
            <div>Link to an existing spreadsheet</div>
            <form onSubmit={e => {
                e.preventDefault();
                connect({ spreadsheetId });
            }}>
                <label>
                    Spreadsheet ID:{' '}
                    <input value={spreadsheetId} onChange={(e) => setSpreadsheetId(e.target.value)} />
                </label>
                <button type="submit">Submit</button>
            </form>
            <hr />
            <button onClick={() => connect({ schema })}>Create</button>
        </>
    );
}
