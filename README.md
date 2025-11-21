# RAWG_API_Project

This project is a local web application designed to analyze video game trends using data from the RAWG Video Games Database API.

It uses a two-part architecture:

- Python Backend: Responsible for fetching data from the RAWG API (via a Cloud Function), storing it, and serving the final CSV files over a local HTTP server.
- React Frontend: A client-side dashboard that fetches the data from the local Python server and visualizes it using interactive charts.

## Project Goal

The goal of this project is to explore how different video game genres and platforms are trending. It analyzes details such as release date, rating, genres, and platform popularity (based on how often games are added to user libraries).

## Project Architecture

This application runs as two separate, communicating services on your local machine.

1. **Backend Data Server:**
    - A custom Python script (`backend/server.py`) serves static CSV files from the `backend/rawData/` directory.

2. **Frontend React App:**
    - A standard React application (`frontend/`) that runs a development server.
    - It fetches all historical CSV files from `http://localhost:8000`.
    - It uses Papa Parse to parse the CSV text into JSON.
    - It uses Recharts to render the final visualizations.

## How to Run the Application

You must run two separate terminal windows simultaneously.

### **Step 1: Data Workflow (Prerequisite)**

This application reads data, it does not fetch it from the API. You must ensure your data is present locally first.

1. **Run Cloud Function:** Ensure your Google Cloud Function (`main.py`) has been running and saving data to your GCS bucket.
2. **Download Data:** Run your local Python script (`utils/gcp_download.py`) to download all the CSV files from Google Cloud Storage into the `backend/rawData/` folder.

### **Step 2: Run the Backend (Data Server)**

1. Navigate to the Backend directory `cd backend`
2. Run the server script `py -m server.py`

*(Keep this terminal running.)*

### **Step 3: Run the Frontend (React Dashboard)**

1. In a new terminal navigate to the Frontend directory `cd frontend`
2. Start the React app `npm run dev`



