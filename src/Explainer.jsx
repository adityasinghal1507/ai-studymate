import { useState } from "react";
import { postJson } from "./api";
import "./tools.css";

function Explainer() {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    setLoading(true);
    setError("");
    setExplanation("");

    try {
      const data = await postJson("/api/explain-topic", {
        topic,
        level,
      });

      setExplanation(data.explanation);
    } catch (err) {
      setError(err.message || "Unable to explain this topic.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-page">
      <div className="tool-intro blue-banner">
        <span className="tool-tag">AI POWERED LEARNING</span>
        <h1>Topic Explainer 📚</h1>
        <p>
          Turn a difficult topic into a clear explanation with examples,
          key points, and a short summary.
        </p>
      </div>

      <div className="tool-layout">
        <div className="tool-card">
          <h2>What do you want to understand?</h2>
          <p className="tool-muted">Choose a topic and a difficulty level.</p>

          <form onSubmit={handleSubmit}>
            <div className="tool-field">
              <label htmlFor="topic">Topic</label>
              <textarea
                id="topic"
                rows="4"
                required
                placeholder="Example: Normalization in databases, Dijkstra's algorithm"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
              />
            </div>

            <div className="tool-field">
              <label htmlFor="level">Difficulty</label>
              <select
                id="level"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {error && <p className="tool-error">{error}</p>}

            <button className="tool-button" type="submit" disabled={loading}>
              {loading ? "Explaining..." : "Explain Topic"}
            </button>
          </form>
        </div>

        <div className="tool-card tool-aside">
          <div className="tool-aside-icon">💡</div>
          <h2>How this helps</h2>
          <p>
            Gemini rewrites the topic at the level you choose, then adds
            examples and a summary you can revise from.
          </p>
          <div className="tool-point"><span>📘</span> Plain-language explanation</div>
          <div className="tool-point"><span>🧪</span> Worked examples</div>
          <div className="tool-point"><span>✅</span> Important points and a short summary</div>
        </div>
      </div>

      {loading && (
        <div className="tool-result">
          <h2>Preparing your explanation...</h2>
          <p>Gemini is writing this at the {level.toLowerCase()} level.</p>
        </div>
      )}

      {explanation && (
        <div className="tool-result">
          <h2>Explanation</h2>
          <p className="tool-muted">Generated for a {level.toLowerCase()} student.</p>
          <div className="tool-text">{explanation}</div>
        </div>
      )}
    </div>
  );
}

export default Explainer;
