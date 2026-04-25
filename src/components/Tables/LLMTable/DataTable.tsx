import {
    ColumnOrderState,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { columns as createColumns, columnGroups, ModelSortMode, MODEL_SORT_CYCLE } from "./columns";
import { BENCHMARK_COLUMN_IDS } from "./columnIds";
import { LLMModel } from "@/types/llm";

interface DataTableProps {
    data: LLMModel[];
}

const BENCHMARK_COLUMN_ID_SET = new Set<string>(BENCHMARK_COLUMN_IDS);
const COLUMN_ORDER_STORAGE_KEY = "llm-table-benchmark-column-order";
const DEFAULT_COLUMN_ORDER = [
    "model",
    "AAIndex",
    "costAAIndex",
    "tokenUseAAIndex",
    "outputSpeed",
    ...BENCHMARK_COLUMN_IDS,
    "hasVision",
];
const GROUP_START_COLUMN_IDS = new Set(["AAIndex", "costAAIndex", "outputSpeed", "hasVision"]);

const getStoredBenchmarkOrder = (): string[] => {
    if (typeof window === "undefined") return [...BENCHMARK_COLUMN_IDS];

    try {
        const stored = window.localStorage.getItem(COLUMN_ORDER_STORAGE_KEY);
        if (!stored) return [...BENCHMARK_COLUMN_IDS];

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return [...BENCHMARK_COLUMN_IDS];

        const seenIds = new Set<string>();
        const validStoredIds = parsed.filter((id): id is string => {
            if (!BENCHMARK_COLUMN_ID_SET.has(id) || seenIds.has(id)) return false;
            seenIds.add(id);
            return true;
        });
        const missingIds = BENCHMARK_COLUMN_IDS.filter((id) => !validStoredIds.includes(id));
        return [...validStoredIds, ...missingIds];
    } catch {
        return [...BENCHMARK_COLUMN_IDS];
    }
};

const createColumnOrder = (benchmarkOrder: string[]): ColumnOrderState => {
    return DEFAULT_COLUMN_ORDER.map((columnId) => {
        if (columnId === BENCHMARK_COLUMN_IDS[0]) {
            return benchmarkOrder;
        }
        return BENCHMARK_COLUMN_ID_SET.has(columnId) ? [] : columnId;
    }).flat();
};

const reorderBenchmarkColumns = (columnOrder: ColumnOrderState, fromId: string, toId: string) => {
    if (fromId === toId || !BENCHMARK_COLUMN_ID_SET.has(fromId) || !BENCHMARK_COLUMN_ID_SET.has(toId)) {
        return columnOrder;
    }

    const benchmarkOrder = columnOrder.filter((id) => BENCHMARK_COLUMN_ID_SET.has(id));
    const fromIndex = benchmarkOrder.indexOf(fromId);
    const toIndex = benchmarkOrder.indexOf(toId);
    if (fromIndex === -1 || toIndex === -1) return columnOrder;

    const nextBenchmarkOrder = [...benchmarkOrder];
    const [movedColumnId] = nextBenchmarkOrder.splice(fromIndex, 1);
    nextBenchmarkOrder.splice(toIndex, 0, movedColumnId);

    return createColumnOrder(nextBenchmarkOrder);
};

const isInteractiveElement = (target: EventTarget | null) => {
    return target instanceof HTMLElement && Boolean(target.closest("a, button, input, select, textarea"));
};

const persistBenchmarkOrder = (columnOrder: ColumnOrderState) => {
    try {
        const benchmarkOrder = columnOrder.filter((id) => BENCHMARK_COLUMN_ID_SET.has(id));
        window.localStorage.setItem(COLUMN_ORDER_STORAGE_KEY, JSON.stringify(benchmarkOrder));
    } catch {
        // Ignore storage failures so dragging still works in restricted browser modes.
    }
};

export function DataTable({ data }: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [modelSortMode, setModelSortMode] = useState<ModelSortMode>(null);
    const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
    const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() => createColumnOrder(getStoredBenchmarkOrder()));

    const cycleModelSort = useCallback(() => {
        setModelSortMode((prev) => {
            const idx = MODEL_SORT_CYCLE.indexOf(prev);
            const next = MODEL_SORT_CYCLE[(idx + 1) % MODEL_SORT_CYCLE.length];
            if (next) {
                setSorting([{ id: "model", desc: false }]);
            } else {
                setSorting((s) => s.filter((col) => col.id !== "model"));
            }
            return next;
        });
    }, []);

    const handleSortingChange = useCallback(
        (updater: SortingState | ((prev: SortingState) => SortingState)) => {
            setSorting((prev) => {
                const next = typeof updater === "function" ? updater(prev) : updater;
                // If sorting changed to a non-model column, reset model sort mode
                const modelSort = next.find((s) => s.id === "model");
                if (!modelSort) {
                    setModelSortMode(null);
                }
                return next;
            });
        },
        [],
    );

    const tableColumns = useMemo(
        () => createColumns(data, modelSortMode, cycleModelSort),
        [data, modelSortMode, cycleModelSort],
    );

    const table = useReactTable({
        data,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: handleSortingChange,
        onColumnFiltersChange: setColumnFilters,
        onColumnOrderChange: setColumnOrder,
        state: {
            sorting,
            columnFilters,
            columnOrder,
        },
    });

    const handleBenchmarkDragStart = useCallback((e: React.DragEvent<HTMLTableCellElement>, columnId: string) => {
        if (isInteractiveElement(e.target)) {
            e.preventDefault();
            return;
        }

        setDraggedColumnId(columnId);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", columnId);
    }, []);

    const handleBenchmarkDragOver = useCallback((e: React.DragEvent<HTMLTableCellElement>, columnId: string) => {
        if (!draggedColumnId || draggedColumnId === columnId) return;

        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverColumnId(columnId);
    }, [draggedColumnId]);

    const handleBenchmarkDrop = useCallback((e: React.DragEvent<HTMLTableCellElement>, columnId: string) => {
        e.preventDefault();

        const fromColumnId = e.dataTransfer.getData("text/plain") || draggedColumnId;
        if (!fromColumnId) return;

        setColumnOrder((currentOrder) => {
            const nextOrder = reorderBenchmarkColumns(currentOrder, fromColumnId, columnId);
            persistBenchmarkOrder(nextOrder);
            return nextOrder;
        });
        setDraggedColumnId(null);
        setDragOverColumnId(null);
    }, [draggedColumnId]);

    const handleBenchmarkDragEnd = useCallback(() => {
        setDraggedColumnId(null);
        setDragOverColumnId(null);
    }, []);

    const isGroupStartColumn = useCallback((columnId: string) => {
        if (GROUP_START_COLUMN_IDS.has(columnId)) return true;

        const firstBenchmarkColumnId = columnOrder.find((id) => BENCHMARK_COLUMN_ID_SET.has(id));
        return columnId === firstBenchmarkColumnId;
    }, [columnOrder]);

    return (
        <table className="w-full border-collapse text-[12px]">
            <thead className="sticky top-0 z-10">
                {/* Column group header */}
                <tr className="bg-slate-700 text-slate-200 dark:bg-slate-900 dark:text-slate-300">
                    {columnGroups.map((group, i) => (
                        <th
                            key={group.label}
                            colSpan={group.span}
                            className={`px-2 py-[3px] text-[10px] font-medium uppercase tracking-widest text-left ${
                                i > 0 ? "border-l border-slate-500/50" : ""
                            }`}
                        >
                            {group.label}
                        </th>
                    ))}
                </tr>

                {/* Column headers */}
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="bg-slate-50 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                        {headerGroup.headers.map((header) => {
                            const isBenchmarkColumn = BENCHMARK_COLUMN_ID_SET.has(header.column.id);
                            const isGroupStart = isGroupStartColumn(header.column.id);
                            const isDragOver = dragOverColumnId === header.column.id;
                            return (
                                <th
                                    key={header.id}
                                    draggable={isBenchmarkColumn}
                                    onDragStart={isBenchmarkColumn ? (e) => handleBenchmarkDragStart(e, header.column.id) : undefined}
                                    onDragOver={isBenchmarkColumn ? (e) => handleBenchmarkDragOver(e, header.column.id) : undefined}
                                    onDrop={isBenchmarkColumn ? (e) => handleBenchmarkDrop(e, header.column.id) : undefined}
                                    onDragEnd={isBenchmarkColumn ? handleBenchmarkDragEnd : undefined}
                                    title={isBenchmarkColumn ? "Drag to rearrange benchmark columns" : undefined}
                                    className={`text-left align-bottom font-medium text-slate-500 dark:text-slate-400 px-1.5 py-1 transition-colors ${
                                         isGroupStart ? "group-border-l" : ""
                                      } ${
                                         isBenchmarkColumn ? "cursor-grab active:cursor-grabbing" : ""
                                      } ${
                                         isDragOver ? "bg-indigo-50 dark:bg-indigo-950/40" : ""
                                      }`}
                                    style={{ width: `${header.getSize()}px` }}
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </th>
                            );
                        })}
                    </tr>
                ))}
            </thead>
            <tbody>
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row, rowIndex) => (
                        <tr
                            key={row.id}
                            className={`
                                border-b border-slate-100/80 dark:border-slate-800/80
                                hover:bg-blue-50/40 dark:hover:bg-slate-800/60
                                transition-colors duration-75
                                ${rowIndex % 2 === 1 ? "bg-slate-50/40 dark:bg-slate-900/70" : "bg-white dark:bg-slate-950"}
                            `}
                        >
                            {row.getVisibleCells().map((cell) => {
                                const isGroupStart = isGroupStartColumn(cell.column.id);
                                return (
                                    <td
                                        key={cell.id}
                                        className={`px-1 py-[2px] ${
                                            isGroupStart ? "group-border-l" : ""
                                        }`}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                );
                            })}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={tableColumns.length} className="p-4 text-center text-slate-400 dark:text-slate-500">
                            No results.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}
