import { fetchDurationStatistics } from "../../lib/api";

function StatisticsPage() {
    fetchDurationStatistics().then((data) => console.log(data));

    return (
        <div>
            <h2 className="text-2xl font-bold">Statistics</h2>
            <p>Statistics and analytics will go here.</p>
        </div>
    );
}

export default StatisticsPage;
