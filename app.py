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

    features = np.array([[
        data["age"],
        data["sex"],
        data["chest_pain"],
        data["resting_bp"],
        data["cholesterol"],
        data["fasting_bs"],
        data["resting_ecg"],
        data["max_hr"],
        data["exercise_angina"],
        data["oldpeak"],
        data["st_slope"]
    ]], dtype=float)

    cols_to_scale = [0, 2, 3, 4, 5, 6, 7, 9, 10]
    features[:, cols_to_scale] = scaler.transform(features[:, cols_to_scale])

    prediction = model.predict(features)[0]
    risk_probability = float(prediction[1]) * 100

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