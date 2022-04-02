import React, { useEffect } from 'react';
import { useRecords, Setup, Login } from './use-records';
import { RecordEntry } from './RecordEntry';
import './App.css';
import { ManageRecords } from './ManageRecords';

const App: React.FC = () => {
    const {
        initialize,
        isInitialized,
        isAuthenticated,
        isConnected,
        isOnline,
        disconnect,
        logout
    } = useRecords();

    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <div className="App">
            {isInitialized ? (
                isAuthenticated ? (
                    <>
                        {isOnline ? (
                            <>
                                <button onClick={disconnect}>Disconnect</button>
                                <button onClick={logout}>Logout</button>
                                <span> - Online</span>
                            </>
                        ) : <span> - Offline</span>}
                        <hr />
                        {isConnected ? (
                            <>
                                <RecordEntry />
                                <hr />
                                <ManageRecords />
                            </>
                        ) : <Setup />}
                    </>
                ) : <Login />
            ) : <div>Loading...</div>}
        </div>
    );
}

export default App;
