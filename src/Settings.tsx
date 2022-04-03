import { useRecords } from "./use-records";

export const Settings: React.VFC = () => {
    const {
        disconnect,
        logout
    } = useRecords();
    return (
        <div className="flex gap-4">
            <button onClick={disconnect}>disconnect</button>
            <button onClick={logout}>logout</button>
        </div>
    )
}
