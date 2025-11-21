// src/components/GenreBarChart.jsx

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

function GenreBarChart({ data }) {
    if (!data || data.length === 0) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>No genre data available to display.</div>;
    }

    return (
        <div style={{ height: 600, width: '100%', marginBottom: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    // Increased left margin to fit larger Y-axis labels
                    margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                    layout="vertical"
                >
                    <CartesianGrid strokeDasharray="3 3" />

                    {/* Increased font size for X-axis numbers */}
                    <XAxis type="number" tick={{ fontSize: 16 }} />

                    {/* Increased width to 150 and font size to 16px for Genre names */}
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={150}
                        tick={{ fontSize: 16, fontWeight: 'bold', fill: '#333' }}
                    />

                    {/* Larger text for the tooltip popup */}
                    <Tooltip
                        cursor={{ fill: '#f4f4f4' }}
                        contentStyle={{ fontSize: '16px', borderRadius: '8px', border: '1px solid #ddd', padding: '10px' }}
                    />

                    {/* Larger text for the Legend */}
                    <Legend wrapperStyle={{ fontSize: '16px', paddingTop: '20px' }} />

                    {/* Thicker bars (barSize=32) with rounded edges for better visibility */}
                    <Bar
                        dataKey="value"
                        fill="#4B0082"
                        name="Total Games Added"
                        barSize={32}
                        radius={[0, 4, 4, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default GenreBarChart;