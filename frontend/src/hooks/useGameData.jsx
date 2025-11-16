import { useState, useEffect } from 'react';
import { usePapaParse } from 'react-papaparse';

const LOCAL_SERVER_BASE_URL = 'http://localhost:8000/';

// Set your desired start date for data collection
// IMPORTANT: Adjust this date to match the start date of your earliest CSV file.
const START_DATE = new Date('2025-10-01');

// --- Helper Functions ---

const getYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return yesterday;
};

const getDateRange = (start, end) => {
    const dateArray = [];
    let currentDate = new Date(start);
    while (currentDate <= end) {
        dateArray.push(`rawg_${currentDate.toISOString().slice(0, 10)}.csv`);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
};

// --- DATA PROCESSING FUNCTION 1: Genre Count (Popularity) ---
const processGenreData = (data) => {
    if (!data || data.length === 0) return [];
    const genreCounts = {};

    data.forEach(game => {
        const genres = Array.isArray(game.Genres) ? game.Genres : (game.Genres || '').split(',').map(g => g.trim());
        genres.forEach(genre => {
            if (genre && genre !== 'Unknown') {
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            }
        });
    });

    return Object.keys(genreCounts).map(name => ({
        name: name,
        value: genreCounts[name],
    })).sort((a, b) => b.value - a.value).slice(0, 10);
};

// --- DATA PROCESSING FUNCTION 2: Quality vs. Popularity ---
const processQualityData = (data) => {
    if (!data || data.length === 0) return [];
    const genreAggregates = {};

    data.forEach(game => {
        const rating = game.Rating || 0;
        const added = game.Added || 0;
        const genres = Array.isArray(game.Genres) ? game.Genres : (game.Genres || '').split(',').map(g => g.trim());

        genres.forEach(genre => {
            if (genre && genre !== 'Unknown') {
                if (!genreAggregates[genre]) {
                    genreAggregates[genre] = { totalRating: 0, totalAdded: 0, count: 0 };
                }
                genreAggregates[genre].totalRating += rating;
                genreAggregates[genre].totalAdded += added;
                genreAggregates[genre].count += 1;
            }
        });
    });

    return Object.keys(genreAggregates)
        .filter(name => genreAggregates[name].count >= 10)
        .map(name => ({
            name: name,
            avgRating: parseFloat((genreAggregates[name].totalRating / genreAggregates[name].count).toFixed(2)),
            totalAdded: genreAggregates[name].totalAdded,
        }))
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 15);
};

// --- DATA PROCESSING FUNCTION 3: Temporal Trends ---
const processTemporalData = (data) => {
    if (!data || data.length === 0) return { temporalData: [], topGenres: [] };

    const dateGenreMap = {};

    data.forEach(game => {
        const releasedDate = game.Released;
        if (!releasedDate) return;

        // Group by Year-Month (e.g., "2024-05")
        const monthYear = releasedDate.substring(0, 7);

        const genres = Array.isArray(game.Genres) ? game.Genres : (game.Genres || '').split(',').map(g => g.trim());

        if (!dateGenreMap[monthYear]) {
            dateGenreMap[monthYear] = { date: monthYear };
        }

        genres.forEach(genre => {
            if (genre && genre !== 'Unknown') {
                dateGenreMap[monthYear][genre] = (dateGenreMap[monthYear][genre] || 0) + 1;
            }
        });
    });

    const temporalData = Object.values(dateGenreMap).sort((a, b) =>
        new Date(a.date) - new Date(b.date)
    );

    // Get the top 5 genres for the legend keys
    const topGenres = processGenreData(data).slice(0, 5).map(g => g.name);

    return {
        temporalData,
        topGenres
    };
};


// --- Custom Hook ---
export const useGameData = () => {
    const [allGameData, setAllGameData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { readString } = usePapaParse();

    const END_DATE = getYesterday();

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            const allFiles = getDateRange(START_DATE, END_DATE);
            const combinedData = [];

            for (const filename of allFiles) {
                const fileURL = LOCAL_SERVER_BASE_URL + filename;

                try {
                    const response = await fetch(fileURL);
                    if (!response.ok) {
                        console.warn(`File not found or failed to load: ${filename}. Skipping.`);
                        continue;
                    }
                    const csvText = await response.text();

                    readString(csvText, {
                        header: true,
                        dynamicTyping: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            combinedData.push(...results.data.filter(item => Object.keys(item).length > 0));
                        },
                        error: (err) => {
                            console.error(`Parsing error for ${filename}:`, err);
                        }
                    });

                } catch (e) {
                    console.error(`Fetch error for ${filename}:`, e);
                }
            }

            setAllGameData(combinedData);
            setLoading(false);

            if (combinedData.length === 0) {
                setError("No data found in the specified date range. Check file names and Python server.");
            }
        };

        fetchAllData();
    }, [readString]);

    const temporalData = processTemporalData(allGameData);

    return {
        topGenres: processGenreData(allGameData),
        qualityVsPopularity: processQualityData(allGameData),
        temporalTrends: temporalData.temporalData,
        temporalGenres: temporalData.topGenres,
        loading,
        error,
        totalRecords: allGameData.length,
    };
};