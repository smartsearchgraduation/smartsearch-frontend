import { Card } from "./ui/Card";
import { Icons } from "./ui/Icons";
import type { SearchData } from "../lib/api";

export const SearchTimingRow = ({ data }: { data: SearchData }) => {
    const networkLatency = Math.max(0, data.search_duration - data.backend_total_time);
    const totalDuration = data.search_duration + data.product_load_duration;

    const getPct = (val: number) => (val / totalDuration) * 100;
    const widthNetwork = getPct(networkLatency);
    const widthBackend = getPct(data.backend_total_time);
    const widthProductLoad = getPct(data.product_load_duration);

    const knownBackendWork = data.correction_time + data.faiss_time;
    const backendOverhead = Math.max(0, data.backend_total_time - knownBackendWork);
    const getBackendPct = (val: number) => (val / data.backend_total_time) * 100;
    const fmt = (n: number) => `${Math.round(n).toLocaleString()} ms`;

    // Determine Relevancy Color
    const getRelevancyColor = (score: number) => {
        if (score >= 0.8) return "text-emerald-600 bg-emerald-50 border-emerald-100";
        if (score >= 0.5) return "text-amber-600 bg-amber-50 border-amber-100";
        return "text-red-600 bg-red-50 border-red-100";
    };

    return (
        <Card className="mb-4 overflow-visible p-5 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md">
            {/* Header Row: Identifiers vs Metrics */}
            <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row">
                {/* Left: ID & Flags */}
                <div className="flex items-center gap-3">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
                        <span className="font-mono text-gray-400">#</span>
                        {data.search_id}
                    </h3>
                    {data.correction_time > 1000 && (
                        <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 uppercase">
                            <Icons.Wrench className="h-3 w-3" /> High Correction
                        </span>
                    )}
                </div>

                {/* Right: Metrics Cluster */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    {/* Metric 1: Relevancy Score */}
                    {data.relevancy_score !== undefined && data.relevancy_score !== null && (
                        <div
                            className={`flex items-center gap-2 rounded-full border px-3 py-1 ${getRelevancyColor(data.relevancy_score)}`}
                        >
                            <Icons.Target className="h-3.5 w-3.5" />
                            <span className="font-bold">Score: {data.relevancy_score.toFixed(2)}</span>
                        </div>
                    )}

                    {/* Metric 2: Result Count */}
                    <div className="flex items-center gap-2 text-gray-500">
                        <Icons.Layers className="h-3.5 w-3.5" />
                        <span>{data.result_count} results</span>
                    </div>

                    {/* Metric 3: Total Time */}
                    <div className="flex items-center gap-2 border-l border-gray-200 pl-4 text-gray-500">
                        <Icons.Clock className="h-3.5 w-3.5" />
                        <span className="font-medium text-gray-700">{fmt(totalDuration)}</span>
                    </div>
                </div>
            </div>

            {/* The Visual Bar */}
            <div className="relative flex h-12 w-full overflow-visible rounded-lg bg-gray-100 ring-1 ring-gray-200">
                {/* Network */}
                <div
                    style={{ width: `${widthNetwork}%` }}
                    className="group relative flex h-full flex-col items-center justify-center bg-gray-300 first:rounded-l-lg"
                >
                    {widthNetwork > 5 && <span className="text-[10px] font-bold text-gray-600 opacity-60">NET</span>}
                    <div className="absolute bottom-full z-20 mb-1 hidden rounded bg-gray-800 p-2 text-xs whitespace-nowrap text-white shadow-lg group-hover:block">
                        <span className="font-semibold">Initial Network:</span> {fmt(networkLatency)}
                    </div>
                </div>

                {/* Backend */}
                <div style={{ width: `${widthBackend}%` }} className="group/backend relative flex h-full flex-col">
                    <div className="absolute -top-3 left-0 flex w-full justify-center opacity-0 transition-opacity duration-200 group-hover/backend:opacity-100">
                        <div className="-mt-1 flex h-2 w-[98%] justify-center rounded-t-sm border-x-2 border-t-2 border-blue-200">
                            <span className="-mt-2.5 bg-white px-1 text-[10px] font-bold text-blue-500">BACKEND</span>
                        </div>
                    </div>
                    <div className="flex h-full w-full">
                        {/* Correction */}
                        {data.correction_time > 0 && (
                            <div
                                style={{ width: `${getBackendPct(data.correction_time)}%` }}
                                className="group/part relative flex h-full items-center justify-center bg-amber-400 transition-colors hover:bg-amber-500"
                            >
                                <div className="absolute bottom-full z-30 mb-1 hidden rounded bg-gray-800 p-2 text-xs font-bold whitespace-nowrap text-amber-400 shadow-lg group-hover/part:block">
                                    <span className="font-normal text-white">Correction:</span>{" "}
                                    {fmt(data.correction_time)}
                                </div>
                            </div>
                        )}
                        {/* Vector Search */}
                        <div
                            style={{ width: `${getBackendPct(data.faiss_time)}%` }}
                            className="group/part relative flex h-full items-center justify-center bg-indigo-500 transition-colors hover:bg-indigo-600"
                        >
                            <div className="absolute bottom-full z-30 mb-1 hidden rounded bg-gray-800 p-2 text-xs font-bold whitespace-nowrap text-indigo-300 shadow-lg group-hover/part:block">
                                <span className="font-normal text-white">Embedding + Search:</span>{" "}
                                {fmt(data.faiss_time)}
                            </div>
                        </div>
                        {/* Overhead */}
                        <div
                            style={{ width: `${getBackendPct(backendOverhead)}%` }}
                            className="group/part relative flex h-full items-center justify-center bg-gray-400 transition-colors hover:bg-gray-500"
                        >
                            <div className="absolute bottom-full z-30 mb-1 hidden rounded bg-gray-800 p-2 text-xs font-bold whitespace-nowrap text-gray-300 shadow-lg group-hover/part:block">
                                <span className="font-normal text-white">App Overhead / DB:</span>{" "}
                                {fmt(backendOverhead)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Load */}
                <div
                    style={{ width: `${widthProductLoad}%` }}
                    className="group relative flex h-full items-center justify-center bg-emerald-600 last:rounded-r-lg"
                >
                    {widthProductLoad > 8 && (
                        <span className="text-[10px] font-bold tracking-wider text-emerald-100 opacity-90">LOAD</span>
                    )}
                    <div className="absolute right-0 bottom-full z-20 mb-1 hidden rounded bg-gray-800 p-2 text-xs whitespace-nowrap text-white shadow-lg group-hover:block">
                        <div className="flex items-center gap-2 font-bold">
                            <Icons.Download className="h-3 w-3" /> Product Details Fetch
                        </div>
                        <div className="text-emerald-300">{fmt(data.product_load_duration)}</div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
