import React from 'react';
import { useRecords, Setup, Login } from './records-store';
import { RecordList } from './RecordList';
import { Progress } from './ui/Progress';

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
            ) : <Progress />}
        </div>
    );
}
