import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GamesChart = ({ data }) => {
    // Example: Top 10 games by Added_Count
    const topGames = data
        .sort((a, b) => b.Added_Count - a.Added_Count)
        .slice(0, 10);

    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topGames} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="Name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Added_Count" fill="#8884d8" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default GamesChart;
