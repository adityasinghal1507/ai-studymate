import { useState } from "react";
import { postJson } from "./api";
import "./tools.css";

function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hi, I am your study tutor. Ask me about a subject, a concept, or how to revise for an exam.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const question = input.trim();

    if (!question || loading) return;

    const history = messages.slice(1);
    if (history.at(-1)?.role === "user") {
      history.pop();
    }

    const nextMessages = [
      ...messages,
      { role: "user", text: question },
    ];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const data = await postJson("/api/chat", {
        message: question,
        history,
      });

      setMessages((current) => [
        ...current,
        { role: "model", text: data.reply },
      ]);
    } catch (err) {
      setError(err.message || "Unable to reach the study chatbot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-page">
      <div className="tool-intro green-banner">
        <span className="tool-tag">AI POWERED LEARNING</span>
        <h1>AI Study Chat 🤖</h1>
        <p>
          Ask follow-up questions in the same conversation and get help
          while you study.
        </p>
      </div>

      <div className="chat-panel">
        <div className="chat-log" aria-live="polite">
          {messages.map((message, index) => (
            <div
              className={`chat-row ${message.role}`}
              key={`${message.role}-${index}`}
            >
              <div className="chat-bubble">
                <strong>{message.role === "user" ? "You" : "StudyMate"}</strong>
                <p>{message.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-row model">
              <div className="chat-bubble">
                <strong>StudyMate</strong>
                <p>Thinking...</p>
              </div>
            </div>
          )}
        </div>

        {error && <p className="tool-error">{error}</p>}

        <form className="chat-form" onSubmit={handleSubmit}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask an academic question..."
            aria-label="Your question"
            disabled={loading}
          />
          <button className="tool-button" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
