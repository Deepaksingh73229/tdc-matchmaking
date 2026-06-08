import { motion, AnimatePresence } from "motion/react";
import { Pencil, X, Save } from "lucide-react";

export function Section({
    title,
    icon: Icon,
    children,
    isEditing = false,
    onEdit,
    onCancel,
    onSave,
    editable = false,
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    isEditing?: boolean;
    onEdit?: () => void;
    onCancel?: () => void;
    onSave?: () => void;
    editable?: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="bg-white/80 dark:bg-[#111218]/80 backdrop-blur-xl rounded-[2rem] p-7 md:p-10 border border-stone-200/60 dark:border-white/5 shadow-xl shadow-stone-200/20 dark:shadow-none relative overflow-hidden group"
        >
            {/* Subtle Abstract Section Watermark */}
            <svg className="absolute -right-8 -bottom-8 w-48 h-48 text-stone-200/50 dark:text-white/10 transform transition-transform duration-700 group-hover:scale-110 pointer-events-none" viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="40" opacity="0.3" />
                <path d="M 10 50 Q 50 10 90 50 Q 50 90 10 50" opacity="0.5" />
            </svg>

            <div className="flex items-center justify-between mb-8 pb-5 border-b border-stone-200/60 dark:border-white/5 relative z-10">
                <div className="flex items-center gap-3.5">
                    <div className="p-2.5 bg-linear-to-br from-rose-100 to-rose-50 dark:from-rose-500/20 dark:to-rose-500/5 rounded-xl border border-rose-200/50 dark:border-rose-500/10 shadow-sm shadow-rose-500/5">
                        <Icon className="w-5 h-5 text-rose-600 dark:text-rose-400" strokeWidth={1.5} />
                    </div>

                    <h3 className="font-semibold text-xl md:text-2xl text-slate-800 dark:text-slate-100 tracking-tight">
                        {title}
                    </h3>
                </div>

                {editable && (
                    isEditing ? (
                        <div className="flex gap-2">
                            <button
                                onClick={onCancel}
                                className="p-2 text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <button
                                onClick={onSave}
                                className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-lg transition-colors"
                            >
                                <Save className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onEdit}
                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 hover:text-rose-600 rounded-lg transition-all"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    )
                )}
            </div>
            
            <div className="relative z-10">
                {children}
            </div>

            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-8 flex justify-end gap-3 pt-5 border-t border-stone-200/60 dark:border-white/5 relative z-10"
                    >
                        <button
                            onClick={onCancel}
                            className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 shadow-md shadow-rose-200 dark:shadow-none transition-all flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Update {title.split(" ")[0]}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}