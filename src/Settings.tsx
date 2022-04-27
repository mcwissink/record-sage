import { useRecords } from "./records-store";
import QRCode from 'qrcode';
import { useEffect, useState } from "react";

export const Settings: React.VFC = () => {
    const [qrCode, setQrCode] = useState('');
    const {
        disconnect,
        logout,
        records,
    } = useRecords();

    const cloneUrl = records.generateCloneUrl();
    console.log(qrCode);

    useEffect(() => {
        QRCode.toDataURL(cloneUrl).then(setQrCode);
    }, [setQrCode, records]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4">
                <button onClick={disconnect}>disconnect</button>
                <button onClick={logout}>logout</button>
            </div>
            <div>
                <b>Connect</b>
                <img
                    className="block"
                    alt={cloneUrl}
                    src={qrCode}
                />
            </div>
        </div>
    )
}
