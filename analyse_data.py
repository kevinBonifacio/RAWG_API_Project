from google.cloud import storage
import pandas as pd
import os
import ast

client = storage.Client()
bucket_name = "rawg-api-storage-bonifacio"
bucket = client.get_bucket(bucket_name)

# List CSVs sorted by date
blobs = bucket.list_blobs()
csv_files = sorted([blob.name for blob in blobs if blob.name.endswith(".csv")])

all_dfs = []

for csv_file in csv_files:
    local_file = csv_file.replace("/", "_")
    blob = bucket.blob(csv_file)
    blob.download_to_filename(local_file)

    df = pd.read_csv(local_file)
    df['Genres'] = df['Genres'].apply(lambda x: ast.literal_eval(x) if pd.notnull(x) else [])
    df['Platforms'] = df['Platforms'].apply(lambda x: ast.literal_eval(x) if pd.notnull(x) else [])

    # extract date from filename
    import re
    match = re.search(r"(\d{4}-\d{2}-\d{2})", csv_file)
    df['date'] = match.group(1) if match else "unknown"

    all_dfs.append(df)
    os.remove(local_file)
