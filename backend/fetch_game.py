from flask import Flask, jsonify
import pandas as pd

app = Flask(__name__)

@app.route('/fetch_games')
def fetch_games_json():
    df = pd.read_csv('/tmp/latest_rawg.csv')  # or download from GCS
    return jsonify(df.to_dict(orient='records'))

if __name__ == "__main__":
    app.run(debug=True)
