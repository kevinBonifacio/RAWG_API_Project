import os
import matplotlib.pyplot as plt
import pandas as pd
from utils.gcp_download import download_csvs

SERVICE_ACCOUNT_JSON = r"C:\Users\kevin\OneDrive\Documentos\classes\2025 Fall - DIY API\elite-campus-472819-d1-78a4c13a30a7.json"
BUCKET_NAME = "rawg-api-storage-bonifacio"

PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

combined_df, all_dfs = download_csvs(SERVICE_ACCOUNT_JSON, BUCKET_NAME)
all_dfs = sorted(all_dfs, key=lambda df: df["date"].iloc[0])

genre_diffs = []

for i in range(1, len(all_dfs)):
    today = all_dfs[i]
    yesterday = all_dfs[i-1]

    merged = pd.merge(
        today[["Name", "Added_Count", "Genres"]],
        yesterday[["Name", "Added_Count", "Genres"]],
        on="Name",
        suffixes=("_today", "_yesterday"),
        how="inner"
    )

    merged["Added_Diff"] = merged["Added_Count_today"] - merged["Added_Count_yesterday"]
    merged = merged[["Name", "Genres_today", "Added_Diff"]]
    exploded = merged.explode("Genres_today")
    genre_day = exploded.groupby("Genres_today")["Added_Diff"].sum().reset_index()
    genre_day["date"] = today["date"].iloc[0]
    genre_diffs.append(genre_day)

genre_trends = pd.concat(genre_diffs)
pivot_df = genre_trends.pivot(index="date", columns="Genres_today", values="Added_Diff").fillna(0)
top_genres = pivot_df.sum().sort_values(ascending=False).head(10).index

plt.figure(figsize=(12,6))
pivot_df[top_genres].plot(kind="line", marker="o")
plt.title("Top 10 Genre Popularity Over Time (Daily Added Count Increase)")
plt.xlabel("Date")
plt.ylabel("Daily Increase in Added Count")
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "top10_genre_trends.png"))
plt.close()
print(f"Saved plot: {os.path.join(OUTPUT_DIR, 'top10_genre_trends.png')}")
