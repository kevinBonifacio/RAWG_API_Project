import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

function GenrePlatformDistributionChart({ data }) {
    if (!data || data.length === 0) {
        return <div style={{ textAlign: "center", padding: 40 }}>No genre-platform data available.</div>;
    }

    // Dynamically detect platform keys
    const platformKeys = Object.keys(data[0]).filter(key => key !== "genre");

    // Color palette
    const COLORS = [
        "#8884d8", "#82ca9d", "#ffc658", "#ff7373",
        "#0088FE", "#4B0082", "#00CED1", "#FF8042"
    ];

    return (
        <div style={{ height: 500, width: "100%", marginTop: 40 }}>
            <h3 style={{ textAlign: "center", marginBottom: 20 }}>
                Genre × Platform Distribution
            </h3>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="genre" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend
                        verticalAlign="top"
                        align="center"
                        wrapperStyle={{
                            paddingTop: "10px",
                            paddingBottom: "10px",
                            marginLeft: "0",
                            marginRight: "0",
                            maxWidth: "95%",      // prevent overflow
                            overflow: "hidden",   // hide excess
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                        }}
                    />


                    {platformKeys.map((platform, idx) => (
                        <Bar
                            key={platform}
                            dataKey={platform}
                            fill={COLORS[idx % COLORS.length]}
                            stackId={undefined} // grouped bars
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default GenrePlatformDistributionChart;
