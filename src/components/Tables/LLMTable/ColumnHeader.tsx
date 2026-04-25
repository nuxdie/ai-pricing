import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FilterInput } from "./FilterInput";
import { ColumnHeaderProps } from "@/components/types/column-header";
import { SelectFilter } from "./SelectFilter";
import { CheckboxFilter } from "./CheckboxFilter";
import { RangeFilter } from "./RangeFilter";
import { MultiSelectFilter } from "./MultiSelectFilter";

export function ColumnHeader({
    title,
    subtitle,
    column,
    tooltip,
    link,
    filter,
    sort,
    draggable,
    verticalText
}: ColumnHeaderProps) {
    const isSorted = column.getIsSorted();

    const SortIcon = () => (
        <svg
            className="h-3 w-3 shrink-0"
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                d="M12 3.5L7 8.5h10l-5-5z"
                className={isSorted === "asc" ? "opacity-100" : "opacity-20"}
            />
            <path
                fill="currentColor"
                d="M12 20.5l5-5H7l5 5z"
                className={isSorted === "desc" ? "opacity-100" : "opacity-20"}
            />
        </svg>
    );

    const DragHandle = () => (
        <span
            aria-hidden="true"
            className="inline-flex h-3 w-2 shrink-0 items-center justify-center text-slate-300 transition-colors group-hover/header:text-slate-400 dark:text-slate-600 dark:group-hover/header:text-slate-500"
        >
            <svg className="h-3 w-2" viewBox="0 0 8 12" fill="currentColor">
                <circle cx="2" cy="2" r="1" />
                <circle cx="6" cy="2" r="1" />
                <circle cx="2" cy="6" r="1" />
                <circle cx="6" cy="6" r="1" />
                <circle cx="2" cy="10" r="1" />
                <circle cx="6" cy="10" r="1" />
            </svg>
        </span>
    );

    const handleHeaderClick = (e: React.MouseEvent) => {
        if (sort?.enabled) {
            e.preventDefault();
            e.stopPropagation();
            column.toggleSorting();
        }
    };

    return (
        <div className="text-[11px] leading-tight">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className={`group/header rounded cursor-pointer select-none py-0.5 ${
                                sort?.enabled ? "hover:bg-slate-100 dark:hover:bg-slate-800" : ""
                            } ${verticalText
                                ? '[writing-mode:vertical-rl] rotate-180 whitespace-nowrap flex flex-col items-start justify-center gap-0.5'
                                : 'flex items-center gap-0.5'
                            }`}
                            onClick={handleHeaderClick}
                        >
                            <div className={`flex flex-col justify-center ${verticalText ? 'items-start' : ''}`}>
                                {link && !verticalText ? (
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:underline inline-flex items-center group text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <span className="font-semibold">{title}</span>
                                        <svg className="w-2.5 h-2.5 ml-0.5 opacity-0 group-hover:opacity-50 transition-opacity" viewBox="0 0 12 12">
                                            <path fill="currentColor" d="M6.5 1H11v4.5L9.25 3.75 6.5 6.5 5.5 5.5l2.75-2.75L6.5 1z" />
                                        </svg>
                                    </a>
                                ) : (
                                    <span className="font-semibold text-slate-600 dark:text-slate-300">{title}</span>
                                )}

                                {subtitle && (
                                    <span className={`text-[9px] text-slate-400 dark:text-slate-500 font-normal leading-none ${verticalText ? 'mt-0.5' : ''}`}>
                                        {subtitle}
                                    </span>
                                )}
                            </div>

                            <div className={`flex items-center ${verticalText ? 'gap-0.5' : 'gap-0'}`}>
                                {draggable && <DragHandle />}
                                {link && verticalText && (
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center opacity-30 hover:opacity-60"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <svg className="w-2.5 h-2.5" viewBox="0 0 12 12">
                                            <path fill="currentColor" d="M6.5 1H11v4.5L9.25 3.75 6.5 6.5 5.5 5.5l2.75-2.75L6.5 1z" />
                                        </svg>
                                    </a>
                                )}
                                {sort?.enabled && (
                                    <span className={isSorted ? "text-slate-700 dark:text-slate-200" : "text-slate-300 dark:text-slate-600"}>
                                        <SortIcon />
                                    </span>
                                )}
                            </div>
                        </div>
                    </TooltipTrigger>
                    {tooltip && (
                        <TooltipContent side={verticalText ? "left" : "top"} align="start" className="text-xs max-w-xs">
                            <p>{tooltip}</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>

            {filter?.enabled && (
                <div className="mt-0.5">
                    {filter.type === 'range' ? (
                        <RangeFilter column={column} showMin={filter.showMin} showMax={filter.showMax} />
                    ) : filter.type === 'select' ? (
                        <SelectFilter
                            column={column}
                            options={filter.options || []}
                            placeholder="Filter..."
                        />
                    ) : filter.type === 'multi-select' ? (
                        <MultiSelectFilter
                            column={column}
                            options={filter.options || []}
                            placeholder="Filter..."
                        />
                    ) : filter.type === 'boolean' ? (
                        <CheckboxFilter column={column} />
                    ) : (
                        <FilterInput
                            column={column}
                            placeholder="Filter..."
                        />
                    )}
                </div>
            )}
        </div>
    );
}
