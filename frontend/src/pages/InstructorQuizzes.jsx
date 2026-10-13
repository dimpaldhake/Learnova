import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import API from "../services/api";
import "../styles/InstructorQuizzes.css";

function InstructorQuizzes() {
    const { id } = useParams();

    const [course, setCourse] = useState(null);
    const [quizzes, setQuizzes] = useState([]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const getCourse = async () => {
        try {
            const response = await API.get(
                `courses/${id}/`
            );

            setCourse(response.data);
        } catch (error) {
            console.log(
                "Course error:",
                error.response?.data
            );

            setError("Unable to load course.");
        }
    };

    const getQuizzes = async () => {
        try {
            const response = await API.get(
                "quizzes/"
            );

            const courseQuizzes = response.data.filter(
                (quiz) =>
                    Number(quiz.course) === Number(id)
            );

            setQuizzes(courseQuizzes);
        } catch (error) {
            console.log(
                "Quiz error:",
                error.response?.data
            );

            setError("Unable to load quizzes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCourse();
        getQuizzes();
    }, [id]);

    const handleCreateQuiz = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");

        try {
            await API.post(
                "quizzes/",
                {
                    course: id,
                    title: title,
                    description: description
                }
            );

            setMessage(
                "Quiz created successfully."
            );

            setTitle("");
            setDescription("");

            await getQuizzes();

        } catch (error) {
            console.log(
                error.response?.data
            );

            setError(
                error.response?.data?.error ||
                error.response?.data?.detail ||
                "Unable to create quiz."
            );
        }
    };

    if (loading) {
        return (
            <main className="instructor-quizzes-loading">
                <p>Loading quizzes...</p>
            </main>
        );
    }

    return (
        <main className="instructor-quizzes-page">

            <div className="instructor-quizzes-container">

                {/* Header */}

                <header className="instructor-quizzes-header">

                    <div>
                        <span className="instructor-quizzes-eyebrow">
                            Instructor Area
                        </span>

                        <h1>
                            Manage Quizzes
                        </h1>

                        {course && (
                            <>
                                <h2>
                                    {course.title}
                                </h2>

                                <p>
                                    {course.description}
                                </p>
                            </>
                        )}
                    </div>

                    <div className="quiz-header-icon">
                        ?
                    </div>

                </header>

                {/* Messages */}

                {error && (
                    <div className="instructor-quizzes-error">
                        <span>!</span>
                        {error}
                    </div>
                )}

                {message && (
                    <div className="instructor-quizzes-message">
                        <span>✓</span>
                        {message}
                    </div>
                )}

                {/* Create Quiz */}

                <section className="quiz-form-card">

                    <div className="quiz-form-header">

                        <div>
                            <span className="section-label">
                                CREATE
                            </span>

                            <h2>
                                Create New Quiz
                            </h2>

                            <p>
                                Create a quiz to test students'
                                understanding of this course.
                            </p>
                        </div>

                        <div className="quiz-form-icon">
                            +
                        </div>

                    </div>

                    <form
                        className="quiz-form"
                        onSubmit={handleCreateQuiz}
                    >

                        <div className="quiz-form-group">

                            <label htmlFor="quiz-title">
                                Quiz Title
                            </label>

                            <input
                                id="quiz-title"
                                type="text"
                                value={title}
                                onChange={(event) =>
                                    setTitle(
                                        event.target.value
                                    )
                                }
                                placeholder="Example: Python Basics Quiz"
                                required
                            />

                        </div>

                        <div className="quiz-form-group">

                            <label htmlFor="quiz-description">
                                Quiz Description
                            </label>

                            <textarea
                                id="quiz-description"
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter quiz description"
                                rows="5"
                            />

                        </div>

                        <div className="quiz-form-actions">

                            <button
                                type="submit"
                                className="create-quiz-button"
                            >
                                + Create Quiz
                            </button>

                        </div>

                    </form>

                </section>

                {/* Quiz List */}

                <section className="course-quizzes-section">

                    <div className="course-quizzes-heading">

                        <div>
                            <span className="section-label">
                                COURSE CONTENT
                            </span>

                            <h2>
                                Course Quizzes
                            </h2>
                        </div>

                        <span className="quiz-count">
                            {quizzes.length}{" "}
                            {quizzes.length === 1
                                ? "quiz"
                                : "quizzes"}
                        </span>

                    </div>

                    {quizzes.length === 0 ? (
                        <div className="quiz-empty-state">

                            <div className="quiz-empty-icon">
                                ?
                            </div>

                            <h3>
                                No quizzes yet
                            </h3>

                            <p>
                                Create your first quiz using
                                the form above.
                            </p>

                        </div>
                    ) : (
                        <div className="instructor-quiz-list">

                            {quizzes.map((quiz, index) => (
                                <article
                                    key={quiz.id}
                                    className="instructor-quiz-card"
                                >

                                    <div className="quiz-card-icon">
                                        Q
                                    </div>

                                    <div className="quiz-card-content">

                                        <div className="quiz-card-top">

                                            <span className="quiz-card-number">
                                                Quiz {index + 1}
                                            </span>

                                            <span className="quiz-id">
                                                ID #{quiz.id}
                                            </span>

                                        </div>

                                        <h3>
                                            {quiz.title}
                                        </h3>

                                        <p>
                                            {quiz.description ||
                                                "No description provided."}
                                        </p>

                                        <div className="quiz-card-footer">

                                            <Link
                                                to={`/instructor/quizzes/${quiz.id}/questions`}
                                                className="manage-questions-button"
                                            >
                                                Manage Questions
                                                <span>→</span>
                                            </Link>

                                        </div>

                                    </div>

                                </article>
                            ))}

                        </div>
                    )}

                </section>

                {/* Back */}

                <Link
                    to="/instructor-dashboard"
                    className="instructor-quizzes-back"
                >
                    ← Back to Instructor Dashboard
                </Link>

            </div>

        </main>
    );
}

export default InstructorQuizzes;