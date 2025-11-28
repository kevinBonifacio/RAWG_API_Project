import { useState, useEffect } from 'react';
import { usePapaParse } from 'react-papaparse';

const LOCAL_SERVER_BASE_URL = 'http://localhost:8000/';

// --- Helper Functions ---

// Helper to format Date object to YYYY-MM-DD string
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Calculates the last 30-day range strings ending today (exclusive).
 * @returns {string[]} Array of 30 date strings (YYYY-MM-DD).
 */
const getFixed30DayRange = () => {
    const dateArray = [];

    // The end date is today at midnight (exclusive end date for the loop)
    const end = new Date(new Date().setHours(0, 0, 0, 0));

    // The start date is 30 days ago (inclusive)
    const start = new Date(end);
    start.setDate(end.getDate() - 30);

    let currentDate = new Date(start);

    // Loop from 30 days ago up to (but not including) today
    while (currentDate < end) {
        dateArray.push(formatDate(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
};

// Helper to clean and validate array data from CSV fields
const getCleanedArray = (value) => {
    const rawArray = Array.isArray(value) ? value : (value || '').split(',');
    // Map to trim, then filter to remove empty strings
    return rawArray.map(item => String(item).trim()).filter(item => item.length > 0);
};


// --- DATA PROCESSING FUNCTION: Genre Count (Top 10) ---
const processGenreData = (data) => {
    if (!data || data.length === 0) return [];

    const genreCounts = {};

    data.forEach(game => {
        const genres = getCleanedArray(game.Genres);

        genres.forEach(genre => {
            if (genre !== 'Unknown') {
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            }
        });
    });

    return Object.keys(genreCounts).map(name => ({
        name: name,
        value: genreCounts[name],
    })).sort((a, b) => b.value - a.value).slice(0, 10);
};

// --- DATA PROCESSING FUNCTION: Platform Count (Top 10) ---
const processPlatformData = (data) => {
    if (!data || data.length === 0) return [];

    const platformCounts = {};

    data.forEach(game => {
        const platforms = getCleanedArray(game.Platforms);

        platforms.forEach(platform => {
            if (platform !== 'Unknown') {
                platformCounts[platform] = (platformCounts[platform] || 0) + 1;
            }
        });
    });

    return Object.keys(platformCounts).map(name => ({
        name: name,
        value: platformCounts[name],
    })).sort((a, b) => b.value - a.value).slice(0, 10);
};


// --- DATA PROCESSING FUNCTION: Quality vs. Popularity ---
const processQualityData = (data) => {
    if (!data || data.length === 0) return [];

    const genreAggregates = {};

    data.forEach(game => {
        const rating = Number(game.Rating) || 0;
        const added = Number(game.Added_Count) || 0;

        const genres = getCleanedArray(game.Genres);

        genres.forEach(genre => {
            if (genre !== 'Unknown') {
                if (!genreAggregates[genre]) {
                    genreAggregates[genre] = {
                        totalRating: 0,
                        totalAdded: 0,
                        count: 0
                    };
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
            count: genreAggregates[name].count,
        }))
        .filter(genre => genre.totalAdded > 0)
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 15);
};

// --- DATA PROCESSING FUNCTION: Temporal Trends ---
const processTemporalData = (data, dateRange) => {
    if (!data || data.length === 0) return { temporalData: [], topGenres: [] };

    const topGenres = processGenreData(data).slice(0, 5).map(g => g.name);
    const dateGenreMap = {};

    data.forEach(game => {
        const collectionDateStr = game.Collection_Date;
        if (!collectionDateStr || collectionDateStr === 'Unknown') return;

        const dateKey = collectionDateStr;
        const genres = getCleanedArray(game.Genres);

        if (!dateGenreMap[dateKey]) {
            dateGenreMap[dateKey] = { date: dateKey };
        }

        genres.forEach(genre => {
            if (topGenres.includes(genre)) {
                dateGenreMap[dateKey][genre] = (dateGenreMap[dateKey][genre] || 0) + 1;
            }
        });
    });

    const finalTemporalData = dateRange.map(dateKey => {
        const existingData = dateGenreMap[dateKey];

        if (existingData) {
            topGenres.forEach(genre => {
                existingData[genre] = existingData[genre] || 0;
            });
            return existingData;
        } else {
            const nullData = { date: dateKey };
            topGenres.forEach(genre => {
                nullData[genre] = null; // Forces line break (gap)
            });
            return nullData;
        }
    });

    return {
        temporalData: finalTemporalData,
        topGenres
    };
};

// --- DATA PROCESSING FUNCTION: Genre vs Platform Cross-Distribution ---
const processGenrePlatformData = (data) => {
    if (!data || data.length === 0) return [];

    const topGenres = processGenreData(data).map(g => g.name);
    const topPlatforms = processPlatformData(data).map(p => p.name);

    const matrix = {}; // genre -> platform -> count

    data.forEach(game => {
        const genres = getCleanedArray(game.Genres);
        const platforms = getCleanedArray(game.Platforms);

        genres.forEach(genre => {
            if (!topGenres.includes(genre)) return;
            if (!matrix[genre]) matrix[genre] = {};

            platforms.forEach(platform => {
                if (!topPlatforms.includes(platform)) return;
                if (!matrix[genre][platform]) matrix[genre][platform] = 0;
                matrix[genre][platform] += 1;
            });
        });
    });

    const result = Object.keys(matrix).map(genre => ({
        genre,
        ...matrix[genre],
    }));

    return result.sort((a, b) => {
        const sumA = Object.values(a).reduce((acc, val) => (typeof val === "number" ? acc + val : acc), 0);
        const sumB = Object.values(b).reduce((acc, val) => (typeof val === "number" ? acc + val : acc), 0);
        return sumB - sumA;
    });
};


// --- Custom Hook (Fixed Range) ---
/**
 * Custom hook for fetching and processing game data for the last 30 days
 * ending yesterday.
 */
export const useGameData = () => {
    const [allGameData, setAllGameData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { readString } = usePapaParse();

    // Calculate the fixed 30-day range internally
    const expectedDates = getFixed30DayRange();
    // The date *after* the last file fetched (used for display purposes only)
    const endDateDisplay = formatDate(new Date(new Date().setHours(0, 0, 0, 0)));

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);
            const combinedData = [];

            for (const dateKey of expectedDates) {
                const filename = `rawg_${dateKey}.csv`;
                const fileURL = LOCAL_SERVER_BASE_URL + filename;
                const collectionDate = dateKey; // YYYY-MM-DD

                try {
                    // Exponential backoff logic for fetching the CSV
                    let response = null;
                    let success = false;
                    let retryCount = 0;
                    const maxRetries = 5;

                    while (!success && retryCount < maxRetries) {
                        try {
                            response = await fetch(fileURL);
                            if (response.ok) {
                                success = true;
                                break;
                            }
                        } catch (e) {
                            // Silent retry
                        }
                        if (!response || response.status >= 500) {
                            const delay = Math.pow(2, retryCount) * 1000;
                            await new Promise(resolve => setTimeout(resolve, delay));
                            retryCount++;
                        } else {
                            break;
                        }
                    }

                    if (!response || !response.ok) {
                        console.warn(`File not found or failed: ${filename}. Skipping this date.`);
                        continue;
                    }

                    const csvText = await response.text();

                    if (csvText.split('\n').length <= 1) {
                        console.warn(`CSV file ${filename} is empty. Skipping this date.`);
                        continue;
                    }

                    readString(csvText, {
                        header: true,
                        dynamicTyping: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            const dailyData = results.data
                                .filter(item => Object.keys(item).length > 0)
                                .map(item => ({
                                    ...item,
                                    Collection_Date: collectionDate
                                }));
                            combinedData.push(...dailyData);
                        },
                        error: (err) => {
                            console.error(`Parsing error for ${filename}:`, err);
                        }
                    });

                } catch (e) {
                    console.error(`Critical error during processing for ${filename}:`, e);
                }
            }

            setAllGameData(combinedData);
            setLoading(false);

            if (combinedData.length === 0) {
                const startDateDisplay = expectedDates[0] || 'N/A';
                setError(`No data found for the 30-day window from ${startDateDisplay} to ${endDateDisplay}.`);
            }
        };

        fetchAllData();
    }, [readString]);

    const temporalData = processTemporalData(allGameData, expectedDates);

    return {
        topGenres: processGenreData(allGameData),
        topPlatforms: processPlatformData(allGameData),
        qualityVsPopularity: processQualityData(allGameData),
        temporalTrends: temporalData.temporalData,
        temporalGenres: temporalData.topGenres,
        genrePlatformMatrix: processGenrePlatformData(allGameData),
        loading,
        error,
        totalRecords: allGameData.length,
    };
};