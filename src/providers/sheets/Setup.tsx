import React, { useState } from 'react'
import { useRecords } from '../../use-records';
import { schema } from '../../schema';
import { useLoading } from '../../use-loading';

export const Setup: React.VFC = () => {
    const { connect } = useRecords();
    const { isLoading, loading } = useLoading();
    const [spreadsheetId, setSpreadsheetId] = useState('');

    return (
        <>
            <div>Link to an existing spreadsheet</div>
            <form onSubmit={e => {
                e.preventDefault();
                connect({ schema, provider: { spreadsheetId } });
            }}>
                <label>
                    Spreadsheet ID:{' '}
                    <input value={spreadsheetId} onChange={(e) => setSpreadsheetId(e.target.value)} />
                </label>
                <button type="submit">Connect</button>
            </form>
            <hr />
            <button
                disabled={isLoading}
                onClick={loading(() => connect({ schema }))}
            >
                Create
            </button>
        </>
    );
}
