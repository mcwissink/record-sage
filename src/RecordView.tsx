import React from "react"
import { useParams } from "react-router-dom";
import { useQuery, useRecords } from "./records-store";
import { Row } from "./records";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import { Progress } from "./ui/Progress";
import { Card } from "./ui/Card";
import { Stringify } from "./ui/Stringify";


export const ApplicationsView = () => {
};

export const RecordView: React.VFC = () => {
    const navigate = useNavigate();
    const { recordId } = useParams();
    const { records } = useRecords();

    const {
        data: applications,
        isLoading: isLoadingApplications
    } = useQuery('application', `SELECT * WHERE A = '${recordId}'`);
    const {
        data: chemicalApplications,
        isLoading: isLoadingChemicalApplications
    } = useQuery('chemical-application', `SELECT * WHERE C = '${recordId}'`);

    if (!recordId) {
        return <div>Missing ID</div>
    }

    const application = applications?.rows[recordId];

    if (isLoadingApplications || isLoadingChemicalApplications) {
        return <Progress />
    }

    if (!application || !chemicalApplications) {
        return <div>404</div>
    }

    const onDelete = (row: Row<'application'>) => async () => {
        if (window.confirm(`Delete: ${JSON.stringify(row._id)}`)) {
            await records.delete('application', row._id);
            for (const chemicalApplication of Object.values(chemicalApplications.rows)) {
                await records.delete('chemical-application', chemicalApplication._id);
            }
            navigate(-1);
        }
    };

    return (
        <div className="grid gap-2">
            <div className="flex items-end">
                <b className="grow">{application.date}</b>
                <Button type="button" onClick={onDelete(application)}>delete</Button>
            </div>
            <div className="flex flex-col gap-1">
                <Label label="applicator">{application.applicator}</Label>
                <Label label="certification">{application.certification}</Label>
                <Label label="note">{application.note}</Label>
            </div>
            <hr />
            {Object.entries(chemicalApplications.rows).map(([id, chemicalApplication]) => (
                <Card key={id} className="flex items-start gap-2 flex-col md:flex-row md:items-center col-span-full">
                    <Stringify data={chemicalApplication} />
                </Card>
            ))}
        </div>
    )
}

export const Label: React.FC<{ label: string }> = ({ label, children, ...props }) => (
    <div {...props}>
        <b>{label}: </b>
        {children}
    </div>
);
