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
        isConnected,
    } = useRecords();

    return (
        <div className="flex flex-col min-h-screen">
            <nav className="overflow-hidden p-4 flex items-center gap-2 border-solid border-0 border-b">
                <span className="whitespace-nowrap"><b>record / sage</b></span>
                <ul className="contents list-none">
                    {links.concat(isConnected ? connectedLinks : []).map(([to, title]) => (
                        <React.Fragment key={to}>
                            <li>|</li>
                            <li><Link to={to}>{title}</Link></li>
                        </React.Fragment>
                    ))}
                </ul>
            </nav>
            <div className="p-4 grow">
                <Outlet />
            </div>
            <footer className="p-4 border-solid border-0 border-t">
                <div>{process.env.REACT_APP_GIT_SHA}</div>
            </footer>
        </div>
    );
}
