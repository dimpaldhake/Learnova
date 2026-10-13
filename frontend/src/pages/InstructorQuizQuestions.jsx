import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../services/api";
import "../styles/InstructorQuizQuestions.css";

function InstructorQuizQuestions() {
    const { id } = useParams();

    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);

    const [questionText, setQuestionText] = useState("");
    const [marks, setMarks] = useState(1);

    const [editingQuestion, setEditingQuestion] = useState(null);

    const [optionText, setOptionText] = useState("");
    const [isCorrect, setIsCorrect] = useState(false);

    const [activeQuestion, setActiveQuestion] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const getQuiz = async () => {
        try {
            const response = await API.get(`quizzes/${id}/`);
            setQuiz(response.data);
        } catch (error) {
            console.log(error.response?.data);
            setError("Unable to load quiz.");
        }
    };

    const getQuestions = async () => {
        try {
            const response = await API.get(
                `quizzes/${id}/questions/`
            );

            const questionsWithOptions = await Promise.all(
                response.data.map(async (question) => {
                    try {
                        const optionResponse = await API.get(
                            `quizzes/${id}/questions/${question.id}/options/`
                        );

                        return {
                            ...question,
                            options: optionResponse.data
                        };
                    } catch (error) {
                        return {
                            ...question,
                            options: []
                        };
                    }
                })
            );

            setQuestions(questionsWithOptions);
        } catch (error) {
            console.log(error.response?.data);
            setError("Unable to load questions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getQuiz();
        getQuestions();
    }, [id]);

    const clearQuestionForm = () => {
        setQuestionText("");
        setMarks(1);
        setEditingQuestion(null);
    };

    const createQuestion = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");

        try {
            await API.post(`quizzes/${id}/questions/`, {
                question_text: questionText,
                marks: Number(marks)
            });

            setMessage("Question created successfully.");

            clearQuestionForm();

            await getQuestions();
        } catch (error) {
            console.log(error.response?.data);

            setError(
                error.response?.data?.error ||
                "Unable to create question."
            );
        }
    };

    const startEditQuestion = (question) => {
        setEditingQuestion(question);
        setQuestionText(question.question_text);
        setMarks(question.marks);

        setMessage("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const updateQuestion = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");

        try {
            await API.patch(
                `quizzes/${id}/questions/${editingQuestion.id}/`,
                {
                    question_text: questionText,
                    marks: Number(marks)
                }
            );

            setMessage("Question updated successfully.");

            clearQuestionForm();

            await getQuestions();
        } catch (error) {
            console.log(error.response?.data);

            setError(
                error.response?.data?.error ||
                "Unable to update question."
            );
        }
    };

    const deleteQuestion = async (questionId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this question?"
        );

        if (!confirmed) {
            return;
        }

        setError("");
        setMessage("");

        try {
            await API.delete(
                `quizzes/${id}/questions/${questionId}/`
            );

            setMessage("Question deleted successfully.");

            await getQuestions();
        } catch (error) {
            console.log(error.response?.data);

            setError(
                error.response?.data?.error ||
                "Unable to delete question."
            );
        }
    };

    const createOption = async (event, questionId) => {
        event.preventDefault();

        setError("");
        setMessage("");

        try {
            await API.post(
                `quizzes/${id}/questions/${questionId}/options/`,
                {
                    option_text: optionText,
                    is_correct: isCorrect
                }
            );

            setMessage("Option added successfully.");

            setOptionText("");
            setIsCorrect(false);

            setActiveQuestion(questionId);

            await getQuestions();
        } catch (error) {
            console.log(error.response?.data);

            setError(
                error.response?.data?.error ||
                "Unable to create option."
            );
        }
    };

    const deleteOption = async (questionId, optionId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this option?"
        );

        if (!confirmed) {
            return;
        }

        setError("");
        setMessage("");

        try {
            await API.delete(
                `quizzes/${id}/questions/${questionId}/options/${optionId}/`
            );

            setMessage("Option deleted successfully.");

            await getQuestions();
        } catch (error) {
            console.log(error.response?.data);

            setError(
                error.response?.data?.error ||
                "Unable to delete option."
            );
        }
    };

    if (loading) {
        return (
            <div className="quiz-questions-loading">
                <h2>Loading quiz...</h2>
            </div>
        );
    }

    return (
        <main className="instructor-quiz-questions-page">
            <div className="instructor-quiz-questions-container">

                {/* Header */}
                <section className="quiz-questions-header">
                    <div className="quiz-questions-header-top">
                        <div className="quiz-questions-icon">
                            📝
                        </div>

                        <div>
                            <h1>Manage Quiz Questions</h1>

                            {quiz && (
                                <>
                                    <h2>{quiz.title}</h2>

                                    <p>
                                        {quiz.description}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Error */}
                {error && (
                    <div className="quiz-questions-error">
                        ❌ {error}
                    </div>
                )}

                {/* Success */}
                {message && (
                    <div className="quiz-questions-message">
                        ✅ {message}
                    </div>
                )}

                {/* Add/Edit Question */}
                <section className="question-form-card">
                    <div className="question-form-header">
                        <h2>
                            {editingQuestion
                                ? "✏️ Edit Question"
                                : "➕ Add Question"}
                        </h2>
                    </div>

                    <form
                        className="question-form"
                        onSubmit={
                            editingQuestion
                                ? updateQuestion
                                : createQuestion
                        }
                    >
                        <div className="question-form-group">
                            <label>Question</label>

                            <textarea
                                value={questionText}
                                onChange={(event) =>
                                    setQuestionText(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter your question"
                                required
                            />
                        </div>

                        <div className="question-form-group">
                            <label>Marks</label>

                            <input
                                type="number"
                                value={marks}
                                min="1"
                                onChange={(event) =>
                                    setMarks(
                                        event.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="question-form-actions">
                            <button
                                type="submit"
                                className={
                                    editingQuestion
                                        ? "update-question-button"
                                        : "create-question-button"
                                }
                            >
                                {editingQuestion
                                    ? "Update Question"
                                    : "Create Question"}
                            </button>

                            {editingQuestion && (
                                <button
                                    type="button"
                                    className="cancel-question-button"
                                    onClick={
                                        clearQuestionForm
                                    }
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                {/* Questions */}
                <section className="questions-section">

                    <div className="questions-section-header">
                        <h2>Questions</h2>

                        <span className="questions-count">
                            {questions.length} Questions
                        </span>
                    </div>

                    {questions.length === 0 ? (
                        <div className="questions-empty-state">
                            <p>
                                No questions have been
                                created yet.
                            </p>
                        </div>
                    ) : (
                        questions.map(
                            (question, index) => (
                                <article
                                    key={question.id}
                                    className="instructor-question-card"
                                >
                                    {/* Question Header */}
                                    <div className="question-card-header">
                                        <div>
                                            <div className="question-number">
                                                Question {index + 1}
                                            </div>

                                            <h3 className="question-text">
                                                {question.question_text}
                                            </h3>
                                        </div>

                                        <span className="question-marks">
                                            {question.marks} marks
                                        </span>
                                    </div>

                                    {/* Question Actions */}
                                    <div className="question-actions">
                                        <button
                                            className="edit-question-button"
                                            onClick={() =>
                                                startEditQuestion(
                                                    question
                                                )
                                            }
                                        >
                                            ✏️ Edit
                                        </button>

                                        <button
                                            className="delete-question-button"
                                            onClick={() =>
                                                deleteQuestion(
                                                    question.id
                                                )
                                            }
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>

                                    {/* Options */}
                                    <div className="options-section">
                                        <h4>Options</h4>

                                        {question.options?.length === 0 ? (
                                            <p>
                                                No options added yet.
                                            </p>
                                        ) : (
                                            question.options.map(
                                                (option) => (
                                                    <div
                                                        key={option.id}
                                                        className="quiz-option"
                                                    >
                                                        <div>
                                                            <span className="quiz-option-text">
                                                                {
                                                                    option.option_text
                                                                }
                                                            </span>

                                                            {option.is_correct && (
                                                                <span className="correct-badge">
                                                                    ✓ Correct
                                                                </span>
                                                            )}
                                                        </div>

                                                        <button
                                                            className="delete-option-button"
                                                            onClick={() =>
                                                                deleteOption(
                                                                    question.id,
                                                                    option.id
                                                                )
                                                            }
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                )
                                            )
                                        )}

                                        {/* Add Option Button */}
                                        <button
                                            className="add-option-button"
                                            onClick={() => {
                                                setActiveQuestion(
                                                    activeQuestion ===
                                                        question.id
                                                        ? null
                                                        : question.id
                                                );

                                                setOptionText("");
                                                setIsCorrect(false);
                                            }}
                                        >
                                            {activeQuestion ===
                                            question.id
                                                ? "Cancel"
                                                : "➕ Add Option"}
                                        </button>

                                        {/* Add Option Form */}
                                        {activeQuestion ===
                                            question.id && (
                                            <form
                                                className="option-form"
                                                onSubmit={(event) =>
                                                    createOption(
                                                        event,
                                                        question.id
                                                    )
                                                }
                                            >
                                                <div className="option-form-row">
                                                    <input
                                                        type="text"
                                                        value={optionText}
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            setOptionText(
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        placeholder="Enter option"
                                                        required
                                                    />

                                                    <label className="correct-checkbox">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                isCorrect
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                setIsCorrect(
                                                                    event
                                                                        .target
                                                                        .checked
                                                                )
                                                            }
                                                        />

                                                        Correct
                                                    </label>
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="option-submit-button"
                                                >
                                                    Add Option
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </article>
                            )
                        )
                    )}
                </section>

                {/* Back */}
                <Link
                    className="quiz-questions-back"
                    to={`/instructor/courses/${quiz?.course}/quizzes`}
                >
                    ← Back to Course Quizzes
                </Link>

            </div>
        </main>
    );
}

export default InstructorQuizQuestions;