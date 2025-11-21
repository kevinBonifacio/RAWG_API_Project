import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

/**
 * Renders a Bar Chart showing the count of games per platform.
 * @param {Array<object>} data - Top 10 platforms with their counts.
 */
function PlatformBarChart({ data }) {
    if (!data || data.length === 0) {
        return <div className="loading-container" style={{height: '100%', fontSize: '1rem'}}>No platform data available to display.</div>;
    }

    // Custom Tooltip for better readability and matching dashboard aesthetics
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-3 bg-white border-l-4 border-[var(--secondary-color)] rounded-lg shadow-xl text-sm">
                    {/* Bolder, clearer color for the label */}
                    <p className="font-extrabold text-lg mb-1 text-[var(--secondary-color)]">{label}</p>
                    {/* Ensure text is dark for maximum clarity */}
                    <p className="text-[var(--text-dark)]">Total Games: <span className="font-bold text-base text-[var(--secondary-color)]">{payload[0].value.toLocaleString()}</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="chart-responsive-wrapper">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        type="number"
                        label={{ value: 'Game Count (Volume)', position: 'bottom', dy: 10, style: { fontSize: '14px', fontWeight: 'bold', fill: 'var(--text-light)' } }}
                        tickFormatter={(value) => value.toLocaleString()}
                        tick={{ fontSize: 12, fill: 'var(--text-light)' }}
                    />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{ fontSize: 13, fill: 'var(--text-dark)' }}
                    />
                    <Tooltip
                        cursor={{ fill: '#f4f4f4' }}
                        contentStyle={{ fontSize: '16px', borderRadius: '8px', border: '1px solid #ddd', padding: '10px' }}
                    />
                    {/* Using the secondary color for visual distinction from the Genre chart */}
                    <Bar dataKey="value" fill="var(--secondary-color)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default PlatformBarChart;