import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AuthContext from "../context/AuthContext";
import API from "../services/api";
import "../styles/InstructorDashboard.css";

function InstructorDashboard() {
    const { user } = useContext(AuthContext);

    const [courses, setCourses] = useState([]);
    const [courseStats, setCourseStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [showCreateForm, setShowCreateForm] = useState(false);

    const [newCourse, setNewCourse] = useState({
        title: "",
        description: "",
        category: "",
        level: "Beginner",
        price: 0,
    });

    const [editingCourseId, setEditingCourseId] = useState(null);

    const [editCourse, setEditCourse] = useState({
        title: "",
        description: "",
        category: "",
        level: "Beginner",
        price: 0,
    });

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const courseResponse = await API.get("courses/");
            const allCourses = courseResponse.data;

            const instructorCourses = allCourses.filter(
                (course) =>
                    course.instructor === user?.id ||
                    course.instructor_username === user?.username
            );

            setCourses(instructorCourses);

            const stats = [];

            for (const course of instructorCourses) {
                let lessons = [];
                let enrollments = [];

                try {
                    const lessonResponse = await API.get(
                        `lessons/?course=${course.id}`
                    );

                    lessons = lessonResponse.data;
                } catch {
                    lessons = [];
                }

                try {
                    const enrollmentResponse = await API.get(
                        `enrollments/?course=${course.id}`
                    );

                    enrollments = enrollmentResponse.data;
                } catch {
                    enrollments = [];
                }

                stats.push({
                    courseId: course.id,
                    lessons: lessons.length,
                    students: enrollments.length,
                });
            }

            setCourseStats(stats);
        } catch (error) {
            setError(
                error.response?.data?.detail ||
                    error.response?.data?.message ||
                    "Unable to load instructor dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadDashboard();
        }
    }, [user]);

    const handleCreateChange = (event) => {
        const { name, value } = event.target;

        setNewCourse((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleCreateCourse = async (event) => {
        event.preventDefault();

        try {
            setError("");
            setMessage("");

            await API.post("courses/", {
                title: newCourse.title,
                description: newCourse.description,
                category: newCourse.category,
                level: newCourse.level,
                price: Number(newCourse.price),
            });

            setMessage("Course created successfully!");

            setNewCourse({
                title: "",
                description: "",
                category: "",
                level: "Beginner",
                price: 0,
            });

            setShowCreateForm(false);

            await loadDashboard();
        } catch (error) {
            setError(
                error.response?.data?.detail ||
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    "Unable to create course."
            );
        }
    };

    const startEditing = (course) => {
        setEditingCourseId(course.id);

        setEditCourse({
            title: course.title || "",
            description: course.description || "",
            category: course.category || "",
            level: course.level || "Beginner",
            price: course.price || 0,
        });

        setMessage("");
        setError("");
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;

        setEditCourse((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleUpdateCourse = async (event) => {
        event.preventDefault();

        try {
            setError("");
            setMessage("");

            await API.put(`courses/${editingCourseId}/`, {
                title: editCourse.title,
                description: editCourse.description,
                category: editCourse.category,
                level: editCourse.level,
                price: Number(editCourse.price),
            });

            setMessage("Course updated successfully!");
            setEditingCourseId(null);

            await loadDashboard();
        } catch (error) {
            setError(
                error.response?.data?.detail ||
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    "Unable to update course."
            );
        }
    };

    const handleDeleteCourse = async (courseId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this course?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setMessage("");

            await API.delete(`courses/${courseId}/`);

            setMessage("Course deleted successfully!");

            await loadDashboard();
        } catch (error) {
            setError(
                error.response?.data?.detail ||
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    "Unable to delete course."
            );
        }
    };

    const totalStudents = courseStats.reduce(
        (total, course) => total + course.students,
        0
    );

    const totalLessons = courseStats.reduce(
        (total, course) => total + course.lessons,
        0
    );

    if (!user) {
        return (
            <main className="instructor-dashboard-page">
                <div className="instructor-dashboard-container">
                    <section className="dashboard-access-card">
                        <div className="dashboard-empty-icon">🔐</div>
                        <h1>Instructor Dashboard</h1>
                        <p>Please login to continue.</p>
                        <Link
                            to="/login"
                            className="dashboard-primary-button"
                        >
                            Login
                        </Link>
                    </section>
                </div>
            </main>
        );
    }

    if (user.user_type !== "instructor") {
        return (
            <main className="instructor-dashboard-page">
                <div className="instructor-dashboard-container">
                    <section className="dashboard-access-card">
                        <div className="dashboard-empty-icon">🚫</div>
                        <h1>Instructor Dashboard</h1>
                        <p>
                            You do not have instructor access.
                        </p>
                        <Link
                            to="/dashboard"
                            className="dashboard-secondary-button"
                        >
                            Go to Dashboard
                        </Link>
                    </section>
                </div>
            </main>
        );
    }

    return (
        <main className="instructor-dashboard-page">
            <div className="instructor-dashboard-container">
                <section className="instructor-dashboard-hero">
                    <div className="dashboard-hero-content">
                        <span className="dashboard-eyebrow">
                            Instructor Workspace
                        </span>

                        <h1>Instructor Dashboard</h1>

                        <p>
                            Welcome, {user.username}! Manage your
                            courses, lessons, quizzes and students
                            from one place.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="dashboard-refresh-button"
                        onClick={loadDashboard}
                    >
                        ↻ Refresh
                    </button>
                </section>

                {error && (
                    <div className="dashboard-alert dashboard-alert-error">
                        <span>!</span>
                        <p>{error}</p>
                    </div>
                )}

                {message && (
                    <div className="dashboard-alert dashboard-alert-success">
                        <span>✓</span>
                        <p>{message}</p>
                    </div>
                )}

                {loading ? (
                    <section className="dashboard-loading">
                        <div className="dashboard-spinner" />
                        <p>Loading dashboard...</p>
                    </section>
                ) : (
                    <>
                        <section className="dashboard-stats-grid">
                            <article className="dashboard-stat-card">
                                <div className="dashboard-stat-icon">📚</div>
                                <div>
                                    <span>Total Courses</span>
                                    <strong>{courses.length}</strong>
                                    <p>Courses created by you</p>
                                </div>
                            </article>

                            <article className="dashboard-stat-card">
                                <div className="dashboard-stat-icon">👥</div>
                                <div>
                                    <span>Total Students</span>
                                    <strong>{totalStudents}</strong>
                                    <p>Students enrolled in your courses</p>
                                </div>
                            </article>

                            <article className="dashboard-stat-card">
                                <div className="dashboard-stat-icon">📖</div>
                                <div>
                                    <span>Total Lessons</span>
                                    <strong>{totalLessons}</strong>
                                    <p>Lessons across your courses</p>
                                </div>
                            </article>

                            <article className="dashboard-stat-card">
                                <div className="dashboard-stat-icon">📊</div>
                                <div>
                                    <span>Active Courses</span>
                                    <strong>{courses.length}</strong>
                                    <p>Courses currently available</p>
                                </div>
                            </article>
                        </section>

                        <section className="dashboard-section">
                            <div className="dashboard-section-heading">
                                <div>
                                    <span className="dashboard-section-eyebrow">
                                        Shortcuts
                                    </span>
                                    <h2>Quick Actions</h2>
                                </div>
                            </div>

                            <div className="dashboard-actions">
                                <button
                                    type="button"
                                    className="dashboard-action-button dashboard-action-primary"
                                    onClick={() =>
                                        setShowCreateForm(
                                            !showCreateForm
                                        )
                                    }
                                >
                                    {showCreateForm
                                        ? "✕ Close Form"
                                        : "＋ Create Course"}
                                </button>

                                <Link
                                    to="/courses"
                                    className="dashboard-action-button"
                                >
                                    📚 View Courses
                                </Link>

                                <Link
                                    to="/profile"
                                    className="dashboard-action-button"
                                >
                                    👤 My Profile
                                </Link>
                            </div>
                        </section>

                        {showCreateForm && (
                            <section className="dashboard-form-card">
                                <div className="dashboard-form-header">
                                    <div>
                                        <span className="dashboard-section-eyebrow">
                                            New Course
                                        </span>
                                        <h2>Create New Course</h2>
                                    </div>
                                </div>

                                <form
                                    className="dashboard-course-form"
                                    onSubmit={handleCreateCourse}
                                >
                                    <div className="dashboard-form-group">
                                        <label htmlFor="create-title">
                                            Course Title
                                        </label>
                                        <input
                                            id="create-title"
                                            type="text"
                                            name="title"
                                            value={newCourse.title}
                                            onChange={handleCreateChange}
                                            placeholder="Example: Python for Beginners"
                                            required
                                        />
                                    </div>

                                    <div className="dashboard-form-group dashboard-form-full">
                                        <label htmlFor="create-description">
                                            Description
                                        </label>
                                        <textarea
                                            id="create-description"
                                            name="description"
                                            value={newCourse.description}
                                            onChange={handleCreateChange}
                                            placeholder="Describe what students will learn..."
                                            rows="5"
                                            required
                                        />
                                    </div>

                                    <div className="dashboard-form-group">
                                        <label htmlFor="create-category">
                                            Category
                                        </label>
                                        <input
                                            id="create-category"
                                            type="text"
                                            name="category"
                                            value={newCourse.category}
                                            onChange={handleCreateChange}
                                            placeholder="Example: Python"
                                            required
                                        />
                                    </div>

                                    <div className="dashboard-form-group">
                                        <label htmlFor="create-level">
                                            Level
                                        </label>
                                        <select
                                            id="create-level"
                                            name="level"
                                            value={newCourse.level}
                                            onChange={handleCreateChange}
                                        >
                                            <option value="Beginner">
                                                Beginner
                                            </option>
                                            <option value="Intermediate">
                                                Intermediate
                                            </option>
                                            <option value="Advanced">
                                                Advanced
                                            </option>
                                        </select>
                                    </div>

                                    <div className="dashboard-form-group">
                                        <label htmlFor="create-price">
                                            Price (₹)
                                        </label>
                                        <input
                                            id="create-price"
                                            type="number"
                                            name="price"
                                            value={newCourse.price}
                                            onChange={handleCreateChange}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    <div className="dashboard-form-actions dashboard-form-full">
                                        <button
                                            type="submit"
                                            className="dashboard-primary-button"
                                        >
                                            Create Course
                                        </button>

                                        <button
                                            type="button"
                                            className="dashboard-secondary-button"
                                            onClick={() =>
                                                setShowCreateForm(false)
                                            }
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </section>
                        )}

                        <section className="dashboard-section">
                            <div className="dashboard-section-heading">
                                <div>
                                    <span className="dashboard-section-eyebrow">
                                        Course Management
                                    </span>
                                    <h2>My Courses</h2>
                                </div>

                                <span className="dashboard-course-count">
                                    {courses.length}{" "}
                                    {courses.length === 1
                                        ? "course"
                                        : "courses"}
                                </span>
                            </div>

                            {courses.length === 0 ? (
                                <div className="dashboard-empty-card">
                                    <div className="dashboard-empty-icon">
                                        📚
                                    </div>
                                    <h3>No courses yet</h3>
                                    <p>
                                        You have not created any courses.
                                        Create your first course to get
                                        started.
                                    </p>
                                    <button
                                        type="button"
                                        className="dashboard-primary-button"
                                        onClick={() =>
                                            setShowCreateForm(true)
                                        }
                                    >
                                        ＋ Create Your First Course
                                    </button>
                                </div>
                            ) : (
                                <div className="instructor-course-list">
                                    {courses.map((course) => {
                                        const stats = courseStats.find(
                                            (item) =>
                                                item.courseId === course.id
                                        );

                                        return (
                                            <article
                                                key={course.id}
                                                className="instructor-course-card"
                                            >
                                                {editingCourseId ===
                                                course.id ? (
                                                    <form
                                                        className="dashboard-edit-form"
                                                        onSubmit={
                                                            handleUpdateCourse
                                                        }
                                                    >
                                                        <div className="dashboard-edit-header">
                                                            <div>
                                                                <span className="dashboard-section-eyebrow">
                                                                    Editing
                                                                </span>
                                                                <h3>
                                                                    {course.title}
                                                                </h3>
                                                            </div>
                                                        </div>

                                                        <div className="dashboard-form-group">
                                                            <label
                                                                htmlFor={`edit-title-${course.id}`}
                                                            >
                                                                Course Title
                                                            </label>
                                                            <input
                                                                id={`edit-title-${course.id}`}
                                                                type="text"
                                                                name="title"
                                                                value={
                                                                    editCourse.title
                                                                }
                                                                onChange={
                                                                    handleEditChange
                                                                }
                                                                required
                                                            />
                                                        </div>

                                                        <div className="dashboard-form-group">
                                                            <label
                                                                htmlFor={`edit-description-${course.id}`}
                                                            >
                                                                Description
                                                            </label>
                                                            <textarea
                                                                id={`edit-description-${course.id}`}
                                                                name="description"
                                                                value={
                                                                    editCourse.description
                                                                }
                                                                onChange={
                                                                    handleEditChange
                                                                }
                                                                rows="5"
                                                                required
                                                            />
                                                        </div>

                                                        <div className="dashboard-form-grid">
                                                            <div className="dashboard-form-group">
                                                                <label
                                                                    htmlFor={`edit-category-${course.id}`}
                                                                >
                                                                    Category
                                                                </label>
                                                                <input
                                                                    id={`edit-category-${course.id}`}
                                                                    type="text"
                                                                    name="category"
                                                                    value={
                                                                        editCourse.category
                                                                    }
                                                                    onChange={
                                                                        handleEditChange
                                                                    }
                                                                    required
                                                                />
                                                            </div>

                                                            <div className="dashboard-form-group">
                                                                <label
                                                                    htmlFor={`edit-level-${course.id}`}
                                                                >
                                                                    Level
                                                                </label>
                                                                <select
                                                                    id={`edit-level-${course.id}`}
                                                                    name="level"
                                                                    value={
                                                                        editCourse.level
                                                                    }
                                                                    onChange={
                                                                        handleEditChange
                                                                    }
                                                                >
                                                                    <option value="Beginner">
                                                                        Beginner
                                                                    </option>
                                                                    <option value="Intermediate">
                                                                        Intermediate
                                                                    </option>
                                                                    <option value="Advanced">
                                                                        Advanced
                                                                    </option>
                                                                </select>
                                                            </div>

                                                            <div className="dashboard-form-group">
                                                                <label
                                                                    htmlFor={`edit-price-${course.id}`}
                                                                >
                                                                    Price (₹)
                                                                </label>
                                                                <input
                                                                    id={`edit-price-${course.id}`}
                                                                    type="number"
                                                                    name="price"
                                                                    value={
                                                                        editCourse.price
                                                                    }
                                                                    onChange={
                                                                        handleEditChange
                                                                    }
                                                                    min="0"
                                                                    step="0.01"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="dashboard-form-actions">
                                                            <button
                                                                type="submit"
                                                                className="dashboard-primary-button"
                                                            >
                                                                Save Changes
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="dashboard-secondary-button"
                                                                onClick={() =>
                                                                    setEditingCourseId(
                                                                        null
                                                                    )
                                                                }
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <>
                                                        <div className="instructor-course-header">
                                                            <div>
                                                                <span className="course-category-badge">
                                                                    {course.category}
                                                                </span>
                                                                <h3>
                                                                    {course.title}
                                                                </h3>
                                                                <p>
                                                                    {
                                                                        course.description
                                                                    }
                                                                </p>
                                                            </div>

                                                            <div className="course-price">
                                                                ₹
                                                                {Number(
                                                                    course.price
                                                                ).toLocaleString(
                                                                    "en-IN"
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="instructor-course-meta">
                                                            <span>
                                                                <strong>
                                                                    Level
                                                                </strong>
                                                                {
                                                                    course.level
                                                                }
                                                            </span>

                                                            <span>
                                                                <strong>
                                                                    Lessons
                                                                </strong>
                                                                {stats?.lessons ||
                                                                    0}
                                                            </span>

                                                            <span>
                                                                <strong>
                                                                    Students
                                                                </strong>
                                                                {stats?.students ||
                                                                    0}
                                                            </span>
                                                        </div>

                                                        <div className="instructor-course-actions">
                                                            <Link
                                                                to={`/courses/${course.id}`}
                                                                className="course-action-button"
                                                            >
                                                                👁️ View
                                                            </Link>

                                                            <Link
                                                                to={`/instructor/courses/${course.id}/lessons`}
                                                                className="course-action-button"
                                                            >
                                                                📖 Manage
                                                                Lessons
                                                            </Link>

                                                            <Link
                                                                to={`/instructor/courses/${course.id}/quizzes`}
                                                                className="course-action-button"
                                                            >
                                                                📝 Manage
                                                                Quizzes
                                                            </Link>

                                                            <button
                                                                type="button"
                                                                className="course-action-button"
                                                                onClick={() =>
                                                                    startEditing(
                                                                        course
                                                                    )
                                                                }
                                                            >
                                                                ✏️ Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="course-action-button course-action-danger"
                                                                onClick={() =>
                                                                    handleDeleteCourse(
                                                                        course.id
                                                                    )
                                                                }
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <section className="dashboard-profile-card">
                            <div className="dashboard-profile-icon">👤</div>

                            <div className="dashboard-profile-content">
                                <span className="dashboard-section-eyebrow">
                                    Account
                                </span>
                                <h2>Instructor Profile</h2>

                                <div className="dashboard-profile-details">
                                    <p>
                                        <strong>Username</strong>
                                        <span>{user.username}</span>
                                    </p>

                                    <p>
                                        <strong>Email</strong>
                                        <span>{user.email}</span>
                                    </p>

                                    <p>
                                        <strong>Role</strong>
                                        <span>{user.user_type}</span>
                                    </p>
                                </div>

                                <Link
                                    to="/profile"
                                    className="dashboard-secondary-button"
                                >
                                    View Profile
                                </Link>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}

export default InstructorDashboard;
