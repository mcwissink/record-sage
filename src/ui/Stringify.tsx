export const Stringify: React.VFC<{ data: Record<string, string>, hideLabel?: boolean }> = ({ data, hideLabel }) => (
    <div className="grid md:grid-cols-7 gap-2 w-full">
        {Object.entries(data)
            .filter(([key]) => !key.startsWith('_'))
            .map(([key, value]) => key === 'id' ? null : (
            <div key={key} className="flex items-center gap-2 md:block">
                {!hideLabel && <small className="font-bold">{key}</small>}
                <div>{value}</div>
            </div>
            ))
        }
    </div>
);
