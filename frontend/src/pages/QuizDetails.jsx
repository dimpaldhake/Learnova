import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import API from "../services/api";
import "../styles/QuizDetails.css";

function QuizDetails() {
    const { id } = useParams();

    const [questions, setQuestions] = useState([]);
    const [options, setOptions] = useState({});
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load quiz questions
    useEffect(() => {
        const getQuestions = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await API.get(
                    `quizzes/${id}/questions/`
                );

                setQuestions(response.data);
            } catch (error) {
                console.log(error.response?.data);

                setError(
                    "Unable to load quiz questions."
                );
            } finally {
                setLoading(false);
            }
        };

        getQuestions();
    }, [id]);

    // Load options for every question
    useEffect(() => {
        const getOptions = async () => {
            try {
                setError("");

                const optionsData = {};

                for (const question of questions) {
                    const response = await API.get(
                        `quizzes/${id}/questions/${question.id}/options/`
                    );

                    optionsData[question.id] =
                        response.data;
                }

                setOptions(optionsData);
            } catch (error) {
                console.log(error.response?.data);

                setError(
                    "Unable to load quiz options."
                );
            }
        };

        if (questions.length > 0) {
            getOptions();
        }
    }, [questions, id]);

    // Select answer
    const handleAnswerChange = (
        questionId,
        optionId
    ) => {
        setAnswers((previous) => ({
            ...previous,
            [questionId]: optionId
        }));

        setError("");
    };

    // Submit quiz
    const handleSubmit = async () => {
        if (Object.keys(answers).length < questions.length) {
            setError(
                "Please answer all questions before submitting."
            );

            return;
        }

        try {
            setSubmitting(true);
            setError("");

            /*
             * Keep answers in question order.
             * This is safer than Object.values(answers).
             */
            const answerList = questions.map(
                (question) => ({
                    option_id: answers[question.id]
                })
            );

            const response = await API.post(
                `quizzes/${id}/attempt/`,
                {
                    answers: answerList
                }
            );

            setResult(response.data);
        } catch (error) {
            console.log(error.response?.data);

            setError(
                error.response?.data?.error ||
                "Unable to submit quiz."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const answeredCount =
        Object.keys(answers).length;

    const progressPercentage =
        questions.length > 0
            ? Math.round(
                  (answeredCount / questions.length) * 100
              )
            : 0;

    // Loading state
    if (loading) {
        return (
            <main className="quiz-details-page">
                <div className="quiz-details-loading">
                    <div className="quiz-loading-spinner" />
                    <h2>Loading quiz...</h2>
                    <p>
                        Please wait while we prepare your
                        questions.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="quiz-details-page">
            <div className="quiz-details-container">

                {/* Header */}
                <header className="quiz-details-header">
                    <span className="quiz-details-eyebrow">
                        Quiz Attempt
                    </span>

                    <h1>
                        Complete Your Quiz
                    </h1>

                    <p>
                        Answer each question carefully and
                        submit your answers when you are
                        ready.
                    </p>
                </header>

                {/* Error */}
                {error && (
                    <div className="quiz-details-error">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                {/* Result */}
                {result ? (
                    <section className="quiz-result-card">

                        <div className="quiz-result-icon">
                            ✓
                        </div>

                        <span className="quiz-result-label">
                            Quiz Completed
                        </span>

                        <h2>
                            Great job!
                        </h2>

                        <p className="quiz-result-message">
                            Your quiz attempt has been
                            successfully submitted.
                        </p>

                        <div className="quiz-result-stats">

                            <div className="quiz-result-stat">
                                <span>
                                    Score
                                </span>

                                <strong>
                                    {result.score}
                                </strong>
                            </div>

                            <div className="quiz-result-stat">
                                <span>
                                    Attempt ID
                                </span>

                                <strong>
                                    #{result.id}
                                </strong>
                            </div>

                        </div>

                    </section>
                ) : (
                    <>
                        {/* Progress */}
                        {questions.length > 0 && (
                            <section className="quiz-progress-card">

                                <div className="quiz-progress-top">

                                    <div className="quiz-progress-info">
                                        <span>
                                            Your Progress
                                        </span>

                                        <strong>
                                            {answeredCount} of{" "}
                                            {questions.length}{" "}
                                            answered
                                        </strong>
                                    </div>

                                    <span className="quiz-progress-percentage">
                                        {progressPercentage}%
                                    </span>

                                </div>

                                <div className="quiz-progress-track">
                                    <div
                                        className="quiz-progress-fill"
                                        style={{
                                            width: `${progressPercentage}%`
                                        }}
                                    />
                                </div>

                            </section>
                        )}

                        {/* Questions */}
                        {questions.length === 0 ? (
                            <section className="quiz-empty-state">

                                <div className="quiz-empty-icon">
                                    📝
                                </div>

                                <h2>
                                    No Questions Available
                                </h2>

                                <p>
                                    This quiz does not have
                                    any questions yet.
                                </p>

                            </section>
                        ) : (
                            <section className="quiz-question-list">

                                {questions.map(
                                    (question, index) => (
                                        <article
                                            key={question.id}
                                            className={`quiz-question-card ${
                                                answers[
                                                    question.id
                                                ]
                                                    ? "answered"
                                                    : ""
                                            }`}
                                        >

                                            {/* Question Header */}
                                            <div className="quiz-question-header">

                                                <span className="quiz-question-number">
                                                    Question{" "}
                                                    {index + 1}
                                                </span>

                                                <span className="quiz-question-marks">
                                                    {question.marks}{" "}
                                                    {question.marks === 1
                                                        ? "Mark"
                                                        : "Marks"}
                                                </span>

                                            </div>

                                            {/* Question Text */}
                                            <h2 className="quiz-question-text">
                                                {
                                                    question.question_text
                                                }
                                            </h2>

                                            {/* Options */}
                                            <div className="quiz-options">

                                                {options[
                                                    question.id
                                                ]?.map(
                                                    (option) => (
                                                        <label
                                                            key={
                                                                option.id
                                                            }
                                                            className={`quiz-option ${
                                                                answers[
                                                                    question.id
                                                                ] ===
                                                                option.id
                                                                    ? "selected"
                                                                    : ""
                                                            }`}
                                                        >

                                                            <input
                                                                type="radio"
                                                                name={`question-${question.id}`}
                                                                value={
                                                                    option.id
                                                                }
                                                                checked={
                                                                    answers[
                                                                        question.id
                                                                    ] ===
                                                                    option.id
                                                                }
                                                                onChange={() =>
                                                                    handleAnswerChange(
                                                                        question.id,
                                                                        option.id
                                                                    )
                                                                }
                                                            />

                                                            <span className="quiz-radio">
                                                                <span />
                                                            </span>

                                                            <span className="quiz-option-text">
                                                                {
                                                                    option.option_text
                                                                }
                                                            </span>

                                                        </label>
                                                    )
                                                )}

                                                {!options[
                                                    question.id
                                                ] && (
                                                    <p className="quiz-option-loading">
                                                        Loading options...
                                                    </p>
                                                )}

                                                {options[
                                                    question.id
                                                ]?.length === 0 && (
                                                    <p className="quiz-no-options">
                                                        No options available
                                                        for this question.
                                                    </p>
                                                )}

                                            </div>

                                        </article>
                                    )
                                )}

                            </section>
                        )}

                        {/* Submit */}
                        {questions.length > 0 && (
                            <section className="quiz-submit-section">

                                <div className="quiz-submit-info">

                                    <strong>
                                        Ready to submit?
                                    </strong>

                                    <span>
                                        {answeredCount ===
                                        questions.length
                                            ? "You have answered all questions."
                                            : `You still have ${
                                                  questions.length -
                                                  answeredCount
                                              } question${
                                                  questions.length -
                                                      answeredCount !==
                                                  1
                                                      ? "s"
                                                      : ""
                                              } remaining.`}
                                    </span>

                                </div>

                                <button
                                    className="quiz-submit-button"
                                    onClick={handleSubmit}
                                    disabled={
                                        submitting ||
                                        answeredCount !==
                                            questions.length
                                    }
                                >
                                    {submitting
                                        ? "Submitting..."
                                        : "Submit Quiz →"}
                                </button>

                            </section>
                        )}

                    </>
                )}

            </div>
        </main>
    );
}

export default QuizDetails;