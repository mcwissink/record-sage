import React, { useEffect } from 'react';
import { useRecords } from './records-store';
import { Route, Routes } from 'react-router';
import { App } from './App';
import { Manage } from './Manage';
import { Layout } from './Layout';
import { Settings } from './Settings';
import { Navigate } from 'react-router-dom';
import { Connect } from './Connect';

export const Router: React.FC = () => {
    const {
        isConnected,
        initialize,
    } = useRecords();

    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route path="" element={<App />} />
                <Route path="connect/:spreadsheetId" element={<Connect />} />
                {isConnected ? (
                    <>
                        <Route path="manage" element={<Manage />} />
                        <Route path="settings" element={<Settings />} />
                    </>
                ) : null}
                <Route path="*" element={<Navigate replace to="/" />} />
            </Route>
        </Routes>
    );
}
