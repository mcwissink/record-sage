import React from 'react';
import { Link, Outlet } from "react-router-dom";
import { useRecords } from './use-records';

const links = [
    ['/', 'home'],
];

const connectedLinks = [
    ['/manage', 'manage'],
    ['/settings', 'settings'],
];

export const Layout: React.VFC = () => {
    const {
        isOnline,
        isConnected,
    } = useRecords();

    return (
        <>
            <nav className="p-4 flex items-center gap-2 border-solid border-0 border-b">
                <span><b>[record / sage]</b></span>
                <ul className="contents list-none">
                    {links.concat(isConnected ? connectedLinks : []).map(([to, title]) => (
                        <React.Fragment key={to}>
                            <li>|</li>
                            <li><Link to={to}>{title}</Link></li>
                        </React.Fragment>
                    ))}
                </ul>
                <div className="grow" />
                <span>{isOnline ? 'online' : 'offline'}</span>
            </nav>
            <div className="p-4">
                <Outlet />
            </div>
        </>
    );
}
