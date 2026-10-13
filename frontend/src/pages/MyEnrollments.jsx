import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import API from "../services/api";
import "../styles/MyEnrollments.css";

function MyEnrollments() {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const getEnrollments = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await API.get("enrollments/");

                // Support both a direct array and paginated responses.
                const data = response.data;

                if (Array.isArray(data)) {
                    setEnrollments(data);
                } else if (Array.isArray(data.results)) {
                    setEnrollments(data.results);
                } else {
                    setEnrollments([]);
                    setError(
                        "The enrollment data returned by the server has an unexpected format."
                    );
                }
            } catch (error) {
                console.error(
                    "Unable to load enrollments:",
                    error.response?.data || error.message
                );

                if (error.response?.status === 401) {
                    setError("Please log in to view your enrollments.");
                } else {
                    setError("Unable to load your enrollments. Please try again.");
                }
            } finally {
                setLoading(false);
            }
        };

        getEnrollments();
    }, []);

    const activeCount = enrollments.filter(
        (item) => item.status === "active"
    ).length;

    const completedCount = enrollments.filter(
        (item) => item.status === "completed"
    ).length;

    const formatStatus = (status) => {
        if (!status) {
            return "Unknown";
        }

        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const formatDate = (date) => {
        if (!date) {
            return "Not available";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not available";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <main className="my-enrollments-page">
            <div className="my-enrollments-container">
                <header className="enrollments-header">
                    <span className="enrollments-eyebrow">
                        My Learning
                    </span>

                    <h1>My Enrollments</h1>

                    <p>
                        Continue your learning journey and keep building
                        your skills.
                    </p>
                </header>

                {/*
                    Show enrollment statistics after loading.
                */}
                <section className="enrollment-stats">
                    <div className="enrollment-stat">
                        <span className="enrollment-stat-value">
                            {enrollments.length}
                        </span>

                        <span className="enrollment-stat-label">
                            Total Courses
                        </span>
                    </div>

                    <div className="enrollment-stat">
                        <span className="enrollment-stat-value">
                            {activeCount}
                        </span>

                        <span className="enrollment-stat-label">
                            Active Courses
                        </span>
                    </div>

                    <div className="enrollment-stat">
                        <span className="enrollment-stat-value">
                            {completedCount}
                        </span>

                        <span className="enrollment-stat-label">
                            Completed
                        </span>
                    </div>
                </section>

                {loading && (
                    <div className="enrollments-loading">
                        Loading your enrollments...
                    </div>
                )}

                {!loading && error && (
                    <div className="enrollments-error">
                        {error}
                    </div>
                )}

                {!loading && !error && enrollments.length === 0 && (
                    <section className="enrollments-empty">
                        <div className="enrollments-empty-icon">
                            ◫
                        </div>

                        <h2>Your learning journey starts here</h2>

                        <p>
                            You haven't enrolled in any courses yet.
                            Explore Learnova and find a course that
                            matches your goals.
                        </p>

                        <Link
                            to="/courses"
                            className="enrollments-explore-button"
                        >
                            Explore Courses →
                        </Link>
                    </section>
                )}

                {!loading && !error && enrollments.length > 0 && (
                    <section className="enrollment-grid">
                        {enrollments.map((enrollment) => (
                            <article
                                className="enrollment-card"
                                key={enrollment.id}
                            >
                                <div className="enrollment-card-top">
                                    <div className="enrollment-course-icon">
                                        {enrollment.course_title
                                            ?.charAt(0)
                                            .toUpperCase() || "C"}
                                    </div>

                                    <span
                                        className={`enrollment-status ${
                                            enrollment.status || ""
                                        }`}
                                    >
                                        {formatStatus(enrollment.status)}
                                    </span>
                                </div>

                                <div className="enrollment-card-body">
                                    <h2 className="enrollment-card-title">
                                        {enrollment.course_title ||
                                            `Course ${enrollment.course}`}
                                    </h2>

                                    <div className="enrollment-info">
                                        <div className="enrollment-info-row">
                                            <span className="enrollment-info-label">
                                                Enrolled On
                                            </span>

                                            <span className="enrollment-info-value">
                                                {formatDate(
                                                    enrollment.enrolled_at
                                                )}
                                            </span>
                                        </div>

                                        <div className="enrollment-info-row">
                                            <span className="enrollment-info-label">
                                                Status
                                            </span>

                                            <span className="enrollment-info-value">
                                                {formatStatus(
                                                    enrollment.status
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="enrollment-actions">
                                        <Link
                                            to={`/courses/${enrollment.course}`}
                                            className="enrollment-button secondary"
                                        >
                                            View Course
                                        </Link>

                                        {enrollment.status === "active" && (
                                            <Link
                                                to={`/courses/${enrollment.course}/lessons`}
                                                className="enrollment-button primary"
                                            >
                                                Continue Learning →
                                            </Link>
                                        )}

                                        {enrollment.status === "completed" && (
                                            <Link
                                                to={`/courses/${enrollment.course}`}
                                                className="enrollment-button primary"
                                            >
                                                Review Course →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </div>
        </main>
    );
}

export default MyEnrollments;