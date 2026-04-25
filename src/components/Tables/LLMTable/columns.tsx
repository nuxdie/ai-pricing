import { ColumnDef, Row } from "@tanstack/react-table";
import { LLMModel } from "@/types/llm";
import { ColumnHeader } from "./ColumnHeader";
import { developerLogos, developerFlags } from "@/config/logos";
import { getColumnMinMax } from "@/utils/colorScale";
import { BarCell } from "./BarCell";
import { FilterInput } from "./FilterInput";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type ModelSortMode = "date" | "developer" | "country" | null;

export const MODEL_SORT_CYCLE: ModelSortMode[] = ["date", "developer", "country", null];

const MODEL_SORT_LABELS: Record<string, string> = {
  date: "by date",
  developer: "by developer",
  country: "by country",
};

// Color palette — semantic meaning
const COLORS = {
  quality: "rgba(99, 102, 241, 0.24)",     // indigo — intelligence/quality
  cost: "rgba(244, 63, 94, 0.18)",         // rose — expense (lower is better)
  tokens: "rgba(245, 158, 11, 0.20)",      // amber — resource usage
  speed: "rgba(14, 165, 233, 0.22)",       // sky — throughput/performance
  benchmark: "rgba(99, 102, 241, 0.16)",   // indigo lighter — benchmark scores
  profit: "rgba(34, 197, 94, 0.24)",       // emerald — positive outcome
};

// Helper function for price range filtering
const createPriceRangeFilter = (
  row: Row<LLMModel>,
  columnId: string,
  value: [string, string],
) => {
  const price = row.getValue(columnId) as number;
  const [min, max] = value;
  const numMin = Number(min);
  const numMax = Number(max);
  if (min && max) return price >= numMin && price <= numMax;
  if (min) return price >= numMin;
  if (max) return price <= numMax;
  return true;
};

const getModelAgeDays = (releaseDate?: string): number | null => {
  if (!releaseDate) return null;
  const releasedAt = Date.parse(`${releaseDate}T00:00:00Z`);
  if (Number.isNaN(releasedAt)) return null;
  const now = Date.now();
  const age = Math.floor((now - releasedAt) / (1000 * 60 * 60 * 24));
  return Math.max(age, 0);
};

const formatAge = (days: number): string => {
  if (days === 0) return "today";
  if (days < 14) return `${days}d`;
  if (days < 60) return `${Math.floor(days / 7)}w`;
  return `${Math.floor(days / 30)}mo`;
};

/** Returns Tailwind classes for the age pill based on freshness */
const agePillClasses = (days: number): string => {
  if (days <= 7)  return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
  if (days <= 30) return "bg-emerald-500/10 text-emerald-500/80 dark:text-emerald-400/90";
  if (days <= 90) return "bg-slate-500/10 text-slate-500 dark:text-slate-400";
  return "bg-slate-500/8 text-slate-400 dark:text-slate-500";
};

// Column group definitions — used by DataTable for group headers
export const columnGroups = [
  { label: "Model", span: 1 },
  { label: "Quality", span: 1 },
  { label: "Cost", span: 2 },
  { label: "Performance", span: 1 },
  { label: "Benchmarks", span: 5 },
  { label: "Caps", span: 1 },
];

export const columns = (
  data: LLMModel[],
  modelSortMode: ModelSortMode = null,
  onCycleModelSort?: () => void,
): ColumnDef<LLMModel>[] => {
  const simpleBenchRange = getColumnMinMax(data, "simpleBench");
  const ARCAGI2Range = getColumnMinMax(data, "ARCAGI2");
  const costRange = getColumnMinMax(data, "costAAIndex");
  const tokenUseAAIndexRange = getColumnMinMax(data, "tokenUseAAIndex");
  const outputSpeedRange = getColumnMinMax(data, "outputSpeed");
  const aaIndexRange = getColumnMinMax(data, "AAIndex");
  const bullshitBenchRange = getColumnMinMax(data, "bullshitBench");
  const vibeCodeBenchRange = getColumnMinMax(data, "vibeCodeBench");
  const vendingBenchValues = data
    .map((item) => item.VendingBench)
    .filter((value): value is number => value !== null && value !== undefined);
  const maxPositiveVendingBench = Math.max(
    0,
    ...vendingBenchValues.filter((value) => value > 0),
  );

  return [
    // ─── Model ───
    {
      accessorKey: "model",
      header: ({ column }) => {
        const modeLabel = modelSortMode ? MODEL_SORT_LABELS[modelSortMode] : null;
        return (
          <div className="text-[11px] leading-tight">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="rounded cursor-pointer select-none py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-0.5"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onCycleModelSort?.();
                    }}
                  >
                    <div className="flex flex-col justify-center">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Model</span>
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 leading-none">
                        Most metrics: high · xhigh · max
                      </span>
                      {modeLabel && (
                        <span className="text-[9px] text-indigo-500 font-medium leading-none">
                          {modeLabel}
                        </span>
                      )}
                    </div>
                    <span className={modelSortMode ? "text-indigo-500" : "text-slate-300 dark:text-slate-600"}>
                      <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12 3.5L7 8.5h10l-5-5z"
                          className="opacity-20"
                        />
                        <path
                          fill="currentColor"
                          d="M12 20.5l5-5H7l5 5z"
                          className={modelSortMode ? "opacity-100" : "opacity-20"}
                        />
                      </svg>
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" align="start" className="text-xs max-w-xs">
                  <p>Click to cycle sort: by date → by developer → by country → default</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="mt-0.5">
              <FilterInput column={column} placeholder="Filter..." />
            </div>
          </div>
        );
      },
      filterFn: "includesString",
      sortingFn: (rowA, rowB) => {
        const a = rowA.original;
        const b = rowB.original;
        switch (modelSortMode) {
          case "date":
            // Recent first: reverse date comparison (desc=false, so we negate)
            return (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "");
          case "developer":
            return (a.developer ?? "").localeCompare(b.developer ?? "");
          case "country":
            return (developerFlags[a.developer] ?? "").localeCompare(
              developerFlags[b.developer] ?? "",
            );
          default:
            return 0;
        }
      },
      cell: ({ row }) => {
        const developer = row.original.developer;
        const ageDays = getModelAgeDays(row.original.releaseDate);
        const logo = developerLogos[developer];
        const flag = developerFlags[developer];
        const content = (
          <div className="flex items-start gap-1.5 min-w-0">
            <div className="flex items-center gap-1 shrink-0 pt-0.5">
              {logo && (
                <img
                  src={logo}
                  alt={`${developer} logo`}
                  className="w-4 h-4 object-contain shrink-0 rounded-sm"
                />
              )}
              {flag && <span className="text-xs leading-none">{flag}</span>}
            </div>
            <div className="min-w-0 flex items-center gap-1.5">
              <span className="truncate font-medium text-[12px]">{row.original.model}</span>
              {ageDays !== null && (
                <span
                  className={`shrink-0 rounded px-1 py-px text-[9px] font-medium leading-tight ${agePillClasses(ageDays)}`}
                  title={`Released ${row.original.releaseDate}`}
                >
                  {formatAge(ageDays)}
                </span>
              )}
            </div>
          </div>
        );

        return row.original.modelUrl ? (
          <a
            href={row.original.modelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline inline-flex items-center gap-0.5"
          >
            {content}
            <svg className="h-2.5 w-2.5 text-slate-300 dark:text-slate-600 shrink-0 ml-0.5" viewBox="0 0 12 12">
              <path
                fill="currentColor"
                d="M3.5 3a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5V6h1v2.5A1.5 1.5 0 0 1 8.5 10h-5A1.5 1.5 0 0 1 2 8.5v-5A1.5 1.5 0 0 1 3.5 2H6v1H3.5z"
              />
              <path
                fill="currentColor"
                d="M6.5 1H11v4.5L9.25 3.75 6.5 6.5 5.5 5.5l2.75-2.75L6.5 1z"
              />
            </svg>
          </a>
        ) : (
          content
        );
      },
      minSize: 170,
    },

    // ─── Quality: AAIndex ───
    {
      accessorKey: "AAIndex",
      meta: { groupStart: true },
      header: ({ column }) => (
        <ColumnHeader
          column={column}
          title="AAIndex"
          subtitle="%"
          tooltip="Artificial Analysis Intelligence Index (higher is better)"
          link={{
            url: "https://artificialanalysis.ai/leaderboards/models",
            title: "AAIndex Benchmark",
          }}
          filter={{ type: "range", enabled: true, showMax: false }}
          sort={{ enabled: true }}
        />
      ),
      cell: ({ row }) => (
        <BarCell
          value={row.original.AAIndex}
          min={aaIndexRange.min}
          max={aaIndexRange.max}
          color={COLORS.quality}
          useLog
        />
      ),
      sortingFn: "alphanumeric",
      sortDescFirst: true,
      sortUndefined: "last",
      filterFn: createPriceRangeFilter,
      maxSize: 100,
    },

    // ─── Cost: AA Index cost ───
    {
      accessorKey: "costAAIndex",
      meta: { groupStart: true },
      header: ({ column }) => (
        <ColumnHeader
          column={column}
          title="Cost to Run AAIndex"
          subtitle="USD"
          tooltip="Cost (USD) to run all evaluations in the Artificial Analysis Intelligence Index. Lower is better."
          link={{
            url: "https://artificialanalysis.ai/models#cost-to-run-artificial-analysis-intelligence-index",
            title: "Cost to Run Artificial Analysis Intelligence Index",
          }}
          filter={{ type: "range", enabled: true, showMin: false }}
          sort={{ enabled: true }}
        />
      ),
      cell: ({ row }) => (
        <BarCell
          value={row.original.costAAIndex}
          min={costRange.min}
          max={costRange.max}
          color={COLORS.cost}
          format={(v) => (v === 0 ? "Free" : `$${Math.round(v)}`)}
        />
      ),
      maxSize: 130,
      filterFn: createPriceRangeFilter,
    },

    // ─── Cost: Token Use ───
    {
      accessorKey: "tokenUseAAIndex",
      header: ({ column }) => (
        <ColumnHeader
          column={column}
          title="Token Use"
          subtitle="MTok"
          tooltip="Output Tokens Used to Run Artificial Analysis Intelligence Index, Millions (lower is better)"
          link={{
            url: "https://artificialanalysis.ai/models#output-tokens-used-to-run-artificial-analysis-intelligence-index",
            title: "Tokens used to run all evaluations in the Artificial Analysis Intelligence Index",
          }}
          filter={{ type: "range", enabled: true, showMin: false }}
          sort={{ enabled: true }}
        />
      ),
      cell: ({ row }) => (
        <BarCell
          value={row.original.tokenUseAAIndex}
          min={tokenUseAAIndexRange.min}
          max={tokenUseAAIndexRange.max}
          color={COLORS.tokens}
          useLog
          format={(v) => `${v}M`}
        />
      ),
      filterFn: createPriceRangeFilter,
      maxSize: 100,
    },

    // ─── Performance: Output Speed ───
    {
      accessorKey: "outputSpeed",
      meta: { groupStart: true },
      header: ({ column }) => (
        <ColumnHeader
          column={column}
          title="Speed"
          subtitle="t/s"
          tooltip="Output speed in tokens per second while the model is generating after the first token (higher is better). Values marked with * come from a provider-specific source."
          link={{
            url: "https://artificialanalysis.ai/leaderboards/models",
            title: "Artificial Analysis Model Leaderboard",
          }}
          filter={{ type: "range", enabled: true, showMax: false }}
          sort={{ enabled: true }}
        />
      ),
      cell: ({ row }) => (
        <div title={row.original.outputSpeedSource ? `Speed source: ${row.original.outputSpeedSource}` : undefined}>
          <BarCell
            value={row.original.outputSpeed}
            min={outputSpeedRange.min}
            max={outputSpeedRange.max}
            color={COLORS.speed}
            useLog
            format={(v) => {
              const rounded = `${Math.round(v)}`;
              return row.original.outputSpeedSource ? `${rounded}*` : rounded;
            }}
          />
        </div>
      ),
      sortingFn: "alphanumeric",
      sortDescFirst: true,
      sortUndefined: "last",
      filterFn: createPriceRangeFilter,
      maxSize: 95,
    },

    // ─── Benchmarks: SimpleBench ───
    {
      accessorKey: "simpleBench",
      meta: { groupStart: true },
      header: ({ column }) => (
        <ColumnHeader
          column={column}
          title="Simple"
          subtitle="MCQ · %"
          tooltip="Benchmark covering spatio-temporal reasoning, social intelligence, and trick questions (Human Baseline 83.7%) (higher is better)"
          link={{
            url: "https://simple-bench.com/#leaderboardTable",
            title: "Simple Bench Leaderboard Table",
          }}
          sort={{ enabled: true }}
          draggable
        />
      ),
      cell: ({ row }) => (
        <BarCell
          value={row.original.simpleBench}
          min={simpleBenchRange.min}
          max={simpleBenchRange.max}
          color={COLORS.benchmark}
          format={(v) => `${Math.round(v)}`}
        />
      ),
      sortingFn: "alphanumeric",
      sortDescFirst: true,
      sortUndefined: "last",
    },

    // ─── Benchmarks: ARC-AGI-2 ───
    {
      accessorKey: "ARCAGI2",
      header: ({ column }) => (
        <ColumnHeader
          column={column}
          title="ARC-AGI-2"
          subtitle="%"
          tooltip="ARC-AGI-2 uses abstract visual puzzles to evaluate on-the-spot reasoning skills (higher is better)"
          link={{
            url: "https://arcprize.org/leaderboard",
            title: "ARC-AGI-2 Leaderboard",
          }}
          sort={{ enabled: true }}
          draggable
        />
      ),
      cell: ({ row }) => (
        <BarCell
          value={row.original.ARCAGI2}
          min={ARCAGI2Range.min}
          max={ARCAGI2Range.max}
          color={COLORS.benchmark}
          format={(v) => `${Math.round(v)}`}
        />
      ),
      sortDescFirst: true,
      sortUndefined: "last",
    },

    // ─── Benchmarks: BullshitBench v2 ───
    {
      accessorKey: "bullshitBench",
      header: ({ column }) => (
        <ColumnHeader
          column={column}
          title="Bullshit"
          subtitle="v2 · %"
          tooltip="Measures nonsense detection across plausible-sounding prompts in software, medical, legal, finance, and physics domains (higher is better)."
          link={{
            url: "https://petergpt.github.io/bullshit-benchmark/viewer/index.v2.html",
            title: "BullshitBench v2",
          }}
          sort={{ enabled: true }}
          draggable
        />
      ),
      cell: ({ row }) => (
        <BarCell
          value={row.original.bullshitBench}
          min={bullshitBenchRange.min}
          max={bullshitBenchRange.max}
          color={COLORS.benchmark}
          format={(v) => `${Math.round(v)}`}
        />
      ),
      sortDescFirst: true,
      sortUndefined: "last",
    },

    // ─── Benchmarks: Vibe Code Bench ───
    {
      accessorKey: "vibeCodeBench",
      header: ({ column }) => (
        <ColumnHeader
          column={column}
          title="Vibe Code"
          subtitle="v1.1 · %"
          tooltip="End-to-end web application development accuracy — percentage of tests in which at least 90% of substeps succeed (higher is better)"
          link={{
            url: "https://vals.ai/benchmarks/vibe-code",
            title: "Vibe Code Bench v1.1",
          }}
          sort={{ enabled: true }}
          draggable
        />
      ),
      cell: ({ row }) => (
        <BarCell
          value={row.original.vibeCodeBench}
          min={vibeCodeBenchRange.min}
          max={vibeCodeBenchRange.max}
          color={COLORS.benchmark}
          format={(v) => `${Math.round(v)}`}
        />
      ),
      sortDescFirst: true,
      sortUndefined: "last",
    },

    // ─── Benchmarks: VendingBench ───
    {
      accessorKey: "VendingBench",
      header: ({ column }) => (
        <ColumnHeader
          column={column}
          title="Vending"
          subtitle="Net USD"
          tooltip="A benchmark for measuring AI model performance on running a business over a year; bank balance in the end (higher is better)"
          link={{
            url: "https://andonlabs.com/evals/vending-bench-2",
            title: "VendingBench 2",
          }}
          filter={{ type: "range", enabled: true, showMax: false }}
          sort={{ enabled: true }}
          draggable
        />
      ),
      cell: ({ row }) => {
        const value = row.original.VendingBench;
        if (value === null || value === undefined) {
          return <div className="font-mono text-right px-1.5 py-px text-gray-300 dark:text-slate-600">&mdash;</div>;
        }
        if (value < 0) {
          return (
            <div className="font-mono text-right px-1.5 py-px text-[12px] leading-snug text-rose-600">
              ${value.toFixed(0)}
            </div>
          );
        }
        return (
          <BarCell
            value={value}
            min={0}
            max={maxPositiveVendingBench}
            color={COLORS.profit}
            format={(v) => `$${v.toFixed(0)}`}
          />
        );
      },
      filterFn: createPriceRangeFilter,
      sortUndefined: "last",
    },

    // ─── Capabilities: Vision ───
    {
      accessorKey: "hasVision",
      meta: { groupStart: true },
      header: ({ column }) => (
        <ColumnHeader
          column={column}
          title="Vision"
          tooltip="Whether the model can process images"
          filter={{ type: "boolean", enabled: true }}
          verticalText={true}
        />
      ),
      cell: ({ row }) => (
        <span className="text-center block text-[12px]">
          {row.original.hasVision ? (
            <span className="text-emerald-500">&#10003;</span>
          ) : (
              <span className="text-gray-300 dark:text-slate-600">&mdash;</span>
          )}
        </span>
      ),
      filterFn: (row, id, value: boolean) => {
        if (value === undefined) return true;
        return row.getValue(id) === value;
      },
      maxSize: 44,
    },
  ];
};
