# frontend/app.py
from flask import Flask, render_template_string
from google.cloud import storage
import pandas as pd
import os
import io
from config import BUCKET_NAME, GCP_CREDENTIALS_PATH
from datetime import datetime

# Set Google Cloud credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GCP_CREDENTIALS_PATH

app = Flask(__name__)

# Simple HTML template for displaying the CSV as a table
HTML_TEMPLATE = """
<!doctype html>
<html lang="en">
  <head>
    <title>RAWG Games Data</title>
    <style>
      table {border-collapse: collapse; width: 100%;}
      th, td {border: 1px solid #ccc; padding: 8px; text-align: left;}
      th {background-color: #f4f4f4;}
    </style>
  </head>
  <body>
    <h1>RAWG Games Data (Latest)</h1>
    {% if table %}
        {{ table|safe }}
    {% else %}
        <p>No data available.</p>
    {% endif %}
  </body>
</html>
"""

def get_latest_csv():
    """Fetch the latest CSV file from GCS and return as DataFrame"""
    client = storage.Client()
    bucket = client.get_bucket(BUCKET_NAME)
    blobs = list(bucket.list_blobs())

    # Filter only CSV files
    csv_blobs = [b for b in blobs if b.name.endswith('.csv')]
    if not csv_blobs:
        return None

    # Find the most recently uploaded CSV
    latest_blob = max(csv_blobs, key=lambda b: b.updated)

    # Download contents to pandas
    content = latest_blob.download_as_text()
    df = pd.read_csv(io.StringIO(content))
    return df

@app.route("/")
def index():
    try:
        df = get_latest_csv()
        if df is not None:
            table_html = df.to_html(classes='table table-striped', index=False)
        else:
            table_html = None
        return render_template_string(HTML_TEMPLATE, table=table_html)
    except Exception as e:
        return f"Error fetching data: {str(e)}"

if __name__ == "__main__":
    app.run(debug=True)
