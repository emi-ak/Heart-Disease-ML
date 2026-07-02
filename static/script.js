let step = 0;

const answers = {};

const questions = [
  {
    key: "welcome",
    html: `<h2>Start Assessment</h2>
           <p>This tool estimates heart disease risk.</p>
           <p class="note">Educational use only. Not a medical diagnosis.</p>`
  },
  {
    key: "age",
    html: `<h2>How old are you?</h2>
           <input type="number" id="age" min="1" max="120" value="30">`
  },
  {
    key: "sex",
    html: `<h2>What is your sex?</h2>
           <select id="sex">
             <option value="1">Male</option>
             <option value="0">Female</option>
           </select>`
  },
  {
    key: "chest_pain",
    html: `<h2>Chest pain type</h2>
           <select id="chest_pain">
             <option value="0">Asymptomatic</option>
             <option value="1">Non-anginal Pain</option>
             <option value="2">Atypical Angina</option>
             <option value="3">Typical Angina</option>
           </select>`
  },
  {
    key: "resting_bp",
    html: `<h2>Resting blood pressure</h2>
           <input type="number" id="resting_bp" min="70" max="250" value="120">`
  },
  {
    key: "cholesterol",
    html: `<h2>Cholesterol</h2>
           <input type="number" id="cholesterol" min="0" max="700" value="200">`
  },
  {
    key: "fasting_bs",
    html: `<h2>Fasting blood sugar above 120 mg/dL?</h2>
           <select id="fasting_bs">
             <option value="0">No</option>
             <option value="1">Yes</option>
           </select>`
  },
  {
    key: "resting_ecg",
    html: `<h2>Resting ECG result</h2>
           <select id="resting_ecg">
             <option value="0">Normal</option>
             <option value="1">LVH</option>
             <option value="2">ST abnormality</option>
           </select>`
  },
  {
    key: "max_hr",
    html: `<h2>Maximum heart rate achieved</h2>
           <input type="number" id="max_hr" min="60" max="250" value="150">`
  },
  {
    key: "exercise_angina",
    html: `<h2>Exercise-induced angina?</h2>
           <select id="exercise_angina">
             <option value="0">No</option>
             <option value="1">Yes</option>
           </select>`
  },
  {
    key: "oldpeak",
    html: `<h2>Oldpeak</h2>
           <input type="number" id="oldpeak" min="0" max="10" step="0.1" value="1.0">`
  },
  {
    key: "st_slope",
    html: `<h2>ST slope</h2>
           <select id="st_slope">
             <option value="1">Flat</option>
             <option value="2">Up</option>
             <option value="0">Down</option>
           </select>`
  },
  {
    key: "result",
    html: `<h2>Assessment Complete</h2>
           <p>Click finish to generate your prediction.</p>
           <div id="result-box"></div>`
  }
];

function saveAnswer() {
  const q = questions[step];
  if (q.key === "welcome" || q.key === "result") return;

  const el = document.getElementById(q.key);
  if (el) answers[q.key] = Number(el.value);
}

function renderQuestion() {
  document.getElementById("question-box").innerHTML = questions[step].html;

  const key = questions[step].key;
  if (answers[key] !== undefined) {
    const el = document.getElementById(key);
    if (el) el.value = answers[key];
  }

  document.getElementById("back-btn").style.display =
    step === 0 ? "none" : "inline-block";

  document.getElementById("next-btn").innerText =
    step === questions.length - 1 ? "Finish" : "Next →";

  document.getElementById("progress-bar").style.width =
    `${(step / (questions.length - 1)) * 100}%`;
}

async function predict() {
  const resultBox = document.getElementById("result-box");
  resultBox.innerHTML = "<p>Generating prediction...</p>";

  const response = await fetch("/predict", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(answers)
  });

  const data = await response.json();
    let emoji = "🟢";
      if (data.risk_label === "Moderate Risk") emoji = "🟡";
      if (data.risk_label === "High Risk") emoji = "🔴";

      resultBox.innerHTML = `
      <div class="result-card ${data.risk_label.toLowerCase().replace(" ", "-")}">
          <div class="risk-emoji">${emoji}</div>
          <h3>${data.risk_label}</h3>
          <p class="risk-score">${data.risk_probability}%</p>
          <p>${data.message}</p>
          <div class="recommendations">
            <h4>Suggested next steps</h4>
            <ul>
              <li>Review this result with a healthcare professional.</li>
              <li>Monitor blood pressure, cholesterol, and heart rate regularly.</li>
              <li>Use this tool for educational screening only, not diagnosis.</li>
            </ul>
          </div>
          <p class="disclaimer">This result is for educational purposes only and is not a medical diagnosis.</p>
          <button class="restart-btn" onclick="restartAssessment()">Start New Assessment</button>
      </div>
    `;
}

document.getElementById("next-btn").addEventListener("click", () => {
  saveAnswer();

  if (step < questions.length - 1) {
    step++;
    renderQuestion();
  } else {
    predict();
  }
});

document.getElementById("back-btn").addEventListener("click", () => {
  saveAnswer();

  if (step > 0) {
    step--;
    renderQuestion();
  }
});

function restartAssessment() {
  step = 0;

  for (const key in answers) {
    delete answers[key];
  }

  renderQuestion();
}

renderQuestion();