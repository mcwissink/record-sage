import React from 'react';
import { useRecords, Setup, Login } from './use-records';
import { RecordEntry } from './RecordEntry';

export const App: React.FC = () => {
    const {
        isInitialized,
        isAuthenticated,
        isConnected,
    } = useRecords();

    return (
        <div className="App">
            {isInitialized ? (
                isAuthenticated ? (
                    isConnected ? (
                        <RecordEntry />
                    ) : <Setup />
                ) : <Login />
            ) : <div>Loading...</div>}
        </div>
    );
}
