import React from 'react'
import { useRecords } from '../../use-records';

export const Login: React.VFC = () => {
    const { login } = useRecords();

    return (
        <button onClick={login}>
            Login
        </button>
    );
}
