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
        <div style={{ height: 450, width: '100%', marginBottom: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#4B0082" name="Total Games Added" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default GenreBarChart;