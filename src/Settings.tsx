import { useRecords } from "./records-store";
import QRCode from 'qrcode-svg';

export const Settings: React.VFC = () => {
    const {
        disconnect,
        logout,
        records,
    } = useRecords();
    const cloneUrl = records.generateCloneUrl();
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
                    src={'data:image/svg+xml;base64,' + btoa(new QRCode({
                        content: cloneUrl,
                        ecl: 'H',
                        // Use padding from outside instead to enable alignment with text.
                        padding: 0,
                    }).svg())}
                />
            </div>
        </div>
    )
}
