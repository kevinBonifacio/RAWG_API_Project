from google.cloud import storage

BUCKET_NAME = "rawg-api-storage-bonifacio"
DESTINATION_FOLDER = "C:/Users/kevin/IdeaProjects/RAWG_API_Project/rawData"

def download_csv_files():
    client = storage.Client()
    bucket = client.get_bucket(BUCKET_NAME)

    blobs = bucket.list_blobs()  # List all files in the bucket

    for blob in blobs:
        if blob.name.endswith(".csv"):
            local_path = f"{DESTINATION_FOLDER}/{blob.name}"
            blob.download_to_filename(local_path)
            print(f"Downloaded {blob.name} → {local_path}")

download_csv_files()
