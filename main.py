# main.py
import requests
from google.cloud import storage
from datetime import datetime
from flask import jsonify
import logging
import traceback

# ----------------------------
# Config
# ----------------------------
API_KEY = "58b7fd26ecc4478b988134c6031c23eb"
BASE_URL = "https://api.rawg.io/api/games"
BUCKET_NAME = "rawg-api-storage-bonifacio"

# ----------------------------
# Helper function
# ----------------------------
def transform_games_to_df(all_games):
    """Convert RAWG API game data to pandas DataFrame"""
    import pandas as pd
    return pd.DataFrame([{
        "Name": g.get("name", "Unknown"),
        "Released": g.get("released", "Unknown"),
        "Rating": g.get("rating", None),
        "Genres": [genre.get("name", "Unknown") for genre in (g.get("genres") or []) if genre],
        "Platforms": [p.get("platform", {}).get("name", "Unknown") for p in (g.get("platforms") or []) if p],
        "Added_Count": g.get("added", 0)
    } for g in all_games])

# ----------------------------
# Cloud Function entry point
# ----------------------------
def fetch_and_upload(request):
    try:
        client = storage.Client()
        bucket = client.get_bucket(BUCKET_NAME)

        all_games = []

        for page in range(1, 26):
            params = {"key": API_KEY, "page_size": 40, "page": page, "ordering": "-added"}
            response = requests.get(BASE_URL, params=params)
            if response.status_code == 200:
                games = response.json().get("results", [])
                all_games.extend(games)
                logging.info(f"Page {page} fetched: {len(games)} games")
            else:
                logging.error(f"Error on page {page}: {response.status_code} {response.text}")

        df = transform_games_to_df(all_games)

        today = datetime.today().strftime('%Y-%m-%d')
        filename = f"rawg_{today}.csv"
        filepath = f"/tmp/{filename}"  # Cloud Functions allows /tmp storage
        df.to_csv(filepath, index=False)
        logging.info(f"File {filename} saved locally in /tmp")

        # Upload to GCS
        blob = bucket.blob(filename)
        blob.upload_from_filename(filepath)
        logging.info(f"File {filename} uploaded to {BUCKET_NAME}")

        return jsonify({"message": f"File {filename} uploaded successfully", "games_fetched": len(all_games)})

    except Exception as e:
        logging.error(traceback.format_exc())
        return jsonify({
            "error": str(e),
            "trace": traceback.format_exc()
        })
