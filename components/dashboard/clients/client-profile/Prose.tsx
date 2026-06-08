export function Prose({ label, value, editingField }: { label: string; value?: string | undefined | null; editingField?: React.ReactNode }) {
    return (
        <div className="col-span-1 md:col-span-2 group/prose">
            <span className="block text-[10px] font-bold text-slate-400/80 dark:text-slate-500 uppercase tracking-[0.15em] mb-2.5">
                {label}
            </span>
            
            {editingField ? (
                editingField
            ) : (
                <div className="relative overflow-hidden rounded-2xl bg-stone-50/50 dark:bg-white/2 border border-stone-200/50 dark:border-white/5 p-5 md:p-6 transition-colors group-hover/prose:bg-stone-50 dark:group-hover/prose:bg-white/4">
                    {/* Accent Left Border */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-rose-400 to-rose-200 dark:from-rose-500 dark:to-rose-800 opacity-70"></div>

                    <p className="text-[14.5px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line pl-2">
                        {value || "Not provided."}
                    </p>
                </div>
            )}
        </div>
    );
}