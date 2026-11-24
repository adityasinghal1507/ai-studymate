
import { useState } from "react";
import "./App.css";
import Planner from "./Planner";
import Explainer from "./Explainer";
import Quiz from "./Quiz";
import Chat from "./Chat";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const features = [
    {
      icon: "📅",
      title: "AI Study Planner",
      description: "Create personalized study schedules.",
      color: "purple",
      page: "Study Planner",
    },
    {
      icon: "📚",
      title: "Topic Explainer",
      description: "Understand difficult topics easily.",
      color: "blue",
      page: "Topic Explainer",
    },
    {
      icon: "📝",
      title: "Quiz Generator",
      description: "Test your knowledge with AI quizzes.",
      color: "orange",
      page: "Quiz Generator",
    },
    {
      icon: "🤖",
      title: "AI Study Chat",
      description: "Ask questions and get instant help.",
      color: "green",
      page: "AI Chatbot",
    },
  ];

  const navigation = [
    "Dashboard",
    "Study Planner",
    "Topic Explainer",
    "Quiz Generator",
    "AI Chatbot",
  ];

  const icons = ["🏠", "📅", "📚", "📝", "🤖"];

  return (
    <div className="app-container">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="logo">
          <span className="logo-icon">🎓</span>
          <h2>StudyMate</h2>
        </div>

        <p className="menu-heading">MENU</p>

        <nav>
          {navigation.map((item, index) => (
            <button
              key={item}
              className={`nav-item ${
                activePage === item ? "active" : ""
              }`}
              onClick={() => setActivePage(item)}
            >
              <span>{icons[index]}</span>
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <span>💡</span>
            <h3>Need help?</h3>
            <p>Your AI study companion is always here.</p>
          </div>

          <p className="version">AI StudyMate v1.0</p>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* HEADER */}
        <header className="topbar">

          <div>
            <p className="breadcrumb">
              Pages / {activePage}
            </p>
            <h2>{activePage}</h2>
          </div>

          <div className="profile">
            <span>🔔</span>

            <div className="avatar">A</div>

            <div>
              <strong>Student</strong>
              <p>Welcome back!</p>
            </div>
          </div>

        </header>

        {/* DASHBOARD */}
        {activePage === "Dashboard" ? (

          <>
            <section className="welcome-banner">

              <div>
                <p className="banner-label">
                  YOUR PERSONAL AI STUDY ASSISTANT
                </p>

                <h1>Learn smarter, not harder! 🚀</h1>

                <p>
                  Organize your studies, understand complex
                  topics and prepare for exams with AI.
                </p>

                <button
                  className="primary-button"
                  onClick={() => setActivePage("Study Planner")}
                >
                  Start Studying →
                </button>
              </div>

              <div className="banner-emoji">📖</div>

            </section>

            {/* STATISTICS */}
            <section className="stats-grid">

              <div className="stat-card">
                <span>📖</span>
                <p>Subjects</p>
                <h2>6</h2>
                <small>Your learning subjects</small>
              </div>

              <div className="stat-card">
                <span>⏱️</span>
                <p>Study Hours</p>
                <h2>12 hrs</h2>
                <small>Weekly study target</small>
              </div>

              <div className="stat-card">
                <span>🎯</span>
                <p>Study Goals</p>
                <h2>4</h2>
                <small>Goals to complete</small>
              </div>

              <div className="stat-card">
                <span>🔥</span>
                <p>Study Streak</p>
                <h2>3 Days</h2>
                <small>Keep it going!</small>
              </div>

            </section>

            {/* AI FEATURES */}
            <section className="features-section">

              <div className="section-heading">
                <div>
                  <h2>Your AI Learning Tools</h2>
                  <p>
                    Choose a tool to improve your learning.
                  </p>
                </div>
              </div>

              <div className="features-grid">

                {features.map((feature) => (

                  <div
                    className="feature-card"
                    key={feature.title}
                  >

                    <div className={`feature-icon ${feature.color}`}>
                      {feature.icon}
                    </div>

                    <h3>{feature.title}</h3>

                    <p>{feature.description}</p>

                    <button
                      onClick={() => setActivePage(feature.page)}
                    >
                      Explore Tool →
                    </button>

                  </div>

                ))}

              </div>

            </section>
          </>

        ) : activePage === "Study Planner" ? (

          <Planner />

        ) : activePage === "Topic Explainer" ? (

          <Explainer />

        ) : activePage === "Quiz Generator" ? (

          <Quiz />

        ) : activePage === "AI Chatbot" ? (

          <Chat />

        ) : null}

        <footer>
          Made with ❤️ for students | AI StudyMate
        </footer>

      </main>

    </div>
  );
}

export default App;
