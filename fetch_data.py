import requests
import pandas as pd
import os
from google.cloud import storage
from datetime import datetime

# Google Cloud setup
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "elite-campus-472819-d1-78a4c13a30a7.json" # Replace with the JSON key

# Connect to your bucket
client = storage.Client()
bucket_name = "rawg-api-storage-bonifacio"  # replace with your bucket name
bucket = client.get_bucket(bucket_name)

API_KEY = "58b7fd26ecc4478b988134c6031c23eb"
BASE_URL = "https://api.rawg.io/api/games"

all_games = []

# Fetch 25 pages of 40 games
for page in range(1, 26):
    params = {
        "key": API_KEY,
        "page_size": 40,
        "page": page,
        "ordering": "-added",
    }

    response = requests.get(BASE_URL, params=params)

    if response.status_code == 200:
        data = response.json()
        games = data.get("results", [])
        all_games.extend(games)  # <-- this line is essential
        print(f"Page {page} fetched: {len(games)} games")
    else:
        print("Error on page", page, response.status_code, response.text)

# Convert to DataFrame
df = pd.DataFrame([{
    "Name": game.get("name", "Unknown"),
    "Released": game.get("released", "Unknown"),
    "Rating": game.get("rating", None),
    "Genres": [genre.get("name", "Unknown") for genre in game.get("genres") or [] if genre],
    "Platforms": [p.get("platform", {}).get("name", "Unknown") for p in (game.get("platforms") or []) if p],
    "Added_Count": game.get("added", 0)
} for game in all_games])

print(f"Total games collected: {len(df)}")
display(df.head())

# Save CSV
today = datetime.today().strftime('%Y-%m-%d')
filename = f"rawg_{today}.csv"
df.to_csv(filename, index=False)

# Upload to Google Cloud
blob = bucket.blob(filename)
blob.upload_from_filename(filename)
print(f"File {filename} uploaded to Google Cloud Storage successfully!")