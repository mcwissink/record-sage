import cn from 'classnames';

export const Table: React.VFC<React.ComponentPropsWithoutRef<'table'> & {
    data: Array<Record<string, string>>
}> = ({ data, className, ...props }) => {
    return (
        <table {...props} className={cn(className, 'border-collapse')}>
            {data.map((row, i) => (
                <tr key={i}>
                    {Object.values(row).map((cell, j) => (
                        <td key={j} className="border border-solid p-4">{cell}</td>
                    ))}
                </tr>
            ))}
        </table>
    );
};
