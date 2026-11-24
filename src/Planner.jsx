
import { useState } from "react";
import "./Planner.css";

function Planner() {
  const [subjects, setSubjects] = useState("");
  const [examDate, setExamDate] = useState("");
  const [studyHours, setStudyHours] = useState("3");
  const [studyStyle, setStudyStyle] = useState("Balanced");

  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!subjects.trim() || !examDate) {
      setError("Please enter your subjects and exam date.");
      return;
    }

    setLoading(true);
    setError("");
    setPlan("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/generate-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(60000),
          body: JSON.stringify({
            subjects,
            examDate,
            studyHours,
            studyStyle,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate study plan.");
      }

      setPlan(data.plan);
    } catch (err) {
      console.error("Study plan error:", err);

      if (
        err.name === "TimeoutError" ||
        err.name === "AbortError"
      ) {
        setError(
          "Gemini is taking too long to respond. Please try again."
        );
      } else {
        setError(
          err.message || "Unable to connect to the AI server."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="planner-page">
      <div className="planner-intro">
        <span className="planner-tag">AI POWERED LEARNING</span>
        <h1>AI Study Planner 📅</h1>
        <p>
          Create a personalized study timetable with the help of
          artificial intelligence.
        </p>
      </div>

      <div className="planner-layout">
        <div className="planner-form-card">
          <h2>Build Your Study Plan</h2>
          <p>Tell us about your upcoming exams.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="subjects">Your Subjects</label>
              <textarea
                id="subjects"
                placeholder="Example: Mathematics, Operating Systems, DSA, Python"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="examDate">Exam Date</label>
              <input
                id="examDate"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="studyHours">Daily Study Hours</label>
              <select
                id="studyHours"
                value={studyHours}
                onChange={(e) => setStudyHours(e.target.value)}
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
                <option value="4">4 hours</option>
                <option value="5">5 hours</option>
                <option value="6">6 hours</option>
                <option value="8">8 hours</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="studyStyle">Preferred Study Style</label>
              <select
                id="studyStyle"
                value={studyStyle}
                onChange={(e) => setStudyStyle(e.target.value)}
              >
                <option value="Balanced">Balanced</option>
                <option value="Intensive">Intensive</option>
                <option value="Revision-focused">Revision-focused</option>
              </select>
            </div>

            {error && (
              <p className="planner-error">{error}</p>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Generating Your Plan..."
                : "✨ Generate My Study Plan"}
            </button>
          </form>
        </div>

        <div className="planner-info-card">
          <div className="planner-info-icon">🤖</div>
          <h2>Your Personal AI Study Assistant</h2>
          <p>
            Gemini AI analyzes your subjects, exam date, available
            time and preferred learning style to create a personalized
            study plan.
          </p>

          <div className="planner-benefit">
            <span>📚</span>
            <div>
              <strong>Subject-wise planning</strong>
              <p>Organize your subjects and topics.</p>
            </div>
          </div>

          <div className="planner-benefit">
            <span>⏰</span>
            <div>
              <strong>Time management</strong>
              <p>Make the most of your daily study hours.</p>
            </div>
          </div>

          <div className="planner-benefit">
            <span>🎯</span>
            <div>
              <strong>Exam preparation</strong>
              <p>Focus on revision and exam readiness.</p>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="planner-result">
          <h2>🤖 Gemini is preparing your study plan...</h2>
          <p>Please wait while AI creates your timetable.</p>
        </div>
      )}

      {plan && (
        <div className="planner-result">
          <h2>🎉 Your Personalized Study Plan</h2>
          <p className="planner-result-subtitle">
            Generated by Gemini AI based on your study preferences.
          </p>

          <div className="planner-plan-text">
            {plan}
          </div>

          <button
            className="primary-button"
            onClick={() => window.print()}
          >
            Print / Save Study Plan
          </button>
        </div>
      )}
    </div>
  );
}

export default Planner;
