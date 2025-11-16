// src/components/GameDashboard.jsx

import React from 'react';
import { useGameData } from '../hooks/useGameData';
import GenreBarChart from './GenreBarChart';
import QualityScatterChart from './QualityScatterChart';
import TemporalLineChart from './TemporalLineChart';

function GameDashboard() {
    const {
        topGenres,
        qualityVsPopularity,
        temporalTrends,
        temporalGenres,
        loading,
        error,
        totalRecords
    } = useGameData();

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading **all** historical game data from local server...</div>;
    }

    if (error) {
        return <div style={{ color: 'white', backgroundColor: '#dc3545', padding: '15px', textAlign: 'center' }}>
            **Error:** {error}
        </div>;
    }

    return (
        <div className="dashboard-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
            <h1 style={{ textAlign: 'center', color: '#4B0082', borderBottom: '3px solid #f0f0f0', paddingBottom: '15px', marginBottom: '30px' }}>
                RAWG Trend Analysis Dashboard
            </h1>

            <p style={{ fontSize: '1.1em', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#e9ecef', padding: '10px', borderRadius: '5px' }}>
                Total Historical Records Analyzed (Excluding Today): **{totalRecords.toLocaleString()}**
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>

                {/* 1. Genre Popularity Chart */}
                <div>
                    <h2 style={{ color: '#00CED1', borderBottom: '1px solid #00CED1', paddingBottom: '5px' }}>
                        1. Top 10 Genres by Popularity Volume
                    </h2>
                    <GenreBarChart data={topGenres} />
                </div>

                {/* 2. Quality vs. Popularity Chart */}
                <div>
                    <h2 style={{ color: '#00CED1', borderBottom: '1px solid #00CED1', paddingBottom: '5px' }}>
                        2. Genre Performance: Quality vs. Popularity
                    </h2>
                    <QualityScatterChart data={qualityVsPopularity} />
                </div>

                {/* 3. Temporal Trend Chart */}
                <div>
                    <h2 style={{ color: '#00CED1', borderBottom: '1px solid #00CED1', paddingBottom: '5px' }}>
                        3. Temporal Trends: Genre Growth Rate Over Time
                    </h2>
                    <TemporalLineChart
                        data={temporalTrends}
                        topGenres={temporalGenres}
                    />
                </div>
            </div>

        </div>
    );
}

export default GameDashboard;