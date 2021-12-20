import React, { useEffect } from 'react';
import { useRecords, Setup, Login } from './use-records';
import { RecordEntry } from './RecordEntry';
import './App.css';

const App: React.FC = () => {
    const {
        initialize,
        isInitialized,
        isAuthenticated,
        isConnected,
    } = useRecords();

    useEffect(() => {
        initialize();
    }, [initialize]);

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

export default App;
