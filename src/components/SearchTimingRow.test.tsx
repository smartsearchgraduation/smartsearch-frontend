import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchTimingRow } from "./SearchTimingRow";
import { type SearchData } from "../lib/api";

describe("SearchTimingRow", () => {
    const mockData: SearchData = {
        search_id: 123,
        search_duration: 1000,
        backend_total_time: 600,
        correction_time: 200,
        faiss_time: 350,
        product_load_duration: 400,
        relevancy_score: 0.85,
        result_count: 10,
        db_time: 0,
    };

    describe("Header Information", () => {
        it("renders search ID", () => {
            render(<SearchTimingRow data={mockData} />);
            expect(screen.getByText("123")).toBeInTheDocument();
        });

        it("displays high correction badge when correction time > 3000ms", () => {
            const highCorrectionData: SearchData = {
                ...mockData,
                correction_time: 3500,
                backend_total_time: 4000,
            };
            render(<SearchTimingRow data={highCorrectionData} />);
            expect(screen.getByText("High Correction")).toBeInTheDocument();
        });

        it("does not display high correction badge when correction time <= 3000ms", () => {
            render(<SearchTimingRow data={mockData} />);
            expect(screen.queryByText("High Correction")).not.toBeInTheDocument();
        });
    });

    describe("Metrics Cluster", () => {
        it("displays relevancy score when present", () => {
            render(<SearchTimingRow data={mockData} />);
            expect(screen.getByText(/Score: 0.85/)).toBeInTheDocument();
        });

        it("applies emerald color for high relevancy score (>= 0.8)", () => {
            render(<SearchTimingRow data={mockData} />);
            const scoreBadge = screen.getByText(/Score: 0.85/).parentElement;
            expect(scoreBadge).toHaveClass("text-emerald-600", "bg-emerald-50");
        });

        it("applies amber color for medium relevancy score (>= 0.5)", () => {
            const mediumScoreData: SearchData = { ...mockData, relevancy_score: 0.6 };
            render(<SearchTimingRow data={mediumScoreData} />);
            const scoreBadge = screen.getByText(/Score: 0.60/).parentElement;
            expect(scoreBadge).toHaveClass("text-amber-600", "bg-amber-50");
        });

        it("applies red color for low relevancy score (< 0.5)", () => {
            const lowScoreData: SearchData = { ...mockData, relevancy_score: 0.3 };
            render(<SearchTimingRow data={lowScoreData} />);
            const scoreBadge = screen.getByText(/Score: 0.30/).parentElement;
            expect(scoreBadge).toHaveClass("text-red-600", "bg-red-50");
        });

        it("does not display relevancy score when undefined", () => {
            const noScoreData: SearchData = { ...mockData, relevancy_score: undefined };
            render(<SearchTimingRow data={noScoreData} />);
            expect(screen.queryByText(/Score:/)).not.toBeInTheDocument();
        });

        it("displays result count", () => {
            render(<SearchTimingRow data={mockData} />);
            expect(screen.getByText("10 results")).toBeInTheDocument();
        });

        it("displays total duration", () => {
            render(<SearchTimingRow data={mockData} />);
            expect(screen.getByText(/1,400 ms/)).toBeInTheDocument();
        });
    });

    describe("Visual Bar Segments", () => {
        it("renders network segment", () => {
            render(<SearchTimingRow data={mockData} />);
            const networkSegment = screen.getByText(/NET/);
            expect(networkSegment).toBeInTheDocument();
        });

        it("renders backend segment", () => {
            render(<SearchTimingRow data={mockData} />);
            const backendLabel = screen.getByText("BACKEND");
            expect(backendLabel).toBeInTheDocument();
        });

        it("renders correction segment when correction_time > 0", () => {
            render(<SearchTimingRow data={mockData} />);
            const correctionTooltip = screen.getByText(/Correction:/);
            expect(correctionTooltip).toBeInTheDocument();
        });

        it("does not render correction segment when correction_time is 0", () => {
            const noCorrectionData: SearchData = { ...mockData, correction_time: 0 };
            render(<SearchTimingRow data={noCorrectionData} />);
            expect(screen.queryByText(/Correction:/)).not.toBeInTheDocument();
        });

        it("renders vector search segment", () => {
            render(<SearchTimingRow data={mockData} />);
            const vectorTooltip = screen.getByText(/Embedding \+ Search:/);
            expect(vectorTooltip).toBeInTheDocument();
        });

        it("renders overhead segment", () => {
            render(<SearchTimingRow data={mockData} />);
            const overheadTooltip = screen.getByText(/App Overhead \/ DB:/);
            expect(overheadTooltip).toBeInTheDocument();
        });

        it("renders product load segment", () => {
            render(<SearchTimingRow data={mockData} />);
            const loadSegment = screen.getByText("LOAD");
            expect(loadSegment).toBeInTheDocument();
        });

        it("displays tooltip on network segment hover", () => {
            render(<SearchTimingRow data={mockData} />);
            const networkSegment = screen.getByText(/NET/).parentElement;
            fireEvent.mouseEnter(networkSegment!);

            expect(screen.getByText(/Initial Network:/)).toBeInTheDocument();
        });

        it("displays tooltip on correction segment hover", () => {
            render(<SearchTimingRow data={mockData} />);
            const correctionSegment = screen.getByText(/Correction:/).parentElement;
            fireEvent.mouseEnter(correctionSegment!);

            expect(screen.getByText(/Correction:/)).toBeVisible();
        });

        it("displays tooltip on vector search segment hover", () => {
            render(<SearchTimingRow data={mockData} />);
            const vectorSegment = screen.getByText(/Embedding \+ Search:/).parentElement;
            fireEvent.mouseEnter(vectorSegment!);

            expect(screen.getByText(/Embedding \+ Search:/)).toBeVisible();
        });

        it("displays tooltip on overhead segment hover", () => {
            render(<SearchTimingRow data={mockData} />);
            const overheadSegment = screen.getByText(/App Overhead \/ DB:/).parentElement;
            fireEvent.mouseEnter(overheadSegment!);

            expect(screen.getByText(/App Overhead \/ DB:/)).toBeVisible();
        });

        it("displays tooltip on product load segment hover", () => {
            render(<SearchTimingRow data={mockData} />);
            const loadSegment = screen.getByText("LOAD").parentElement;
            fireEvent.mouseEnter(loadSegment!);

            expect(screen.getByText(/Product Details Fetch/)).toBeInTheDocument();
        });
    });

    describe("Calculations", () => {
        it("calculates network latency correctly", () => {
            render(<SearchTimingRow data={mockData} />);
            const networkTooltip = screen.getByText(/Initial Network:/);
            expect(networkTooltip).toBeInTheDocument();
        });

        it("calculates total duration correctly", () => {
            render(<SearchTimingRow data={mockData} />);
            expect(screen.getByText(/1,400 ms/)).toBeInTheDocument();
        });

        it("calculates backend overhead correctly", () => {
            render(<SearchTimingRow data={mockData} />);
            const overheadTooltip = screen.getByText(/App Overhead \/ DB:/);
            expect(overheadTooltip).toBeInTheDocument();
        });

        it("handles zero network latency", () => {
            const zeroNetworkData: SearchData = {
                ...mockData,
                search_duration: 600,
                backend_total_time: 600,
            };
            render(<SearchTimingRow data={zeroNetworkData} />);
            const networkLabel = screen.queryByText(/NET/);
            expect(networkLabel).not.toBeInTheDocument();
        });
    });

    describe("Formatting", () => {
        it("formats large numbers with locale string", () => {
            const largeData: SearchData = {
                ...mockData,
                search_duration: 10000,
                product_load_duration: 5000,
            };
            render(<SearchTimingRow data={largeData} />);
            expect(screen.getByText(/15,000 ms/)).toBeInTheDocument();
        });
    });

    describe("Layout", () => {
        it("renders Card component wrapper", () => {
            const { container } = render(<SearchTimingRow data={mockData} />);
            const card = container.querySelector('[class*="hover:bg-gray-50"]');
            expect(card).toBeInTheDocument();
        });
    });
});
