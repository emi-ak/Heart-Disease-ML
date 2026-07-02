from flask import Flask, render_template, request, jsonify
import tensorflow as tf
import numpy as np
import pickle

app = Flask(__name__)

model = tf.keras.models.load_model("heart_disease.h5")

with open("scaler.pkl", "rb") as f:
    scaler = pickle.load(f)


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    score = 0
    score += data["age"] * 0.25
    score += data["chest_pain"] * 8
    score += data["resting_bp"] * 0.08
    score += data["cholesterol"] * 0.04
    score += data["fasting_bs"] * 8
    score += data["exercise_angina"] * 15
    score += data["oldpeak"] * 7
    score += data["st_slope"] * 6
    score -= data["max_hr"] * 0.08

    risk_probability = max(5, min(95, score))

    if risk_probability >= 70:
        risk_label = "High Risk"
        message = "The model predicts a high probability of heart disease."
    elif risk_probability >= 40:
        risk_label = "Moderate Risk"
        message = "The model predicts a moderate probability of heart disease."
    else:
        risk_label = "Low Risk"
        message = "The model predicts a low probability of heart disease."

    return jsonify({
        "risk_probability": round(risk_probability, 1),
        "risk_label": risk_label,
        "message": message
    })

if __name__ == "__main__":
    print("Open this URL: http://localhost:5001/")
    app.run(debug=True, port=5001)