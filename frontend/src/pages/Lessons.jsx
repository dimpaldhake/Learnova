import { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import AuthContext from "../context/AuthContext";

import API from "../services/api";
import "../styles/Lessons.css";

function Lessons() {
    const { id } = useParams();
    const { user } = useContext(AuthContext);

    const [lessons, setLessons] = useState([]);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [error, setError] = useState("");

    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollmentChecked, setEnrollmentChecked] = useState(false);

    // Load lessons for the selected course.
    useEffect(() => {
        const getLessons = async () => {
            setError("");
            setLessons([]);

            try {
                const response = await API.get(
                    `lessons/?course=${id}`
                );

                setLessons(response.data);
            } catch (error) {
                console.log(error.response?.data);
                setError("Unable to load lessons.");
            }
        };

        getLessons();
    }, [id]);

    // Load the logged-in student's completed lessons.
    useEffect(() => {
        const getProgress = async () => {
            try {
                const response = await API.get(
                    "lesson-progress/"
                );

                const completedIds = response.data
                    .filter((item) => item.completed)
                    .map((item) => Number(item.lesson));

                setCompletedLessons(completedIds);
            } catch (error) {
                console.log(error.response?.data);
            }
        };

        getProgress();
    }, []);

    // Check whether the logged-in student is enrolled
    // in the currently selected course.
    useEffect(() => {
        let isMounted = true;

        const checkEnrollment = async () => {
            setEnrollmentChecked(false);
            setIsEnrolled(false);

            try {
                const response = await API.get(
                    "enrollments/"
                );

                const enrolled = response.data.some(
                    (item) =>
                        String(item.course) === String(id) &&
                        item.status === "active"
                );

                if (isMounted) {
                    setIsEnrolled(enrolled);
                }
            } catch (error) {
                console.log(error.response?.data);

                if (isMounted) {
                    setIsEnrolled(false);
                }
            } finally {
                if (isMounted) {
                    setEnrollmentChecked(true);
                }
            }
        };

        if (user?.user_type === "student") {
            checkEnrollment();
        } else {
            setEnrollmentChecked(true);
        }

        return () => {
            isMounted = false;
        };
    }, [id, user?.user_type]);

    // Mark a lesson as completed.
    const markCompleted = async (lessonId) => {
        setError("");

        try {
            await API.post("lesson-progress/", {
                lesson: lessonId
            });

            setCompletedLessons((previous) => {
                const numericLessonId = Number(lessonId);

                if (
                    previous.some(
                        (completedId) =>
                            Number(completedId) === numericLessonId
                    )
                ) {
                    return previous;
                }

                return [...previous, numericLessonId];
            });
        } catch (error) {
            console.log(error.response?.data);

            const message =
                error.response?.data?.message ||
                error.response?.data?.detail ||
                error.response?.data?.error ||
                "Unable to mark lesson as completed.";

            setError(message);
        }
    };

    // Calculate course progress.
    const completedCount = lessons.filter((lesson) =>
        completedLessons.includes(Number(lesson.id))
    ).length;

    const progressPercentage =
        lessons.length > 0
            ? Math.round(
                (completedCount / lessons.length) * 100
            )
            : 0;

    return (
        <main className="lessons-page">
            <div className="lessons-container">

                <header className="lessons-header">
                    <span className="lessons-eyebrow">
                        Course Learning
                    </span>

                    <h1>Course Lessons</h1>

                    <p>
                        Learn step by step and track your
                        progress as you complete each lesson.
                    </p>
                </header>

                {/* Course progress */}
                {lessons.length > 0 && (
                    <section className="lessons-progress-card">
                        <div className="lessons-progress-top">
                            <div>
                                <span className="lessons-progress-label">
                                    Your Progress
                                </span>

                                <strong>
                                    {completedCount} of{" "}
                                    {lessons.length} lessons completed
                                </strong>
                            </div>

                            <span className="lessons-progress-percent">
                                {progressPercentage}%
                            </span>
                        </div>

                        <div className="lessons-progress-track">
                            <div
                                className="lessons-progress-fill"
                                style={{
                                    width: `${progressPercentage}%`
                                }}
                            />
                        </div>
                    </section>
                )}

                {/* Error message */}
                {error && (
                    <div
                        className="lessons-error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {/* No lessons available */}
                {lessons.length === 0 && !error && (
                    <section className="lessons-empty">
                        <div className="lessons-empty-icon">
                            📚
                        </div>

                        <h2>No lessons available</h2>

                        <p>
                            This course does not have any
                            lessons yet. Please check again later.
                        </p>
                    </section>
                )}

                {/* Lesson list */}
                {lessons.length > 0 && (
                    <section className="lessons-list">
                        {lessons.map((lesson) => {
                            const isCompleted =
                                completedLessons.includes(
                                    Number(lesson.id)
                                );

                            return (
                                <article
                                    key={lesson.id}
                                    className={`lesson-card ${
                                        isCompleted ? "completed" : ""
                                    }`}
                                >
                                    <div className="lesson-number">
                                        {lesson.order}
                                    </div>

                                    <div className="lesson-content">
                                        <div className="lesson-heading">
                                            <div>
                                                <span className="lesson-label">
                                                    Lesson {lesson.order}
                                                </span>

                                                <h2>
                                                    {lesson.title}
                                                </h2>
                                            </div>

                                            {isCompleted && (
                                                <span className="lesson-completed-badge">
                                                    ✓ Completed
                                                </span>
                                            )}
                                        </div>

                                        <p className="lesson-description">
                                            {lesson.content}
                                        </p>

                                        {/* Enrollment-based actions */}
                                        {user?.user_type === "student" && (
                                            <div className="lesson-action">
                                                {!enrollmentChecked ? (
                                                    <button
                                                        className="lesson-button"
                                                        disabled
                                                    >
                                                        Checking Enrollment...
                                                    </button>
                                                ) : !isEnrolled ? (
                                                    <Link
                                                        to={`/courses/${id}`}
                                                        className="lesson-button"
                                                    >
                                                        Enroll Now →
                                                    </Link>
                                                ) : isCompleted ? (
                                                    <button
                                                        className="lesson-button completed-button"
                                                        disabled
                                                    >
                                                        ✓ Lesson Completed
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="lesson-button"
                                                        onClick={() =>
                                                            markCompleted(lesson.id)
                                                        }
                                                    >
                                                        Mark as Completed
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}
            </div>
        </main>
    );
}

export default Lessons;