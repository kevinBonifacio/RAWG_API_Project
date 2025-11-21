import { useState, useEffect } from 'react';
import { usePapaParse } from 'react-papaparse';

const LOCAL_SERVER_BASE_URL = 'http://localhost:8000/';

// --- Helper Functions (Ensuring 30 days ending yesterday) ---

// Helper to format Date object to YYYY-MM-DD string using local time components
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Get today's date object set to midnight local time
const getToday = () => {
    const today = new Date();
    // Setting time to 00:00:00 ensures we don't include today's partial data
    today.setHours(0, 0, 0, 0);
    return today;
};

// Calculate the start date (30 days before today's midnight)
const getThirtyDaysAgo = () => {
    const date = getToday();
    date.setDate(date.getDate() - 30); // Subtract 30 days
    return date;
};

// Generates an array of date strings (YYYY-MM-DD) for the last 30 days ending yesterday.
const getDateRange = (start) => {
    const dateArray = [];
    let currentDate = new Date(start);
    const today = getToday();

    // Loop as long as the current date is strictly less than today (i.e., includes yesterday)
    while (currentDate < today) {
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

    // Slicing to TOP 10 GENRES
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

    // Sort and take top 10
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

    // Convert to Recharts format
    return Object.keys(genreAggregates)
        .filter(name => genreAggregates[name].count >= 10) // Filter out genres with few entries for better averages
        .map(name => ({
            name: name,
            // Calculate average rating
            avgRating: parseFloat((genreAggregates[name].totalRating / genreAggregates[name].count).toFixed(2)),
            // Use total added count as a measure of popularity volume
            totalAdded: genreAggregates[name].totalAdded,
            // Include the game count for the Z-Axis (dot size)
            count: genreAggregates[name].count,
        }))
        // Ensure totalAdded is always positive for the logarithmic scale
        .filter(genre => genre.totalAdded > 0)
        .sort((a, b) => b.avgRating - a.avgRating) // Sort by rating
        .slice(0, 15); // Show top 15 genres for this view
};

// --- DATA PROCESSING FUNCTION: Temporal Trends (Using null for line breaks) ---
const processTemporalData = (data) => {
    if (!data || data.length === 0) return { temporalData: [], topGenres: [] };

    // 1. Get the Top 5 genres from the entire dataset for plotting
    const topGenres = processGenreData(data).slice(0, 5).map(g => g.name);

    // 2. Calculate Daily Activity Map (only includes dates where data was actually collected)
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
            // Only count games belonging to the TOP 5
            if (topGenres.includes(genre)) {
                dateGenreMap[dateKey][genre] = (dateGenreMap[dateKey][genre] || 0) + 1;
            }
        });
    });

    // 3. Get the full range of date keys (YYYY-MM-DD) for the last 30 days
    const START_DATE = getThirtyDaysAgo();
    const dateRange = getDateRange(START_DATE);

    // 4. Map the full date range, explicitly setting missing days to null
    const finalTemporalData = dateRange.map(dateKey => {
        const existingData = dateGenreMap[dateKey];

        if (existingData) {
            // Case A: Data was found for this date.
            // Fill missing genres with 0 counts.
            topGenres.forEach(genre => {
                existingData[genre] = existingData[genre] || 0;
            });
            return existingData;
        } else {
            // Case B: Data was NOT found for this date (404, empty CSV, or zero activity).
            // Use null values for the genre counts to force a line break in Recharts.
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

    // 1. Get top 10 genres and platforms using the already-defined functions
    const topGenres = processGenreData(data).map(g => g.name);
    const topPlatforms = processPlatformData(data).map(p => p.name);

    const matrix = {}; // genre -> platform -> count

    data.forEach(game => {
        const genres = getCleanedArray(game.Genres);
        const platforms = getCleanedArray(game.Platforms);

        genres.forEach(genre => {
            if (!topGenres.includes(genre)) return; // Skip if not top 10
            if (!matrix[genre]) matrix[genre] = {};

            platforms.forEach(platform => {
                if (!topPlatforms.includes(platform)) return; // Skip if not top 10
                if (!matrix[genre][platform]) matrix[genre][platform] = 0;
                matrix[genre][platform] += 1;
            });
        });
    });

    // 2. Convert matrix into array format for Recharts
    const result = Object.keys(matrix).map(genre => ({
        genre,
        ...matrix[genre],
    }));

    // 3. Sort genres by total count so chart looks clean
    return result.sort((a, b) => {
        const sumA = Object.values(a).reduce((acc, val) => (typeof val === "number" ? acc + val : acc), 0);
        const sumB = Object.values(b).reduce((acc, val) => (typeof val === "number" ? acc + val : acc), 0);
        return sumB - sumA;
    });
};


// --- Custom Hook ---
export const useGameData = () => {
    const [allGameData, setAllGameData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { readString } = usePapaParse();

    // --- DYNAMIC DATE RANGE CALCULATION (Last 30 Days of Collection) ---
    const START_DATE = getThirtyDaysAgo();
    // Get the full list of YYYY-MM-DD dates we expect to see
    const expectedDates = getDateRange(START_DATE);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            const combinedData = [];

            for (const dateKey of expectedDates) {
                const filename = `rawg_${dateKey}.csv`;
                const fileURL = LOCAL_SERVER_BASE_URL + filename;
                const collectionDate = dateKey; // YYYY-MM-DD

                try {
                    // Implement exponential backoff for fetching the CSV
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
                            console.warn(`Fetch attempt ${retryCount + 1} failed for ${filename}. Retrying...`);
                        }
                        // Only retry if it's not a 404/403 (file not found)
                        if (!response || response.status >= 500) {
                            const delay = Math.pow(2, retryCount) * 1000;
                            await new Promise(resolve => setTimeout(resolve, delay));
                            retryCount++;
                        } else {
                            // If it's a client error (e.g., 404), stop retrying and warn/skip
                            break;
                        }
                    }

                    if (!response || !response.ok) {
                        console.warn(`File not found, failed to load, or empty: ${filename}. Skipping this date.`);
                        continue;
                    }

                    const csvText = await response.text();

                    // If the CSV is empty (just headers or less), skip it.
                    if (csvText.split('\n').length <= 1) {
                        console.warn(`CSV file ${filename} is effectively empty (only headers). Skipping this date.`);
                        continue;
                    }

                    readString(csvText, {
                        header: true,
                        dynamicTyping: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            // ATTACH COLLECTION DATE to each record
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

            // We only set an error if NO data was found across the entire 30 days
            if (combinedData.length === 0) {
                setError("No data found in the last 30 days. Please check if the Python server is running and data exists.");
            }
        };

        // Note: I removed [readString] from dependencies because it's stable,
        // but included the dependency check to trigger on first render.
        fetchAllData();
    }, [readString]);

    const temporalData = processTemporalData(allGameData);

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