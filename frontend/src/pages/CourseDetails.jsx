import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import API from "../services/api";
import AuthContext from "../context/AuthContext";

import "../styles/CourseDetails.css";

function CourseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [course, setCourse] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [enrolled, setEnrolled] = useState(false);

    // Get course details.
    // Course details should be available to logged-out visitors too.
    useEffect(() => {
        const getCourse = async () => {
            try {
                setError("");

                const response = await API.get(`courses/${id}/`);

                setCourse(response.data);
            } catch (error) {
                console.error(
                    "Unable to load course:",
                    error.response?.data || error.message
                );

                setError("Unable to load course.");
            }
        };

        getCourse();
    }, [id]);

    // Check enrollment only for logged-in students.
    useEffect(() => {
        let cancelled = false;

        const checkEnrollment = async () => {
            setEnrolled(false);

            if (!user || user.user_type !== "student") {
                return;
            }

            try {
                const response = await API.get("enrollments/");

                const enrollments = Array.isArray(response.data)
                    ? response.data
                    : response.data.results || [];

                const alreadyEnrolled = enrollments.some(
                    (enrollment) =>
                        Number(enrollment.course) === Number(id)
                );

                if (!cancelled) {
                    setEnrolled(alreadyEnrolled);
                }
            } catch (error) {
                console.error(
                    "Unable to check enrollment:",
                    error.response?.data || error.message
                );
            }
        };

        checkEnrollment();

        return () => {
            cancelled = true;
        };
    }, [id, user]);

    // Handle the Enroll Now button.
    const handleEnroll = async () => {
        setError("");
        setMessage("");

        // Logged-out visitors must log in before enrolling.
        if (!user) {
            navigate("/login");
            return;
        }

        // Only students can enroll.
        if (user.user_type !== "student") {
            setError("Only students can enroll in courses.");
            return;
        }

        // Prevent duplicate enrollment requests.
        if (enrolled) {
            return;
        }

        try {
            const response = await API.post("enrollments/", {
                course: Number(id),
            });

            console.log("Enrollment response:", response.data);

            setMessage(
                "You are successfully enrolled in this course."
            );

            setEnrolled(true);
        } catch (error) {
            console.error(
                "Unable to enroll:",
                error.response?.data || error.message
            );

            const errorData = error.response?.data;

            const errorMessage =
                errorData?.message ||
                errorData?.detail ||
                errorData?.error ||
                "Unable to enroll in this course.";

            // If the API says the visitor is not authenticated,
            // send them to the login page.
            if (error.response?.status === 401) {
                navigate("/login");
                return;
            }

            setError(
                typeof errorMessage === "string"
                    ? errorMessage
                    : "Unable to enroll in this course."
            );
        }
    };

    // Loading and error states.
    if (error && !course) {
        return (
            <div className="course-details-page">
                <div className="course-details-error">
                    {error}
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="course-details-page">
                <div className="course-details-loading">
                    Loading course...
                </div>
            </div>
        );
    }

    const isInstructor =
        user?.user_type === "instructor";

    const isCourseOwner =
        isInstructor &&
        course.instructor_username === user?.username;

    const isStudent =
        user?.user_type === "student";

    const isLoggedOut =
        !user;

    const formatLevel = (value) => {
        if (!value) {
            return "";
        }

        return (
            value.charAt(0).toUpperCase() +
            value.slice(1)
        );
    };

    const formatPrice = (price) => {
        return Number(price).toLocaleString(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 0,
            }
        );
    };

    const instructorName =
        course.instructor_username ||
        "Learnova Instructor";

    return (
        <main className="course-details-page">
            <div className="course-details-container">

                {/* Hero */}

                <section className="course-details-hero">
                    <span className="course-details-eyebrow">
                        Learnova Course
                    </span>

                    <h1>
                        {course.title}
                    </h1>

                    <p className="course-details-description">
                        {course.description}
                    </p>

                    <div className="course-details-badges">
                        {course.category && (
                            <span className="course-details-badge">
                                {course.category}
                            </span>
                        )}

                        {course.level && (
                            <span className="course-details-badge">
                                {formatLevel(course.level)}
                            </span>
                        )}
                    </div>
                </section>

                {/* Main Content */}

                <div className="course-details-layout">
                    <section className="course-details-content">
                        <h2>
                            About this course
                        </h2>

                        <p>
                            {course.description}
                        </p>

                        <div className="course-instructor">
                            <div className="course-instructor-avatar">
                                {instructorName
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <div className="course-instructor-label">
                                    Instructor
                                </div>

                                <p className="course-instructor-name">
                                    {instructorName}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Action Card */}

                    <aside className="course-action-card">
                        <div className="course-action-label">
                            Course price
                        </div>

                        <div className="course-action-price">
                            {formatPrice(course.price)}
                        </div>

                        {/* Messages */}

                        {message && (
                            <div className="course-success-message">
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="course-error-message">
                                {error}
                            </div>
                        )}

                        {/* Logged-out Visitor */}

                        {isLoggedOut && (
                            <>
                                <button
                                    type="button"
                                    className="course-primary-button"
                                    onClick={handleEnroll}
                                >
                                    Enroll Now
                                </button>

                                <p>
                                    Please log in to enroll in this course.
                                </p>
                            </>
                        )}

                        {/* Student Actions */}

                        {isStudent && (
                            <>
                                {enrolled ? (
                                    <>
                                        <button
                                            type="button"
                                            className="course-primary-button"
                                            disabled
                                        >
                                            ✓ Already Enrolled
                                        </button>

                                        <Link
                                            to={`/courses/${id}/lessons`}
                                            className="course-secondary-button"
                                        >
                                            Continue to Lessons →
                                        </Link>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        className="course-primary-button"
                                        onClick={handleEnroll}
                                    >
                                        Enroll Now
                                    </button>
                                )}
                            </>
                        )}

                        {/* Course Owner */}

                        {isCourseOwner && (
                            <div className="course-management-section">
                                <div className="course-management-title">
                                    Course Management
                                </div>

                                <Link
                                    to={`/instructor/courses/${id}/lessons`}
                                    className="course-management-button"
                                >
                                    Manage Lessons
                                </Link>

                                <Link
                                    to={`/instructor/courses/${id}/quizzes`}
                                    className="course-management-button"
                                >
                                    Manage Quizzes
                                </Link>
                            </div>
                        )}

                        {/* Other Instructor */}

                        {isInstructor && !isCourseOwner && (
                            <Link
                                to={`/courses/${id}/lessons`}
                                className="course-secondary-button"
                            >
                                View Lessons →
                            </Link>
                        )}
                    </aside>
                </div>
            </div>
        </main>
    );
}

export default CourseDetails;