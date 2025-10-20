import React, { useEffect, useState } from 'react';
import { fetchGames } from './services/api';
import GamesChart from './components/GamesChart';
import Loading from './components/Loading';

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

    return (
        <div className="App">
            <h1>RAWG Games Dashboard</h1>
            {loading ? <Loading /> : <GamesChart data={games} />}
        </div>
    );
}

export default App;
