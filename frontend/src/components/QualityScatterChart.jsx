// src/components/QualityScatterChart.jsx

import React from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Label
} from 'recharts';

/**
 * Renders a scatter chart comparing Average Rating (Quality) vs. Total Added Count (Popularity).
 * @param {Array<{name: string, avgRating: number, totalAdded: number}>} data - Processed quality data.
 */
function QualityScatterChart({ data }) {
    if (!data || data.length === 0) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>No quality data available to display.</div>;
    }

    // Custom Tooltip component to display the genre name
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            // payload[0] is for totalAdded (X-axis), payload[1] is for avgRating (Y-axis)
            const genreName = payload[0].payload.name;
            return (
                <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                    <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>{genreName}</p>
                    <p style={{ margin: 0 }}>Total Added: {payload[0].value.toLocaleString()}</p>
                    <p style={{ margin: 0 }}>Average Rating: {payload[1].value}</p>
                </div>
            );
        }
        return null;
    };


    return (
        <div style={{ height: 450, width: '100%', marginBottom: '20px', marginTop: '30px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Quality (Avg Rating) vs. Popularity (Total Added)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />

                    {/* X-Axis: Total Added Count (Popularity) */}
                    <XAxis
                        type="number"
                        dataKey="totalAdded"
                        name="Total Added Count"
                        unit=""
                    >
                        <Label value="Total Games Added (Popularity Volume)" offset={-10} position="bottom" />
                    </XAxis>

                    {/* Y-Axis: Average Rating (Quality) */}
                    <YAxis
                        type="number"
                        dataKey="avgRating"
                        name="Average Rating"
                        unit=""
                        domain={[0, 5]} // Rating scale from 0 to 5
                    >
                        <Label value="Average Rating (Quality)" angle={-90} position="left" style={{ textAnchor: 'middle' }} />
                    </YAxis>

                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                    <Legend />

                    <Scatter
                        name="Genre"
                        data={data}
                        fill="#00CED1"
                        shape="circle"
                    />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}

export default QualityScatterChart;