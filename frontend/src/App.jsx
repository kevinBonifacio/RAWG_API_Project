import React, { useEffect, useState } from 'react';
import { fetchGames } from './services/api';
import Loading from './components/Loading';

import GenreChart from './components/GenreChart';
import PlatformChart from './components/PlatformChart';
import RatingsChart from './components/RatingsChart';
import ReleaseYearChart from './components/ReleaseYearChart';

import "./App.css";

function App() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchGames();
            setGames(data);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading) return <Loading />;

    return (
        <div className="dashboard">
            <h1>RAWG Games Dashboard</h1>

            <div className="grid-container">
                <div className="card">
                    <h2>Genres Distribution</h2>
                    <GenreChart data={games} />
                </div>

                <div className="card">
                    <h2>Platform Popularity</h2>
                    <PlatformChart data={games} />
                </div>

                <div className="card">
                    <h2>Ratings Distribution</h2>
                    <RatingsChart data={games} />
                </div>

                <div className="card">
                    <h2>Release Year Histogram</h2>
                    <ReleaseYearChart data={games} />
                </div>
            </div>
        </div>
    );
}

export default App;
