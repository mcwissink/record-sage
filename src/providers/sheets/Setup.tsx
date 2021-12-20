import React, { useState } from 'react'
import { useRecords } from '../../use-records';
import { schema } from '../../schema';

export const Setup: React.VFC = () => {
    const { connect } = useRecords();
    const [spreadsheetId, setSpreadsheetId] = useState('');

    return (
        <>
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
