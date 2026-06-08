export const InputField = ({ value, onChange, type = "text", placeholder = "", disabled = false }: any) => (
    <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200/80 dark:border-slate-700 bg-stone-50 dark:bg-slate-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all disabled:opacity-50 shadow-inner text-slate-800 dark:text-slate-100"
    />
);

export const TextareaField = ({ value, onChange, placeholder = "", rows = 4 }: any) => (
    <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 text-sm rounded-xl border border-stone-200/80 dark:border-slate-700 bg-stone-50 dark:bg-slate-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all resize-none leading-relaxed shadow-inner text-slate-800 dark:text-slate-100"
    />
);

export const SelectField = ({ value, onChange, children }: any) => (
    <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-200/80 dark:border-slate-700 bg-stone-50 dark:bg-slate-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all shadow-inner appearance-none cursor-pointer text-slate-800 dark:text-slate-100"
    >
        {children}
    </select>
);
