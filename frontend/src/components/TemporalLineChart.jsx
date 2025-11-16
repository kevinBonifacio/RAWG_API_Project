// src/components/TemporalLineChart.jsx

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

/**
 * Renders a stacked line chart showing the total added count of top genres over time.
 * @param {Array<object>} data - Temporal data (grouped by month).
 * @param {Array<string>} topGenres - List of top 5 genre names to plot.
 */
function TemporalLineChart({ data, topGenres }) {
    if (!data || data.length === 0) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>No temporal data available to display.</div>;
    }

    // Assign colors to the top 5 genres for consistent visualization
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#FF8042', '#0088FE'];

    // Filter data to only include the top 5 genres to avoid clutter
    const filteredData = data.map(item => {
        const newItem = { date: item.date };
        topGenres.forEach(genre => {
            newItem[genre] = item[genre] || 0; // Ensure missing values are 0
        });
        return newItem;
    });

    return (
        <div style={{ height: 450, width: '100%', marginBottom: '20px', marginTop: '30px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Growth Trend: Monthly Added Count for Top 5 Genres</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={filteredData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: 'Games Added (Count)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />

                    {/* Render a Line for each of the top 5 genres */}
                    {topGenres.map((genre, index) => (
                        <Line
                            key={genre}
                            type="monotone"
                            dataKey={genre}
                            stackId="a" // Use stackId if you want a stacked area chart, or remove for simple lines
                            stroke={COLORS[index % COLORS.length]}
                            activeDot={{ r: 8 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default TemporalLineChart;