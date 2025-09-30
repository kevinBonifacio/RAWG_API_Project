import os
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from utils.gcp_download import download_csvs

SERVICE_ACCOUNT_JSON = r"C:\Users\kevin\OneDrive\Documentos\classes\2025 Fall - DIY API\elite-campus-472819-d1-78a4c13a30a7.json"
BUCKET_NAME = "rawg-api-storage-bonifacio"

PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

combined_df, _ = download_csvs(SERVICE_ACCOUNT_JSON, BUCKET_NAME)

df_exploded = combined_df.explode('Platforms').explode('Genres')
cross_tab = pd.crosstab(df_exploded['Platforms'], df_exploded['Genres'])

plt.figure(figsize=(12,8))
sns.heatmap(
    cross_tab,
    cmap="YlGnBu",
    linewidths=.5,
    annot=True,      # <-- show numbers in cells
    fmt="d"          # <-- format as integer
)
plt.title("Games by Platform vs Genre")
plt.ylabel("Platform")
plt.xlabel("Genre")
plt.tight_layout()
plt.savefig(os.path.join(OUTPUT_DIR, "platform_vs_genre_heatmap.png"))
plt.close()
print(f"Saved plot: {os.path.join(OUTPUT_DIR, 'platform_vs_genre_heatmap.png')}")

