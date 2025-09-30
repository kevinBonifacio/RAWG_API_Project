import os
from collections import Counter
import matplotlib.pyplot as plt
from utils.gcp_download import download_csvs

SERVICE_ACCOUNT_JSON = r"C:\Users\kevin\OneDrive\Documentos\classes\2025 Fall - DIY API\elite-campus-472819-d1-78a4c13a30a7.json"
BUCKET_NAME = "rawg-api-storage-bonifacio"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

combined_df, _ = download_csvs(SERVICE_ACCOUNT_JSON, BUCKET_NAME)

all_genres = [genre for sublist in combined_df['Genres'] for genre in sublist]
genre_counts = Counter(all_genres)

plt.figure(figsize=(12,6))
plt.bar(genre_counts.keys(), genre_counts.values(), color='skyblue')
plt.xticks(rotation=45, ha='right')
plt.title("Number of Games per Genre")
plt.ylabel("Count")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "games_per_genre.png"))
plt.close()
print(f"Saved plot: {os.path.join(OUTPUT_DIR, 'games_per_genre.png')}")
