from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import tensorflow as tf
import pandas as pd

app = Flask(__name__)
CORS(app)

# -----------------------------
# Load models
# -----------------------------
rf_model = joblib.load("ml_models/rf_model.pkl")
ann_model = tf.keras.models.load_model("ml_models/ann_model.h5", compile=False)
preprocessor = joblib.load("ml_models/preprocess.pkl")

# -----------------------------
# Prediction function
# -----------------------------
def predict(data):
    df = pd.DataFrame([data])
    X = preprocessor.transform(df)

    rf_pred = rf_model.predict(X)[0]
    ann_pred = ann_model.predict(X, verbose=0)[0][0]

    final_pred = (rf_pred + ann_pred) / 2
    safe_hours = max(1, int(final_pred * 0.8))
    return safe_hours

# -----------------------------
# Routes
# -----------------------------
@app.route("/predict", methods=["POST"])
def predict_route():
    data = request.json
    try:
        safe_hours = predict(data)
        # 🔹 Return just the number
        return jsonify(safe_hours)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------
# Run server
# -----------------------------
if __name__ == "__main__":
    app.run(port=4000)
