import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import API from "../services/api";
import "../styles/Quiz.css";

function Quizzes() {
    const [quizzes, setQuizzes] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const getQuizzes = async () => {
            try {
                const response = await API.get("quizzes/");
                setQuizzes(response.data);
            } catch (error) {
                console.log(error.response?.data);
                setError("Unable to load quizzes.");
            }
        };

        getQuizzes();
    }, []);

    return (
        <main className="quiz-list-page">
            <div className="quiz-list-container">

                <header className="quiz-list-header">
                    <span className="quiz-list-eyebrow">
                        Knowledge Check
                    </span>

                    <h1>Quizzes</h1>

                    <p>
                        Test your knowledge and check how
                        well you understand your courses.
                    </p>
                </header>

                {error && (
                    <div className="quiz-error">
                        {error}
                    </div>
                )}

                {quizzes.length === 0 && !error && (
                    <section className="quiz-empty">
                        <div className="quiz-empty-icon">
                            ?
                        </div>

                        <h2>No quizzes available</h2>

                        <p>
                            There are no quizzes available
                            right now. Check back later.
                        </p>
                    </section>
                )}

                {quizzes.length > 0 && (
                    <section className="quiz-grid">
                        {quizzes.map((quiz, index) => (
                            <article
                                key={quiz.id}
                                className="quiz-card"
                            >
                                <div className="quiz-card-top">
                                    <div className="quiz-icon">
                                        Q
                                    </div>

                                    <span className="quiz-number">
                                        Quiz {index + 1}
                                    </span>
                                </div>

                                <div className="quiz-card-body">
                                    <h2 className="quiz-card-title">
                                        {quiz.title}
                                    </h2>

                                    <p className="quiz-card-description">
                                        {quiz.description ||
                                            "Test your understanding of this course."}
                                    </p>

                                    <div className="quiz-card-info">
                                        <span>
                                            Course
                                        </span>

                                        <strong>
                                            #{quiz.course}
                                        </strong>
                                    </div>

                                    <Link
                                        to={`/quizzes/${quiz.id}`}
                                        className="quiz-start-button"
                                    >
                                        Start Quiz →
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </div>
        </main>
    );
}

export default Quizzes;