export function DataPoint({
    label,
    value,
    editingField,
}: {
    label: string;
    value?: string | number | undefined | null;
    editingField?: React.ReactNode;
}) {
    const display =
        value !== undefined && value !== null && value !== "" ? value : "—";
    return (
        <div className="flex flex-col justify-center min-h-[50px] group/dp">
            <span className="block text-[10px] font-bold text-slate-400/80 dark:text-slate-500 uppercase tracking-[0.15em] mb-1.5 transition-colors group-hover/dp:text-rose-500/70 dark:group-hover/dp:text-rose-400/70">
                {label}
            </span>
            
            {editingField ? (
                editingField
            ) : (
                <span className="block text-[15px] font-medium text-slate-800 dark:text-slate-100 leading-snug">
                    {display}
                </span>
            )}
        </div>
    );
}