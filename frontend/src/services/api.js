import axios from 'axios';

const BASE_URL = 'http://localhost:5000'; // your Flask backend URL

export const fetchGames = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/fetch_games`);
        return res.data; // should be JSON data from Flask
    } catch (error) {
        console.error('Error fetching games:', error);
        return [];
    }
};
