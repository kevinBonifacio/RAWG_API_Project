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

    // Custom Tooltip component with improved styling and context
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            // payload[0] is for totalAdded (X-axis), payload[1] is for avgRating (Y-axis)
            const genreName = payload[0].payload?.name || 'N/A';
            const totalAdded = payload[0].value;
            const avgRating = payload[1].value;

            // Define styles using the theme colors (Indigo: #4B0082, Turquoise: #00CED1)
            const tooltipStyle = {
                backgroundColor: '#ffffff',
                border: '2px solid #00CED1', // Using theme color for border
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                lineHeight: '1.6',
            };
            const titleStyle = {
                fontWeight: '700',
                margin: '0 0 8px 0',
                fontSize: '1.1rem',
                color: '#4B0082', // Theme Primary Color
                borderBottom: '1px solid #eee',
                paddingBottom: '5px',
            };
            const itemStyle = {
                margin: 0,
                fontSize: '0.95rem',
                color: '#333',
            };

            return (
                <div style={tooltipStyle}>
                    <p style={titleStyle}>{genreName}</p>
                    <p style={itemStyle}>Popularity (Total Added): <strong>{totalAdded.toLocaleString()}</strong></p>
                    <p style={itemStyle}>Quality (Average Rating): <strong>{avgRating}</strong></p>
                </div>
            );
        }
        return null;
    };


    return (
        // Removed h3 title, adjusted margin/padding
        <div style={{ height: 450, width: '100%' }}>
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
                        tick={{ fontSize: 14 }}
                    >
                        <Label value="Total Games Added (Popularity Volume)" offset={-10} position="bottom" style={{ fontSize: '14px', fontWeight: 'bold' }} />
                    </XAxis>

                    {/* Y-Axis: Average Rating (Quality) */}
                    <YAxis
                        type="number"
                        dataKey="avgRating"
                        name="Average Rating"
                        unit=""
                        domain={[0, 5]} // Rating scale from 0 to 5
                        tick={{ fontSize: 14 }}
                    >
                        <Label value="Average Rating (Quality)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold' }} />
                    </YAxis>

                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        content={<CustomTooltip />}
                        wrapperStyle={{ zIndex: 100 }}
                    />
                    <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />

                    <Scatter
                        name="Genre"
                        data={data}
                        fill="#00CED1"
                        shape="circle"
                        opacity={0.8}
                    />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}

export default QualityScatterChart;