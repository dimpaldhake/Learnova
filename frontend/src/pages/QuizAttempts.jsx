
import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/QuizAttempts.css";

function QuizAttempts() {
    const [attempts, setAttempts] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getAttempts = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await API.get(
                    "quizzes/attempts/"
                );

                setAttempts(response.data);
            } catch (error) {
                console.log(error.response?.data);

                setError(
                    "Unable to load quiz attempts."
                );
            } finally {
                setLoading(false);
            }
        };

        getAttempts();
    }, []);

    return (
        <main className="quiz-attempts-page">
            <div className="quiz-attempts-container">

                {/* Header */}
                <header className="quiz-attempts-header">
                    <div className="quiz-attempts-icon">
                        📊
                    </div>

                    <div>
                        <span className="quiz-attempts-eyebrow">
                            Student Activity
                        </span>

                        <h1>
                            Quiz Attempt History
                        </h1>

                        <p>
                            Review your previous quiz attempts,
                            scores, and submission dates.
                        </p>
                    </div>
                </header>

                {/* Error */}
                {error && (
                    <div className="quiz-attempts-error">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <section className="quiz-attempts-loading">
                        <div className="quiz-attempts-spinner" />

                        <h2>
                            Loading your quiz history...
                        </h2>

                        <p>
                            Please wait while we fetch your
                            previous attempts.
                        </p>
                    </section>
                ) : (
                    <>
                        {/* Summary */}
                        {attempts.length > 0 && (
                            <section className="quiz-attempts-summary">

                                <div className="quiz-summary-card">
                                    <span>
                                        Total Attempts
                                    </span>

                                    <strong>
                                        {attempts.length}
                                    </strong>
                                </div>

                                <div className="quiz-summary-card">
                                    <span>
                                        Completed Quizzes
                                    </span>

                                    <strong>
                                        {new Set(
                                            attempts.map(
                                                (attempt) =>
                                                    attempt.quiz_title
                                            )
                                        ).size}
                                    </strong>
                                </div>

                            </section>
                        )}

                        {/* Empty State */}
                        {attempts.length === 0 ? (
                            <section className="quiz-attempts-empty">

                                <div className="quiz-empty-icon">
                                    📝
                                </div>

                                <h2>
                                    No Quiz Attempts Yet
                                </h2>

                                <p>
                                    You haven't completed any
                                    quizzes yet. Your quiz
                                    history will appear here
                                    after you submit your first
                                    quiz.
                                </p>

                            </section>
                        ) : (
                            <section className="quiz-attempts-list">

                                <div className="quiz-attempts-list-header">
                                    <div>
                                        <span>
                                            Your Attempts
                                        </span>

                                        <h2>
                                            Recent Quiz Activity
                                        </h2>
                                    </div>

                                    <span className="quiz-attempts-count">
                                        {attempts.length}{" "}
                                        {attempts.length === 1
                                            ? "Attempt"
                                            : "Attempts"}
                                    </span>
                                </div>

                                {attempts.map(
                                    (attempt, index) => (
                                        <article
                                            key={attempt.id}
                                            className="quiz-attempt-card"
                                        >

                                            <div className="quiz-attempt-number">
                                                {String(
                                                    index + 1
                                                ).padStart(2, "0")}
                                            </div>

                                            <div className="quiz-attempt-main">

                                                <div className="quiz-attempt-title-row">
                                                    <h3>
                                                        {
                                                            attempt.quiz_title
                                                        }
                                                    </h3>

                                                    <span className="quiz-completed-badge">
                                                        ✓ Completed
                                                    </span>
                                                </div>

                                                <div className="quiz-attempt-details">

                                                    <div className="quiz-attempt-detail">
                                                        <span>
                                                            Score
                                                        </span>

                                                        <strong>
                                                            {
                                                                attempt.score
                                                            }
                                                        </strong>
                                                    </div>

                                                    <div className="quiz-attempt-detail">
                                                        <span>
                                                            Attempt ID
                                                        </span>

                                                        <strong>
                                                            #
                                                            {
                                                                attempt.id
                                                            }
                                                        </strong>
                                                    </div>

                                                    <div className="quiz-attempt-detail">
                                                        <span>
                                                            Attempted At
                                                        </span>

                                                        <strong>
                                                            {new Date(
                                                                attempt.attempted_at
                                                            ).toLocaleString()}
                                                        </strong>
                                                    </div>

                                                </div>

                                            </div>

                                        </article>
                                    )
                                )}

                            </section>
                        )}
                    </>
                )}

            </div>
        </main>
    );
}

export default QuizAttempts;