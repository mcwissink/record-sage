import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { schema } from "./schema";
import { Progress } from "./ui/Progress";
import { useRecords } from "./records-store";

export const Connect: React.VFC = () => {
    const { spreadsheetId } = useParams();
    const navigate = useNavigate();
    const { setup, disconnect } = useRecords();

    useEffect(() => {
        (async () => {
            disconnect();
            await setup({ schema, provider: { spreadsheetId } });
            navigate('/');
        })();
    }, [spreadsheetId, navigate, setup]);

    return (
        <Progress active />
    );
};
