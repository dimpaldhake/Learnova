import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AuthContext from "../context/AuthContext";
import API from "../services/api";
import "../styles/Dashboard.css";

function Dashboard() {
    const { user } = useContext(AuthContext);

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const getDashboardData = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await API.get(
                    "student-dashboard/"
                );

                setDashboardData(response.data);
            } catch (error) {
                console.log(error.response?.data);

                setError(
                    "Unable to load dashboard."
                );
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            getDashboardData();
        } else {
            setLoading(false);
        }
    }, [user]);

    if (!user) {
        return (
            <main className="dashboard-page">
                <div className="dashboard-container">
                    <section className="dashboard-login-card">
                        <div className="dashboard-empty-icon">
                            🔐
                        </div>

                        <h1>
                            Student Dashboard
                        </h1>

                        <p>
                            Please login to continue to
                            your learning dashboard.
                        </p>

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

    if (loading) {
        return (
            <main className="dashboard-page">
                <div className="dashboard-container">
                    <section className="dashboard-loading">
                        <div className="dashboard-spinner" />

                        <h2>
                            Loading dashboard...
                        </h2>

                        <p>
                            Preparing your learning
                            overview.
                        </p>
                    </section>
                </div>
            </main>
        );
    }

    if (!dashboardData) {
        return (
            <main className="dashboard-page">
                <div className="dashboard-container">
                    <section className="dashboard-error-card">
                        <div className="dashboard-empty-icon">
                            ⚠️
                        </div>

                        <h2>
                            Unable to load dashboard
                        </h2>

                        <p>
                            {error ||
                                "Something went wrong while loading your dashboard."}
                        </p>
                    </section>
                </div>
            </main>
        );
    }

    const enrolledCourses =
        dashboardData.enrolled_courses || [];

    const quizAttempts =
        dashboardData.quiz_attempts || [];

    const lessonProgress =
        dashboardData.lesson_progress || [];

    const enrollmentCount =
        enrolledCourses.length;

    const completedLessonCount =
        lessonProgress.filter(
            (lesson) =>
                lesson.completed === true
        ).length;

    const quizAttemptCount =
        quizAttempts.length;

    let overallProgress = 0;

    if (enrolledCourses.length > 0) {
        const totalProgress =
            enrolledCourses.reduce(
                (total, course) =>
                    total + Number(course.progress || 0),
                0
            );

        overallProgress =
            Math.round(
                totalProgress /
                    enrolledCourses.length
            );
    }

    return (
        <main className="dashboard-page">
            <div className="dashboard-container">

                {/* ================================
                    HERO
                ================================= */}

                <section className="dashboard-hero">

                    <div className="dashboard-hero-content">
                        <span className="dashboard-eyebrow">
                            Student Dashboard
                        </span>

                        <h1>
                            Welcome back,{" "}
                            {user.username}! 👋
                        </h1>

                        <p>
                            Track your courses, lessons,
                            quiz attempts, and overall
                            learning progress from one
                            place.
                        </p>
                    </div>

                    <div className="dashboard-hero-icon">
                        🎓
                    </div>

                </section>

                {/* ================================
                    ERROR
                ================================= */}

                {error && (
                    <div className="dashboard-error">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                {/* ================================
                    OVERALL PROGRESS
                ================================= */}

                <section className="dashboard-progress-card">

                    <div className="dashboard-progress-header">

                        <div>
                            <span className="dashboard-section-label">
                                Learning Overview
                            </span>

                            <h2>
                                Overall Learning Progress
                            </h2>

                            <p>
                                Your average progress across
                                all enrolled courses.
                            </p>
                        </div>

                        <div className="dashboard-progress-value">
                            {overallProgress}%
                        </div>

                    </div>

                    <div className="dashboard-progress-track">
                        <div
                            className="dashboard-progress-fill"
                            style={{
                                width: `${overallProgress}%`
                            }}
                        />
                    </div>

                    <div className="dashboard-progress-footer">

                        <span>
                            {overallProgress === 100
                                ? "🎉 You have completed all your courses!"
                                : "Keep learning to improve your progress!"}
                        </span>

                        <strong>
                            {overallProgress}% completed
                        </strong>

                    </div>

                </section>

                {/* ================================
                    STATISTICS
                ================================= */}

                <section className="dashboard-stats">

                    <article className="dashboard-stat-card">
                        <div className="dashboard-stat-icon courses">
                            📚
                        </div>

                        <div>
                            <span>
                                Enrolled Courses
                            </span>

                            <strong>
                                {enrollmentCount}
                            </strong>

                            <p>
                                Courses you are learning
                            </p>
                        </div>
                    </article>

                    <article className="dashboard-stat-card">
                        <div className="dashboard-stat-icon lessons">
                            ✅
                        </div>

                        <div>
                            <span>
                                Completed Lessons
                            </span>

                            <strong>
                                {completedLessonCount}
                            </strong>

                            <p>
                                Lessons completed
                            </p>
                        </div>
                    </article>

                    <article className="dashboard-stat-card">
                        <div className="dashboard-stat-icon quizzes">
                            📝
                        </div>

                        <div>
                            <span>
                                Quiz Attempts
                            </span>

                            <strong>
                                {quizAttemptCount}
                            </strong>

                            <p>
                                Quizzes attempted
                            </p>
                        </div>
                    </article>

                </section>

                {/* ================================
                    QUICK ACTIONS
                ================================= */}

                <section className="dashboard-section">

                    <div className="dashboard-section-heading">
                        <div>
                            <span className="dashboard-section-label">
                                Shortcuts
                            </span>

                            <h2>
                                Quick Actions
                            </h2>
                        </div>
                    </div>

                    <div className="dashboard-actions">

                        <Link
                            to="/courses"
                            className="dashboard-action-card"
                        >
                            <span className="dashboard-action-icon">
                                📚
                            </span>

                            <div>
                                <strong>
                                    Browse Courses
                                </strong>

                                <p>
                                    Explore available courses
                                    and continue learning.
                                </p>
                            </div>

                            <span className="dashboard-action-arrow">
                                →
                            </span>
                        </Link>

                        <Link
                            to="/quiz-attempts"
                            className="dashboard-action-card"
                        >
                            <span className="dashboard-action-icon">
                                📝
                            </span>

                            <div>
                                <strong>
                                    Quiz History
                                </strong>

                                <p>
                                    Review your previous quiz
                                    attempts and scores.
                                </p>
                            </div>

                            <span className="dashboard-action-arrow">
                                →
                            </span>
                        </Link>

                        <Link
                            to="/profile"
                            className="dashboard-action-card"
                        >
                            <span className="dashboard-action-icon">
                                👤
                            </span>

                            <div>
                                <strong>
                                    View Profile
                                </strong>

                                <p>
                                    View and manage your
                                    Learnova profile.
                                </p>
                            </div>

                            <span className="dashboard-action-arrow">
                                →
                            </span>
                        </Link>

                    </div>

                </section>

                {/* ================================
                    COURSE PROGRESS
                ================================= */}

                <section className="dashboard-section">

                    <div className="dashboard-section-heading">
                        <div>
                            <span className="dashboard-section-label">
                                Your Learning
                            </span>

                            <h2>
                                Course Progress
                            </h2>
                        </div>

                        <Link
                            to="/courses"
                            className="dashboard-view-link"
                        >
                            View Courses →
                        </Link>
                    </div>

                    {enrolledCourses.length === 0 ? (
                        <div className="dashboard-empty-card">

                            <div className="dashboard-empty-icon">
                                📚
                            </div>

                            <h3>
                                No Enrolled Courses
                            </h3>

                            <p>
                                Start your learning journey
                                by enrolling in a course.
                            </p>

                            <Link
                                to="/courses"
                                className="dashboard-primary-button"
                            >
                                Browse Courses
                            </Link>

                        </div>
                    ) : (
                        <div className="dashboard-course-list">

                            {enrolledCourses.map(
                                (course) => (
                                    <article
                                        key={course.id}
                                        className="dashboard-course-card"
                                    >

                                        <div className="dashboard-course-top">

                                            <div className="dashboard-course-icon">
                                                📘
                                            </div>

                                            <div className="dashboard-course-info">
                                                <h3>
                                                    {course.title}
                                                </h3>

                                                <span>
                                                    Course Progress
                                                </span>
                                            </div>

                                            <strong className="dashboard-course-percentage">
                                                {course.progress}%
                                            </strong>

                                        </div>

                                        <div className="dashboard-course-progress-track">
                                            <div
                                                className="dashboard-course-progress-fill"
                                                style={{
                                                    width: `${course.progress}%`
                                                }}
                                            />
                                        </div>

                                        <div className="dashboard-course-footer">

                                            <span>
                                                Lessons:{" "}
                                                <strong>
                                                    {
                                                        course.completed_lessons
                                                    }
                                                </strong>{" "}
                                                /{" "}
                                                {
                                                    course.total_lessons
                                                }
                                            </span>

                                            <span>
                                                {course.progress ===
                                                100
                                                    ? "🎉 Course Completed!"
                                                    : "Keep learning!"}
                                            </span>

                                        </div>

                                        <Link
                                            to={`/courses/${course.id}/lessons`}
                                            className="dashboard-continue-button"
                                        >
                                            Continue Learning →
                                        </Link>

                                    </article>
                                )
                            )}

                        </div>
                    )}

                </section>

                {/* ================================
                    PROFILE
                ================================= */}

                <section className="dashboard-profile-card">

                    <div className="dashboard-profile-icon">
                        👤
                    </div>

                    <div className="dashboard-profile-content">

                        <span className="dashboard-section-label">
                            Account
                        </span>

                        <h2>
                            Your Profile
                        </h2>

                        <div className="dashboard-profile-details">

                            <div>
                                <span>
                                    Username
                                </span>

                                <strong>
                                    {
                                        dashboardData
                                            .student
                                            ?.username ||
                                        user.username
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Email
                                </span>

                                <strong>
                                    {
                                        dashboardData
                                            .student
                                            ?.email ||
                                        user.email
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Role
                                </span>

                                <strong>
                                    {user.user_type ||
                                        "Student"}
                                </strong>
                            </div>

                        </div>

                    </div>

                    <Link
                        to="/profile"
                        className="dashboard-profile-button"
                    >
                        View Profile →
                    </Link>

                </section>

            </div>
        </main>
    );
}

export default Dashboard;