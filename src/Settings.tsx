import { useRecords } from "./records-store";
import QRCode from 'qrcode';
import { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import { useNavigate } from "react-router-dom";

export const Settings: React.VFC = () => {
    const navigate = useNavigate();
    const [qrCode, setQrCode] = useState('');
    const {
        disconnect,
        logout,
        records,
    } = useRecords();

    useEffect(() => {
        QRCode.toDataURL(records.generateCloneUrl()).then(setQrCode);
    }, [setQrCode, records]);

    const onDisconnect = async () => {
        await disconnect();
        navigate('/', { replace: true });
    }

    const onLogout = async () => {
        await logout();
        navigate('/', { replace: true });
    }

    return (
        <div className="grid gap-4">
            <div className="flex gap-4">
                <Button onClick={onDisconnect}>disconnect</Button>
                <Button onClick={onLogout}>logout</Button>
            </div>
            <div className="grid gap-2">
                <b>Connect</b>
                <div>{records.generateCloneUrl()}</div>
                <img
                    className="block"
                    src={qrCode}
                />
            </div>
        </div>
    )
}
