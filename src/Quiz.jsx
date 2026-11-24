import { useState } from "react";
import { postJson } from "./api";
import "./tools.css";

const letters = ["A", "B", "C", "D"];

function Quiz() {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState("5");
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (event) => {
    event.preventDefault();

    if (!subject.trim() || !topic.trim()) {
      setError("Please enter a subject and a topic.");
      return;
    }

    setLoading(true);
    setError("");
    setQuiz(null);
    setAnswers({});
    setResult(null);

    try {
      const data = await postJson("/api/generate-quiz", {
        subject,
        topic,
        count: Number(count),
      });

      setQuiz(data.quiz);
    } catch (err) {
      setError(err.message || "Unable to generate the quiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuiz = (event) => {
    event.preventDefault();

    if (!quiz) return;

    const unanswered = quiz.questions.some(
      (_, index) => answers[index] === undefined
    );

    if (unanswered) {
      setError("Select an answer for every question before submitting.");
      return;
    }

    const details = quiz.questions.map((question, index) => ({
      selected: answers[index],
      correct: question.answer,
      isCorrect: answers[index] === question.answer,
    }));

    setResult({
      score: details.filter((item) => item.isCorrect).length,
      total: quiz.questions.length,
      details,
    });
    setError("");
  };

  return (
    <div className="tool-page">
      <div className="tool-intro orange-banner">
        <span className="tool-tag">AI POWERED LEARNING</span>
        <h1>Quiz Generator 📝</h1>
        <p>
          Build a multiple-choice quiz, answer it, and see your score
          with the correct options explained.
        </p>
      </div>

      <div className="tool-card">
        <h2>Create a quiz</h2>
        <p className="tool-muted">Each question has four options.</p>

        <form className="quiz-form" onSubmit={handleGenerate}>
          <div className="tool-field">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              required
              placeholder="Example: Operating Systems"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          </div>

          <div className="tool-field">
            <label htmlFor="quiz-topic">Topic</label>
            <input
              id="quiz-topic"
              required
              placeholder="Example: Process scheduling"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
          </div>

          <div className="tool-field">
            <label htmlFor="count">Number of questions</label>
            <select
              id="count"
              value={count}
              onChange={(event) => setCount(event.target.value)}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </div>

          <button className="tool-button" type="submit" disabled={loading}>
            {loading ? "Generating Quiz..." : "Generate Quiz"}
          </button>
        </form>

        {error && <p className="tool-error">{error}</p>}
      </div>

      {loading && (
        <div className="tool-result">
          <h2>Writing your questions...</h2>
          <p>This can take a little longer for 10 or 15 questions.</p>
        </div>
      )}

      {quiz && (
        <form className="tool-result" onSubmit={handleSubmitQuiz}>
          <h2>{quiz.title}</h2>
          <p className="tool-muted">
            {quiz.questions.length} questions · select one option each
          </p>

          {quiz.questions.map((question, index) => {
            const detail = result?.details[index];

            return (
              <fieldset className="quiz-question" key={question.question}>
                <legend>
                  {index + 1}. {question.question}
                </legend>

                {question.options.map((option, optionIndex) => {
                  const checked = answers[index] === optionIndex;
                  let state = "";

                  if (detail) {
                    if (optionIndex === detail.correct) state = "correct";
                    else if (checked) state = "incorrect";
                  }

                  return (
                    <label
                      className={`quiz-option ${state}`}
                      key={`${index}-${optionIndex}`}
                    >
                      <input
                        type="radio"
                        name={`question-${index}`}
                        checked={checked}
                        disabled={Boolean(result)}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            [index]: optionIndex,
                          }))
                        }
                      />
                      <span>
                        {letters[optionIndex]}. {option}
                      </span>
                    </label>
                  );
                })}

                {detail && (
                  <p className="quiz-explanation">
                    {detail.isCorrect ? "Correct. " : "Incorrect. "}
                    {question.explanation}
                  </p>
                )}
              </fieldset>
            );
          })}

          {!result && (
            <button className="tool-button" type="submit">
              Submit Quiz
            </button>
          )}

          {result && (
            <div className="quiz-score">
              <h3>
                Score: {result.score} / {result.total}
              </h3>
              <p>
                {Math.round((result.score / result.total) * 100)}% correct.
                Correct options are highlighted in green.
              </p>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

export default Quiz;
