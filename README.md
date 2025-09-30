# RAWG_API_Project

This project fetches video game data from the **RAWG API**, processes it, and uploads the data as CSV files to a Google Cloud Storage bucket. It is built as a **Google Cloud Function** for automated and scalable execution.

## Features

- Fetches top video games data (by user-added count) from RAWG API.
- Extracts relevant information:
    - Game name
    - Release date
    - Rating
    - Genres
    - Platforms
    - Added count (popularity metric)
- Converts the data to a **pandas DataFrame** and saves it as a CSV.
- Uploads the CSV to a **Google Cloud Storage** bucket.
- Logs progress and errors for debugging.

## How It Works

1. **Fetch Data from RAWG API**  
   The function fetches 25 pages of top-added games from RAWG (40 games per page), using your API key.

2. **Transform Data**  
   The raw JSON data is transformed into a structured pandas DataFrame with selected fields.

3. **Save as CSV**  
   A CSV file is created with the current date in `/tmp` (temporary storage for Cloud Functions).

4. **Upload to Google Cloud Storage**  
   The CSV is uploaded to the configured bucket.

5. **Return Response**  
   The function returns a JSON response with the number of games fetched and the status of the upload.

## Setup

1. **Google Cloud Configuration**
    - Enable Cloud Functions and Cloud Storage.
    - Create a bucket for storing the CSV files.

2. **Environment Variables**
    - `API_KEY` – your RAWG API key.
    - `BUCKET_NAME` – your Cloud Storage bucket name.

3. **Dependencies**  
   Install required Python packages:
   ```bash
   py -m pip install requests google-cloud-storage pandas flask
