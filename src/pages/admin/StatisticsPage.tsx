import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Pagination } from "../../components/ui/Pagination";
import { fetchDurationStatistics, type SearchData } from "../../lib/api";
import { Icons } from "../../components/ui/Icons";
import { SearchTimingRow } from "../../components/SearchTimingRow";

// Helper Components
const DetailedStatCard = ({
    title,
    stats,
    icon: Icon,
    colorClass,
    bgClass,
}: {
    title: string;
    stats?: { avg: number; min: number; max: number };
    icon: React.ElementType;
    colorClass: string;
    bgClass: string;
}) => (
    <Card className={`h-full border-l-4 transition-shadow hover:shadow-md ${colorClass}`}>
        <CardContent className="flex h-full flex-col justify-between p-5">
            <div className="mb-4 flex items-start justify-between">
                <div className={`rounded-lg p-2 ${bgClass}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-gray-500">AVG</span>
            </div>
            <div>
                <h4 className="text-sm font-medium tracking-wide text-gray-500 uppercase">{title}</h4>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                    {stats ? Math.round(stats.avg).toLocaleString() : "-"}{" "}
                    <span className="text-sm font-normal text-gray-400">ms</span>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                    Range:{" "}
                    <span className="font-medium text-gray-600">
                        {stats ? Math.round(stats.min).toLocaleString() : "-"}
                    </span>{" "}
                    -{" "}
                    <span className="font-medium text-gray-600">
                        {stats ? Math.round(stats.max).toLocaleString() : "-"}
                    </span>{" "}
                    ms
                </div>
            </div>
        </CardContent>
    </Card>
);

const FilterBar = ({
    searchTerm,
    onSearchChange,
    resultCount,
}: {
    searchTerm: string;
    onSearchChange: (val: string) => void;
    resultCount: number;
}) => (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="w-full sm:w-96">
            <Input
                placeholder="Search by ID..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                leftIcon={<Icons.Search className="h-4 w-4" />}
            />
        </div>
        <div className="text-sm font-medium text-gray-500">Showing {resultCount} results</div>
    </div>
);

// Main Page
export default function StatisticsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const {
        data: allData = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["analytics"],
        queryFn: fetchDurationStatistics,
    });

    const aggregateStats = useMemo(() => {
        if (!allData.length) return null;

        const compute = (extractor: (d: SearchData) => number) => {
            const values = allData.map(extractor);
            const total = values.reduce((a, b) => a + b, 0);
            const min = Math.min(...values);
            const max = Math.max(...values);
            return { avg: total / values.length, min, max };
        };

        return {
            network: compute((d) => Math.max(0, d.search_duration - d.backend_total_time)),
            correction: compute((d) => d.correction_time),
            embedding: compute((d) => d.faiss_time),
            overhead: compute((d) => Math.max(0, d.backend_total_time - (d.correction_time + d.faiss_time))),
            load: compute((d) => d.product_load_duration),
        };
    }, [allData]);

    // Filter Data
    const filteredData = useMemo(() => {
        return allData.filter((item) => item.search_id.toString().includes(searchTerm));
    }, [searchTerm, allData]);

    // Paginate Data
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [currentPage, filteredData, itemsPerPage]);

    // Handle Search Change
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1); // Reset to page 1 on search
    };

    if (isLoading) {
        return <div className="py-20 text-center text-gray-500">Loading statistics...</div>;
    }

    if (isError) {
        return <div className="py-20 text-center text-red-500">Failed to load statistics.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Search Analytics Dashboard</h1>
                <p className="text-sm text-gray-500">Real-time performance & quality monitoring.</p>
            </div>

            {/* A. Statistics Grid - Detailed Breakdown */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <DetailedStatCard
                    title="Network"
                    stats={aggregateStats?.network}
                    icon={Icons.Globe}
                    colorClass="border-gray-300"
                    bgClass="bg-gray-200 text-gray-600"
                />
                <DetailedStatCard
                    title="Correction"
                    stats={aggregateStats?.correction}
                    icon={Icons.Wrench}
                    colorClass="border-amber-400"
                    bgClass="bg-amber-100 text-amber-700"
                />
                <DetailedStatCard
                    title="Vector Search"
                    stats={aggregateStats?.embedding}
                    icon={Icons.Cpu}
                    colorClass="border-indigo-500"
                    bgClass="bg-indigo-100 text-indigo-700"
                />
                <DetailedStatCard
                    title="Overhead/DB"
                    stats={aggregateStats?.overhead}
                    icon={Icons.Database}
                    colorClass="border-gray-400"
                    bgClass="bg-gray-200 text-gray-700"
                />
                <DetailedStatCard
                    title="Product Load"
                    stats={aggregateStats?.load}
                    icon={Icons.Download}
                    colorClass="border-emerald-600"
                    bgClass="bg-emerald-100 text-emerald-800"
                />
            </div>

            {/* B. Controls */}
            <FilterBar searchTerm={searchTerm} onSearchChange={handleSearch} resultCount={filteredData.length} />

            {/* C. List Content */}
            {paginatedData.length > 0 ? (
                <div>
                    {paginatedData.map((search) => (
                        <SearchTimingRow key={search.search_id} data={search} />
                    ))}
                </div>
            ) : (
                <Card className="py-20 text-center text-gray-400">
                    <CardContent>
                        <Icons.Search className="mx-auto mb-4 h-12 w-12 opacity-20" />
                        <p>No searches found matching "{searchTerm}"</p>
                    </CardContent>
                </Card>
            )}

            {/* D. Footer / Pagination */}
            {filteredData.length > 0 && (
                <div className="mt-6 flex justify-center">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-4 border-t border-gray-200 pt-6 text-xs font-medium text-gray-500">
                <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-sm bg-gray-300"></div> Network
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-sm bg-amber-400"></div> Correction
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-sm bg-indigo-500"></div> Vector Search
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-sm bg-gray-400"></div> Overhead/DB
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-sm bg-emerald-600"></div> Product Load
                </div>
            </div>
        </div>
    );
}
