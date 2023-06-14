import React from "react"
import { Link, useSearchParams } from "react-router-dom";
import { Rows } from "./records"
import { useCache, useQuery } from "./records-store";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Pagination } from './ui/Pagination';
import { Progress } from "./ui/Progress";
import { Stringify } from "./ui/Stringify";

export const RecordList: React.VFC = () => {
    const [params] = useSearchParams();
    const limit = Number(params.get('limit') ?? 20);
    const offset = Number(params.get('offset') ?? 0);

    const { data: applications, isLoading } = useQuery('application', `SELECT * ORDER BY B DESC LIMIT ${limit} OFFSET ${offset}`);
    const { data: pendingApplications } = useCache('application');

    // const onDuplicateRows = (rows: Rows<'application'>) => () => {
    //     navigate('records/add', { state: { rows } });
    // };

    return (
        <div className="flex flex-col gap-4">
            <Link to="/records/add">
                <Button className="w-full md:w-36">add</Button>
            </Link>
            <Progress active={isLoading} />
            {!!pendingApplications?.total && (
                <>
                    <div className="flex flex-col gap-4">
                        <b>pending</b>
                        {Object.entries(pendingApplications.rows).map(([id, row]) => (
                            <Card key={id} className="flex items-center opacity-75">
                                <Stringify data={row} />
                            </Card>
                        ))}
                    </div>
                    {!!applications?.total && <hr className="w-full col-span-full" />}
                </>
            )}
            <div className="flex flex-col gap-4">
                {Object.entries(
                    Object.entries(applications?.rows ?? {}).reduce<Record<string, Rows<'application'>>>((acc, [id, row]) => {
                        if (acc[row.date]) {
                            acc[row.date][id] = row;
                        } else {
                            acc[row.date] = { [id]: row };
                        }
                        return acc;
                    }, {})
                ).map(([date, rows]) => (
                    <React.Fragment key={date}>
                        <div className="flex items-end">
                            <b className="grow">{date}</b>
                        </div>
                        {Object.entries(rows).map(([id, row]) => (
                            <Link key={id} to={`/records/${id}`} className="no-underline">
                                <Card className="flex items-center hover:bg-gray-200 cursor-pointer">
                                    <Stringify data={row} />
                                </Card>
                            </Link>
                        ))}
                    </React.Fragment>
                ))}
                <Pagination
                    offset={offset}
                    total={applications?.total ?? 0}
                    limit={limit}
                />
            </div>
        </div>
    )
}
