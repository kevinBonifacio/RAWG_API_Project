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
 * Renders a line chart showing the daily activity count of the top genres
 * over the 30-day collection window.
 * @param {Array<object>} data - Temporal data (grouped by collection date).
 * @param {Array<string>} topGenres - List of top 8 genre names to plot.
 */
function TemporalLineChart({ data, topGenres }) {
    if (!data || data.length === 0) {
        // Use the defined dashboard loading/error style for empty data message
        return <div className="loading-container" style={{height: '100%', fontSize: '1rem'}}>No temporal data available to display.</div>;
    }

    // Assign theme-aligned colors to the top 8 genres for consistent visualization.
    // Expanded color palette for 8 distinct lines
    const COLORS = [
        'var(--primary-color)',   // Color 1
        'var(--secondary-color)',  // Color 2
        '#ffc658',                 // Gold (Color 3)
        '#FF8042',                 // Orange (Color 4)
        '#82ca9d',                 // Green (Color 5)
        '#37c7ff',                 // Light Blue (Color 6)
        '#ff6590',                 // Pink (Color 7)
        '#a157e8'                  // Purple (Color 8)
    ];

    // Filter data to only include the top genres (up to 8) to avoid clutter
    const filteredData = data.map(item => {
        const newItem = { date: item.date };
        topGenres.forEach(genre => {
            newItem[genre] = item[genre] || 0; // Ensure missing values are 0
        });
        return newItem;
    });

    // Custom formatter for X-Axis to display Day/Month
    const formatXAxis = (tickItem) => {
        // tickItem is in YYYY-MM-DD format
        try {
            const dateParts = tickItem.split('-');
            const month = dateParts[1];
            const day = dateParts[2];
            return `${day}/${month}`;
        } catch (e) {
            return tickItem; // Fallback
        }
    };

    // Custom Tooltip for the Line Chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-3 bg-white border border-gray-300 rounded-lg shadow-xl text-sm">
                    <p className="font-bold text-lg mb-1 text-gray-800">Collection Date: {formatXAxis(label)}</p>
                    {payload.map((p, index) => (
                        <p key={index} style={{ color: p.stroke }}>
                            {p.name}: <span className="font-semibold">{p.value.toLocaleString()}</span> games
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };


    return (
        // CRITICAL: Using the external CSS class for responsive sizing
        <div className="chart-responsive-wrapper">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={filteredData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        // Theme-aligned tick color
                        tick={{ fontSize: 12, fill: 'var(--text-light)' }}
                        dy={10}
                        tickFormatter={formatXAxis}
                        interval="preserveStart"
                    />
                    <YAxis
                        // Theme-aligned label and tick color
                        label={{ value: 'Daily Activity Count (Games Processed)', angle: -90, position: 'insideLeft', style: { fontSize: '14px', fontWeight: 'bold', fill: 'var(--text-light)' } }}
                        tick={{ fontSize: 12, fill: 'var(--text-light)' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {/* Theme-aligned legend color */}
                    <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px', color: 'var(--text-dark)' }} />

                    {/* Render a Line for each of the top 8 genres */}
                    {topGenres.map((genre, index) => (
                        <Line
                            key={genre}
                            type="monotone"
                            dataKey={genre}
                            // Removed stackId
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={1}
                            activeDot={{ r: 6 }}
                            dot={{ r: 3 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default TemporalLineChart;