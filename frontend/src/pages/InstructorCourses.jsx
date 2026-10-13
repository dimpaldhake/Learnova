import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "../styles/InstructorCourses.css";

function InstructorCourses() {
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        level: "beginner",
        price: ""
    });

    const loadCourses = async () => {
        try {
            const response = await API.get("courses/");
            setCourses(response.data);
        } catch (error) {
            console.log(error.response?.data);
            setError("Unable to load courses.");
        }
    };

    useEffect(() => {
        loadCourses();
    }, []);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const handleDelete = async (courseId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this course?"
        );

        if (!confirmed) {
            return;
        }

        setError("");
        setMessage("");

        try {
            await API.delete(`courses/${courseId}/`);

            setMessage("Course deleted successfully!");

            loadCourses();
        } catch (error) {
            console.log(error.response?.data);

            setError(
                error.response?.data?.message ||
                JSON.stringify(error.response?.data)
            );
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");

        try {
            const response = await API.post(
                "courses/",
                {
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    level: formData.level,
                    price: formData.price
                }
            );

            console.log(response.data);

            setMessage("Course created successfully!");

            setFormData({
                title: "",
                description: "",
                category: "",
                level: "beginner",
                price: ""
            });

            loadCourses();
        } catch (error) {
            console.log(error.response?.data);

            setError(
                error.response?.data?.message ||
                JSON.stringify(error.response?.data)
            );
        }
    };

    return (
        <main className="instructor-courses-page">
            <div className="instructor-courses-container">

                <header className="instructor-courses-header">
                    <span className="instructor-courses-eyebrow">
                        Instructor Panel
                    </span>

                    <h1>Instructor Courses</h1>

                    <p>
                        Create, manage, and organize your courses
                        from one place.
                    </p>
                </header>

                <section className="create-course-card">
                    <div className="section-heading">
                        <h2>Create New Course</h2>
                        <p>
                            Add a new course for students to learn from.
                        </p>
                    </div>

                    <form
                        className="create-course-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="course-form-group">
                            <label htmlFor="course-title">
                                Course Title
                            </label>

                            <input
                                id="course-title"
                                type="text"
                                name="title"
                                placeholder="Enter course title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="course-form-group">
                            <label htmlFor="course-description">
                                Description
                            </label>

                            <textarea
                                id="course-description"
                                name="description"
                                placeholder="Describe what students will learn"
                                value={formData.description}
                                onChange={handleChange}
                                rows="5"
                                required
                            />
                        </div>

                        <div className="course-form-row">
                            <div className="course-form-group">
                                <label htmlFor="course-category">
                                    Category
                                </label>

                                <input
                                    id="course-category"
                                    type="text"
                                    name="category"
                                    placeholder="e.g. Programming"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="course-form-group">
                                <label htmlFor="course-level">
                                    Level
                                </label>

                                <select
                                    id="course-level"
                                    name="level"
                                    value={formData.level}
                                    onChange={handleChange}
                                >
                                    <option value="beginner">
                                        Beginner
                                    </option>

                                    <option value="intermediate">
                                        Intermediate
                                    </option>

                                    <option value="advanced">
                                        Advanced
                                    </option>
                                </select>
                            </div>

                            <div className="course-form-group">
                                <label htmlFor="course-price">
                                    Price
                                </label>

                                <input
                                    id="course-price"
                                    type="number"
                                    name="price"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="create-course-button"
                        >
                            Create Course
                        </button>
                    </form>
                </section>

                {message && (
                    <div className="instructor-course-success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="instructor-course-error">
                        {error}
                    </div>
                )}

                <section className="my-courses-section">
                    <div className="my-courses-heading">
                        <div>
                            <span className="section-eyebrow">
                                Course Management
                            </span>

                            <h2>
                                My Courses
                            </h2>
                        </div>

                        <span className="course-count">
                            {courses.length} Courses
                        </span>
                    </div>

                    {courses.length === 0 ? (
                        <div className="no-courses">
                            <div className="no-courses-icon">
                                📚
                            </div>

                            <h3>No courses found</h3>

                            <p>
                                Create your first course using
                                the form above.
                            </p>
                        </div>
                    ) : (
                        <div className="instructor-course-grid">
                            {courses.map((course) => (
                                <article
                                    key={course.id}
                                    className="instructor-course-card"
                                >
                                    <div className="instructor-course-card-top">
                                        <div className="instructor-course-icon">
                                            {course.title
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <span className="course-level-badge">
                                            {course.level}
                                        </span>
                                    </div>

                                    <div className="instructor-course-card-body">
                                        <h3>
                                            {course.title}
                                        </h3>

                                        <p className="course-description">
                                            {course.description}
                                        </p>

                                        <div className="course-meta">
                                            <div>
                                                <span>
                                                    Category
                                                </span>

                                                <strong>
                                                    {course.category}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Price
                                                </span>

                                                <strong>
                                                    ₹{course.price}
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="course-actions">
                                            <Link
                                                to={`/courses/${course.id}`}
                                                className="course-action secondary"
                                            >
                                                View
                                            </Link>

                                            <Link
                                                to={`/instructor/courses/${course.id}/edit`}
                                                className="course-action primary"
                                            >
                                                Edit
                                            </Link>

                                            <button
                                                onClick={() =>
                                                    handleDelete(course.id)
                                                }
                                                className="course-action danger"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </main>
    );
}

export default InstructorCourses;