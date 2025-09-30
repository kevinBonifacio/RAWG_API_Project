import os
import matplotlib.pyplot as plt
from collections import Counter
from utils.gcp_download import download_csvs

SERVICE_ACCOUNT_JSON = r"C:\Users\kevin\OneDrive\Documentos\classes\2025 Fall - DIY API\elite-campus-472819-d1-78a4c13a30a7.json"
BUCKET_NAME = "rawg-api-storage-bonifacio"

PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

combined_df, _ = download_csvs(SERVICE_ACCOUNT_JSON, BUCKET_NAME)

all_platforms = [plat for sublist in combined_df['Platforms'] for plat in sublist]
platform_counts = Counter(all_platforms)

plt.figure(figsize=(12,6))
plt.bar(platform_counts.keys(), platform_counts.values(), color='lightgreen')
plt.xticks(rotation=45, ha='right')
plt.title("Number of Games per Platform")
plt.ylabel("Count")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "games_per_platform.png"))
plt.close()
print(f"Saved plot: {os.path.join(OUTPUT_DIR, 'games_per_platform.png')}")
