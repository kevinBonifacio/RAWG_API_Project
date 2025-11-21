import React from 'react';
import { useGameData } from '../hooks/useGameData';
import GenreBarChart from './GenreBarChart';
import PlatformBarChart from './PlatformBarChart.jsx';
import QualityScatterChart from './QualityScatterChart';
import TemporalLineChart from './TemporalLineChart';
import GenrePlatformDistributionChart from './GenrePlatformDistributionChart';
import './GameDashboard.css';


function GameDashboard() {
    const {
        topGenres,
        topPlatforms,
        qualityVsPopularity,
        temporalTrends,
        temporalGenres,
        genrePlatformMatrix,
        loading,
        error,
        totalRecords
    } = useGameData();

    if (loading) {
        return (
            <div className="loading-container">
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Loading game data...</p>
                    <p style={{ color: 'var(--text-light)', fontSize: '1rem' }}>Fetching CSV files from the last 30 days. This may take a moment.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-box">
                    <strong style={{fontSize: '1.2rem'}}>Data Error</strong>
                    <p>{error}</p>
                    <p style={{fontSize: '0.9rem', color: '#888'}}>
                        Please ensure your Python data collection server is running and data files (e.g., `rawg_YYYY-MM-DD.csv`) exist in its directory.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header Section */}
            <header className="dashboard-header">
                <h1 className="dashboard-title">RAWG Trend Analysis Dashboard</h1>
                <div className="stats-banner">
                    <p className="stats-text">
                        Total Games Analyzed (Last 30 Days): <strong>{totalRecords.toLocaleString()}</strong>
                    </p>
                </div>
            </header>

            {/* Main Grid Layout - Now 2 columns on large screens */}
            <div className="charts-grid">

                {/* Chart 1: Genre Popularity (Volume) */}
                <div className="chart-card">
                    <h2 className="chart-title">Top 10 Genres (Volume)</h2>
                    <GenreBarChart data={topGenres}/>
                </div>

                {/* Chart 4: Platform Popularity (Volume) - NEW */}
                <div className="chart-card">
                    <h2 className="chart-title">Top 10 Platforms (Volume)</h2>
                    <PlatformBarChart data={topPlatforms}/>
                </div>

                {/* Chart 2: Quality vs. Popularity */}
                <div className="chart-card">
                    <h2 className="chart-title">Quality vs. Popularity</h2>
                    <QualityScatterChart data={qualityVsPopularity}/>
                </div>

                {/* Chart 3: Temporal Trend */}
                <div className="chart-card">
                    <h2 className="chart-title">Daily Genre Activity (Last 30 Days)</h2>
                    <TemporalLineChart
                        data={temporalTrends}
                        topGenres={temporalGenres}
                    />
                </div>
                {/* chart 4: Distribution Chart (Full width) */}
                <div className="chart-card double-width">
                    <h2 className="chart-title">Genre × Platform Distribution</h2>
                    <GenrePlatformDistributionChart data={genrePlatformMatrix}/>
                </div>

            </div>
        </div>
    );
}

export default GameDashboard;