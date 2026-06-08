export function TagPills({ items }: { items: string[] | undefined | null }) {
    if (!items || items.length === 0) {
        return (
            <span className="text-sm text-slate-400 dark:text-slate-500 italic">
                Any
            </span>
        );
    }

    return (
        <div className="flex flex-wrap gap-2.5 mt-1.5">
            {
                items.map((t) => (
                    <span
                        key={t}
                        className="px-3.5 py-1.5 rounded-xl text-[12px] font-semibold bg-linear-to-br from-stone-50 to-stone-100 dark:from-white/5 dark:to-white/2 text-slate-700 dark:text-slate-300 border border-stone-200/60 dark:border-white/5 shadow-sm shadow-stone-200/20 dark:shadow-none hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                    >
                        {t}
                    </span>
                ))
            }
        </div>
    );
}