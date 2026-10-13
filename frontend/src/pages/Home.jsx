import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
    return (
        <main className="home-page">
            <section className="home-hero">
                <div className="home-hero-content">
                    <span className="home-eyebrow">
                        Welcome to Learnova
                    </span>

                    <h1>
                        Learn. Practice. <span>Grow.</span>
                    </h1>

                    <p className="home-hero-description">
                        Learnova is an online learning platform where
                        students can learn courses, take quizzes, and
                        track their learning progress in one place.
                    </p>

                    <div className="home-hero-actions">
                        <Link
                            to="/courses"
                            className="home-primary-button"
                        >
                            Explore Courses →
                        </Link>

                        <Link
                            to="/register"
                            className="home-secondary-button"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>

                <div className="home-hero-card">
                    <div className="home-hero-card-icon">
                        🎓
                    </div>

                    <h2>Your Learning Journey</h2>

                    <p>
                        Learn new skills, practice your knowledge,
                        and keep track of your progress.
                    </p>

                    <div className="home-learning-items">
                        <div>
                            <span>📚</span>
                            <p>Learn Courses</p>
                        </div>

                        <div>
                            <span>📝</span>
                            <p>Take Quizzes</p>
                        </div>

                        <div>
                            <span>📊</span>
                            <p>Track Progress</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="home-features">
                <div className="home-section-heading">
                    <span>Why Learnova?</span>

                    <h2>
                        Everything you need to keep learning
                    </h2>

                    <p>
                        Learnova brings courses, quizzes, and learning
                        progress together in one simple platform.
                    </p>
                </div>

                <div className="home-feature-grid">
                    <article className="home-feature-card">
                        <div className="home-feature-icon">
                            📚
                        </div>

                        <h3>Learn Courses</h3>

                        <p>
                            Explore courses and learn new concepts
                            through structured lessons.
                        </p>
                    </article>

                    <article className="home-feature-card">
                        <div className="home-feature-icon">
                            📝
                        </div>

                        <h3>Practice with Quizzes</h3>

                        <p>
                            Test your understanding with quizzes and
                            review your previous attempts.
                        </p>
                    </article>

                    <article className="home-feature-card">
                        <div className="home-feature-icon">
                            📊
                        </div>

                        <h3>Track Your Progress</h3>

                        <p>
                            Keep track of completed lessons and your
                            learning activity.
                        </p>
                    </article>
                </div>
            </section>

            <section className="home-cta">
                <div>
                    <span className="home-cta-eyebrow">
                        Start Learning
                    </span>

                    <h2>
                        Ready to begin your learning journey?
                    </h2>

                    <p>
                        Explore available courses and start learning
                        with Learnova.
                    </p>
                </div>

                <Link
                    to="/courses"
                    className="home-cta-button"
                >
                    Browse Courses →
                </Link>
            </section>
        </main>
    );
}

export default Home;