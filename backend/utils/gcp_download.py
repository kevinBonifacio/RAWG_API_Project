# utils/gcp_download.py
# Shared logic for downloading CSVs from GCP
from google.cloud import storage
from google.oauth2 import service_account
import pandas as pd
import ast
import os
import re

PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))  # parent of utils/
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
os.makedirs(DATA_DIR, exist_ok=True)

def download_csvs(service_account_json, bucket_name):
    credentials = service_account.Credentials.from_service_account_file(service_account_json)
    client = storage.Client(credentials=credentials, project=credentials.project_id)
    bucket = client.get_bucket(bucket_name)

    blobs = bucket.list_blobs()
    csv_files = sorted([blob.name for blob in blobs if blob.name.endswith(".csv")])
    all_dfs = []

    for csv_file in csv_files:
        local_file = os.path.join(DATA_DIR, csv_file.replace("/", "_"))
        os.makedirs(os.path.dirname(local_file), exist_ok=True)
        blob = bucket.blob(csv_file)
        blob.download_to_filename(local_file)

        df = pd.read_csv(local_file)
        df['Genres'] = df['Genres'].apply(lambda x: ast.literal_eval(x) if pd.notnull(x) else [])
        df['Platforms'] = df['Platforms'].apply(lambda x: ast.literal_eval(x) if pd.notnull(x) else [])

        match = re.search(r"(\d{4}-\d{2}-\d{2})", csv_file)
        df['date'] = match.group(1) if match else "unknown"

        all_dfs.append(df)

    combined_df = pd.concat(all_dfs, ignore_index=True)
    return combined_df, all_dfs
