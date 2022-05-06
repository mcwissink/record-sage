import React from 'react';
import { useRecords, Setup, Login } from './records-store';
import { RecordList } from './RecordList';

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
                        <RecordList />
                    ) : <Setup />
                ) : <Login />
            ) : <div>Loading...</div>}
        </div>
    );
}
