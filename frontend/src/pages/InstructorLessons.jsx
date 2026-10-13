import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import API from "../services/api";
import "../styles/InstructorLessons.css";

function InstructorLessons() {
    const { id } = useParams();

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [order, setOrder] = useState("");

    const [editingLesson, setEditingLesson] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Load course
    const getCourse = async () => {
        try {
            const response = await API.get(`courses/${id}/`);
            setCourse(response.data);
        } catch (error) {
            console.log(error.response?.data);
            setError("Unable to load course");
        }
    };

    // Load lessons
    const getLessons = async () => {
        try {
            const response = await API.get(
                `lessons/?course=${id}`
            );

            const sortedLessons = [...response.data].sort(
                (a, b) => a.order - b.order
            );

            setLessons(sortedLessons);
        } catch (error) {
            console.log(error.response?.data);
            setError("Unable to load lessons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCourse();
        getLessons();
    }, [id]);

    // Clear form
    const clearForm = () => {
        setTitle("");
        setContent("");
        setOrder("");
        setEditingLesson(null);
    };

    // Create lesson
    const createLesson = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");

        try {
            await API.post("lessons/", {
                course: id,
                title: title,
                content: content,
                order: Number(order),
            });

            setMessage("Lesson created successfully.");

            clearForm();
            getLessons();
        } catch (error) {
            console.log(error.response?.data);

            setError(
                error.response?.data?.message ||
                "Unable to create lesson."
            );
        }
    };

    // Start editing
    const startEdit = (lesson) => {
        setEditingLesson(lesson);

        setTitle(lesson.title);
        setContent(lesson.content);
        setOrder(lesson.order);

        setMessage("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // Update lesson
    const updateLesson = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");

        try {
            await API.patch(
                `lessons/${editingLesson.id}/`,
                {
                    title: title,
                    content: content,
                    order: Number(order),
                }
            );

            setMessage("Lesson updated successfully.");

            clearForm();
            getLessons();
        } catch (error) {
            console.log(error.response?.data);

            setError(
                error.response?.data?.message ||
                "Unable to update lesson."
            );
        }
    };

    // Delete lesson
    const deleteLesson = async (lessonId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this lesson?"
        );

        if (!confirmDelete) {
            return;
        }

        setError("");
        setMessage("");

        try {
            await API.delete(`lessons/${lessonId}/`);

            setMessage("Lesson deleted successfully.");

            getLessons();
        } catch (error) {
            console.log(error.response?.data);

            setError(
                error.response?.data?.message ||
                "Unable to delete lesson."
            );
        }
    };

    if (loading) {
        return (
            <main className="instructor-lessons-loading">
                <p>Loading lessons...</p>
            </main>
        );
    }

    return (
        <main className="instructor-lessons-page">
            <div className="instructor-lessons-container">

                {/* Course Header */}

                <header className="instructor-lessons-header">
                    <span className="instructor-lessons-eyebrow">
                        Instructor Area
                    </span>

                    <h1>
                        Manage Lessons
                    </h1>

                    {course && (
                        <>
                            <h2 className="instructor-lessons-course-title">
                                {course.title}
                            </h2>

                            <p className="instructor-lessons-course-description">
                                {course.description}
                            </p>
                        </>
                    )}
                </header>

                {/* Messages */}

                {error && (
                    <div className="instructor-lessons-error">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="instructor-lessons-message">
                        {message}
                    </div>
                )}

                {/* Lesson Form */}

                <section className="lesson-form-card">

                    <div className="lesson-form-header">
                        <h2>
                            {editingLesson
                                ? "Edit Lesson"
                                : "Add New Lesson"}
                        </h2>

                        <p>
                            {editingLesson
                                ? "Update the lesson information below."
                                : "Create a new lesson for this course."}
                        </p>
                    </div>

                    <form
                        className="lesson-form"
                        onSubmit={
                            editingLesson
                                ? updateLesson
                                : createLesson
                        }
                    >

                        <div className="lesson-form-group">
                            <label htmlFor="lesson-title">
                                Lesson Title
                            </label>

                            <input
                                id="lesson-title"
                                type="text"
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                                placeholder="Enter lesson title"
                                required
                            />
                        </div>

                        <div className="lesson-form-group">
                            <label htmlFor="lesson-content">
                                Lesson Content
                            </label>

                            <textarea
                                id="lesson-content"
                                value={content}
                                onChange={(event) =>
                                    setContent(event.target.value)
                                }
                                placeholder="Enter lesson content"
                                rows="6"
                                required
                            />
                        </div>

                        <div className="lesson-form-group">
                            <label htmlFor="lesson-order">
                                Lesson Order
                            </label>

                            <input
                                id="lesson-order"
                                type="number"
                                value={order}
                                onChange={(event) =>
                                    setOrder(event.target.value)
                                }
                                placeholder="Example: 1"
                                min="1"
                                required
                            />
                        </div>

                        <div className="lesson-form-actions">

                            <button
                                type="submit"
                                className="lesson-primary-button"
                            >
                                {editingLesson
                                    ? "Update Lesson"
                                    : "Create Lesson"}
                            </button>

                            {editingLesson && (
                                <button
                                    type="button"
                                    className="lesson-secondary-button"
                                    onClick={clearForm}
                                >
                                    Cancel
                                </button>
                            )}

                        </div>

                    </form>
                </section>

                {/* Lessons List */}

                <section>

                    <div className="lessons-section-header">

                        <div>
                            <h2>
                                Course Lessons
                            </h2>
                        </div>

                        <span className="lesson-count">
                            {lessons.length}{" "}
                            {lessons.length === 1
                                ? "lesson"
                                : "lessons"}
                        </span>

                    </div>

                    {lessons.length === 0 ? (
                        <div className="lesson-empty-state">
                            <h3>
                                No lessons yet
                            </h3>

                            <p>
                                Create the first lesson for this course
                                using the form above.
                            </p>
                        </div>
                    ) : (
                        <div className="instructor-lesson-list">

                            {lessons.map((lesson) => (
                                <article
                                    key={lesson.id}
                                    className="instructor-lesson-card"
                                >

                                    <div className="lesson-card-top">

                                        <div>
                                            <h3>
                                                Lesson {lesson.order}:{" "}
                                                {lesson.title}
                                            </h3>
                                        </div>

                                        <span className="lesson-number">
                                            Lesson {lesson.order}
                                        </span>

                                    </div>

                                    <p>
                                        {lesson.content}
                                    </p>

                                    <div className="lesson-card-actions">

                                        <button
                                            className="lesson-edit-button"
                                            onClick={() =>
                                                startEdit(lesson)
                                            }
                                        >
                                            ✏️ Edit
                                        </button>

                                        <button
                                            className="lesson-delete-button"
                                            onClick={() =>
                                                deleteLesson(
                                                    lesson.id
                                                )
                                            }
                                        >
                                            🗑️ Delete
                                        </button>

                                    </div>

                                </article>
                            ))}

                        </div>
                    )}

                </section>

                {/* Back */}

                <Link
                    to="/instructor-dashboard"
                    className="instructor-lessons-back"
                >
                    ← Back to Instructor Dashboard
                </Link>

            </div>
        </main>
    );
}

export default InstructorLessons;
