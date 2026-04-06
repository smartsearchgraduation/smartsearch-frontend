import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Icons } from "../../components/ui/Icons";
import { Select } from "../../components/ui/Select";
import { Tooltip } from "../../components/ui/Tooltip";
import {
    fetchCorrectionModels,
    fetchRetrievalIndexStats,
    fetchRetrievalModels,
    fetchRetrievalStats,
    saveAndRebuildSelectedRetrievalModels,
    saveSelectedCorrectionEngine,
} from "../../lib/api";

const REBUILD_WAIT_SECONDS = 60;

type AlertState = {
    type: "success" | "error";
    message: string;
};

export default function SettingsPage() {
    const queryClient = useQueryClient();

    const [userTextualModel, setUserTextualModel] = useState<string | null>(null);
    const [userVisualModel, setUserVisualModel] = useState<string | null>(null);
    const [userCorrectionEngine, setUserCorrectionEngine] = useState<string | null>(null);
    const [userFusion, setUserFusion] = useState<"early" | "late" | null>(null);

    const [retrievalAlert, setRetrievalAlert] = useState<AlertState | null>(null);
    const [correctionAlert, setCorrectionAlert] = useState<AlertState | null>(null);

    const {
        data: retrievalModelsData,
        isLoading: isRetrievalModelsLoading,
        isError: isRetrievalModelsError,
    } = useQuery({
        queryKey: ["retrieval-models"],
        queryFn: fetchRetrievalModels,
    });

    const {
        data: retrievalStatsData,
        isLoading: isRetrievalStatsLoading,
        isError: isRetrievalStatsError,
    } = useQuery({
        queryKey: ["retrieval-stats"],
        queryFn: fetchRetrievalStats,
    });

    const {
        data: indexStatsData,
        isLoading: isIndexStatsLoading,
        isError: isIndexStatsError,
    } = useQuery({
        queryKey: ["retrieval-index-stats"],
        queryFn: fetchRetrievalIndexStats,
    });

    const {
        data: correctionModelsData,
        isLoading: isCorrectionModelsLoading,
        isError: isCorrectionModelsError,
    } = useQuery({
        queryKey: ["correction-models"],
        queryFn: fetchCorrectionModels,
    });

    // Derive displayed values: user override → server active → server default → ""
    const selectedTextualModel =
        userTextualModel ??
        retrievalStatsData?.data.selected_models.textual_model ??
        retrievalModelsData?.data.defaults.textual ??
        "";

    const selectedVisualModel =
        userVisualModel ??
        retrievalStatsData?.data.selected_models.visual_model ??
        retrievalModelsData?.data.defaults.visual ??
        "";

    const selectedFusion =
        userFusion ??
        (retrievalStatsData?.data.selected_models.fusion_endpoint as "early" | "late" | undefined) ??
        "late";

    const selectedCorrectionEngine =
        userCorrectionEngine ??
        correctionModelsData?.data.selected_engine ??
        correctionModelsData?.data.defaults.engine ??
        "";

    const saveRetrievalMutation = useMutation({
        mutationFn: saveAndRebuildSelectedRetrievalModels,
        onSuccess: (response) => {
            setRetrievalAlert({
                type: "success",
                message: `Models saved and index rebuilt successfully (${response.data.successful_count}/${response.data.total_products} successful, ${response.data.failed_count} failed, ${Math.round(response.data.total_duration_ms / 1000)}s)`,
            });
            queryClient.invalidateQueries({ queryKey: ["retrieval-stats"] });
            queryClient.invalidateQueries({ queryKey: ["retrieval-index-stats"] });
        },
        onError: (error) => {
            setRetrievalAlert({
                type: "error",
                message: error.message || "Failed to save retrieval models",
            });
        },
    });

    const saveCorrectionMutation = useMutation({
        mutationFn: saveSelectedCorrectionEngine,
        onSuccess: (response) => {
            setCorrectionAlert({
                type: "success",
                message: response.message,
            });
        },
        onError: (error) => {
            setCorrectionAlert({
                type: "error",
                message: error.message || "Failed to save correction engine",
            });
        },
    });

    const indexRows = useMemo(() => Object.entries(indexStatsData?.indices ?? {}), [indexStatsData?.indices]);

    const textualModelOptions = useMemo(
        () =>
            retrievalModelsData?.data.textual_models.map((model) => ({
                value: model.name,
                label: `${model.name} (${model.dimension})`,
            })) ?? [],
        [retrievalModelsData?.data.textual_models],
    );

    const visualModelOptions = useMemo(
        () =>
            retrievalModelsData?.data.visual_models.map((model) => ({
                value: model.name,
                label: `${model.name} (${model.dimension})`,
            })) ?? [],
        [retrievalModelsData?.data.visual_models],
    );

    const correctionEngineOptions = useMemo(
        () =>
            correctionModelsData?.data.engines.map((engine) => ({
                value: engine.name,
                label: `${engine.name} - ${engine.description}`,
            })) ?? [],
        [correctionModelsData?.data.engines],
    );

    // Fusion validation logic
    const canUseEarlyFusion = selectedTextualModel === selectedVisualModel;

    // Auto-switch to late fusion if early fusion becomes invalid
    useEffect(() => {
        if (selectedFusion === "early" && !canUseEarlyFusion) {
            setUserFusion("late");
        }
    }, [selectedFusion, canUseEarlyFusion]);

    const isRebuildRunning = saveRetrievalMutation.isPending;

    const isRetrievalSectionLoading = isRetrievalModelsLoading || isRetrievalStatsLoading;
    const isRetrievalSectionError = isRetrievalModelsError || isRetrievalStatsError;

    const handleSaveAndRebuild = () => {
        setRetrievalAlert(null);

        saveRetrievalMutation.mutate({
            textual_model: selectedTextualModel,
            visual_model: selectedVisualModel,
            fusion_endpoint: selectedFusion,
            wait_duration_seconds: REBUILD_WAIT_SECONDS,
        });
    };

    const handleSaveCorrection = () => {
        setCorrectionAlert(null);

        saveCorrectionMutation.mutate({
            engine: selectedCorrectionEngine,
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                <p className="text-sm text-gray-500">
                    Select active retrieval and correction models for admin operations.
                </p>
            </div>

            <Card className="relative overflow-hidden">
                {isRebuildRunning && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-[1px]">
                        <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-md ring-1 ring-gray-200">
                            <Icons.Activity className="h-5 w-5 animate-pulse text-emerald-600" />
                            <span className="text-sm font-semibold text-gray-700">
                                Rebuilding index... this can take up to {REBUILD_WAIT_SECONDS} seconds.
                            </span>
                        </div>
                    </div>
                )}

                <CardContent className="space-y-5 p-5">
                    <div className="flex items-center gap-2">
                        <Icons.Layers className="h-5 w-5 text-emerald-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Retrieval Models</h2>
                    </div>

                    {isRetrievalSectionLoading ? (
                        <div className="text-sm text-gray-500">Loading retrieval settings...</div>
                    ) : isRetrievalSectionError ? (
                        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                            Failed to load retrieval settings.
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Select
                                        id="textual-model-select"
                                        label="Textual model"
                                        options={textualModelOptions}
                                        value={selectedTextualModel}
                                        onChange={setUserTextualModel}
                                        disabled={isRebuildRunning}
                                    />
                                </div>

                                <div>
                                    <Select
                                        id="visual-model-select"
                                        label="Visual model"
                                        options={visualModelOptions}
                                        value={selectedVisualModel}
                                        onChange={setUserVisualModel}
                                        disabled={isRebuildRunning}
                                    />
                                </div>
                            </div>

                            {/* Fusion Selection Cards */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-gray-700">Fusion Strategy</h3>
                                <div className="grid h-full grid-cols-1 gap-3 sm:grid-cols-2">
                                    {/* Early Fusion Card */}
                                    <Tooltip
                                        content={
                                            !canUseEarlyFusion
                                                ? "Early fusion requires identical textual and visual models"
                                                : ""
                                        }
                                        className="h-full"
                                    >
                                        <Card
                                            variant="flat"
                                            className={`h-full cursor-pointer transition-all ${
                                                selectedFusion === "early"
                                                    ? "bg-emerald-50 ring-2 ring-emerald-500"
                                                    : canUseEarlyFusion
                                                      ? "hover:shadow-sm"
                                                      : "cursor-not-allowed opacity-50"
                                            }`}
                                            onClick={() => canUseEarlyFusion && setUserFusion("early")}
                                        >
                                            <CardContent className="flex h-full flex-col justify-between p-4">
                                                <div className="space-y-1">
                                                    <h4 className="font-semibold text-gray-900">Early Fusion</h4>
                                                    <p className="text-xs text-gray-600">
                                                        Combines textual and visual features at the embedding level
                                                        before indexing. Requires identical model architectures.
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Tooltip>

                                    {/* Late Fusion Card */}
                                    <Card
                                        variant="flat"
                                        className={`h-full cursor-pointer transition-all ${
                                            selectedFusion === "late"
                                                ? "bg-emerald-50 ring-2 ring-emerald-500"
                                                : "hover:shadow-sm"
                                        }`}
                                        onClick={() => setUserFusion("late")}
                                    >
                                        <CardContent className="flex h-full flex-col justify-between p-4">
                                            <div className="space-y-1">
                                                <h4 className="font-semibold text-gray-900">Late Fusion</h4>
                                                <p className="text-xs text-gray-600">
                                                    Combines textual and visual search results at the ranking level.
                                                    Works with any model combination.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    onClick={handleSaveAndRebuild}
                                    disabled={!selectedTextualModel || !selectedVisualModel || isRebuildRunning}
                                >
                                    Save & Rebuild
                                </Button>
                                <span className="text-xs text-gray-500">
                                    The form is locked while rebuild is running.
                                </span>
                            </div>
                        </>
                    )}

                    {retrievalAlert && (
                        <div
                            className={`rounded-lg px-3 py-2 text-sm ${retrievalAlert.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}
                        >
                            {retrievalAlert.message}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent className="space-y-5 p-5">
                    <div className="flex items-center gap-2">
                        <Icons.Wrench className="h-5 w-5 text-amber-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Correction Engine</h2>
                    </div>

                    {isCorrectionModelsLoading ? (
                        <div className="text-sm text-gray-500">Loading correction engines...</div>
                    ) : isCorrectionModelsError ? (
                        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                            Failed to load correction engines.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
                            <div>
                                <Select
                                    id="correction-engine-select"
                                    label="Correction engine"
                                    options={correctionEngineOptions}
                                    value={selectedCorrectionEngine}
                                    onChange={setUserCorrectionEngine}
                                    disabled={saveCorrectionMutation.isPending}
                                />
                            </div>

                            <Button
                                className="mb-1"
                                onClick={handleSaveCorrection}
                                disabled={!selectedCorrectionEngine || saveCorrectionMutation.isPending}
                            >
                                {saveCorrectionMutation.isPending ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    )}

                    {correctionAlert && (
                        <div
                            className={`rounded-lg px-3 py-2 text-sm ${correctionAlert.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}
                        >
                            {correctionAlert.message}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent className="space-y-4 p-5">
                    <h2 className="text-lg font-semibold text-gray-900">Index Stats</h2>

                    {isIndexStatsLoading ? (
                        <div className="text-sm text-gray-500">Loading index stats...</div>
                    ) : isIndexStatsError ? (
                        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                            Failed to load index stats.
                        </div>
                    ) : indexRows.length === 0 ? (
                        <div className="text-sm text-gray-500">No index stats available.</div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg ring-1 ring-gray-200">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Index</th>
                                        <th className="px-4 py-3">Textual</th>
                                        <th className="px-4 py-3">Visual</th>
                                        <th className="px-4 py-3">Fused</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {indexRows.map(([indexName, stat]) => (
                                        <tr key={indexName} className="border-t border-gray-100">
                                            <td className="px-4 py-3 font-medium text-gray-800">{indexName}</td>
                                            <td className="px-4 py-3 text-gray-600">{stat.textual}</td>
                                            <td className="px-4 py-3 text-gray-600">{stat.visual}</td>
                                            <td className="px-4 py-3 text-gray-600">{stat.fused}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
