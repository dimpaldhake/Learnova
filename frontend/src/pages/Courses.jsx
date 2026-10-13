
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import API from "../services/api";

import "../styles/Courses.css";

function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedLevel, setSelectedLevel] = useState("All");

    // Load courses from the Django API.
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await API.get("courses/");

                const data = Array.isArray(response.data)
                    ? response.data
                    : response.data.results || [];

                setCourses(data);
            } catch (err) {
                console.error(
                    "Unable to load courses:",
                    err.response?.data || err.message
                );

                setError(
                    "Unable to load courses. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // Get categories available in the course data.
    const categories = useMemo(() => {
        const uniqueCategories = [
            ...new Set(
                courses
                    .map((course) => course.category)
                    .filter(Boolean)
            ),
        ];

        return ["All", ...uniqueCategories.sort()];
    }, [courses]);

    // Filter courses by search, category, and difficulty.
    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            const searchText = search.trim().toLowerCase();

            const matchesSearch =
                !searchText ||
                course.title?.toLowerCase().includes(searchText) ||
                course.description?.toLowerCase().includes(searchText) ||
                course.category?.toLowerCase().includes(searchText) ||
                course.instructor_username
                    ?.toLowerCase()
                    .includes(searchText);

            const matchesCategory =
                selectedCategory === "All" ||
                course.category === selectedCategory;

            const matchesLevel =
                selectedLevel === "All" ||
                course.level?.toLowerCase() ===
                    selectedLevel.toLowerCase();

            return (
                matchesSearch &&
                matchesCategory &&
                matchesLevel
            );
        });
    }, [courses, search, selectedCategory, selectedLevel]);

    const formatLevel = (level) => {
        if (!level) {
            return "Not specified";
        }

        return level.charAt(0).toUpperCase() + level.slice(1);
    };

    const formatPrice = (price) => {
        return Number(price || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        });
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedCategory("All");
        setSelectedLevel("All");
    };

    return (
        <main className="courses-page">
            <section className="courses-header">
                <span className="courses-eyebrow">
                    LEARNOVA LEARNING
                </span>

                <h1>Explore Our Courses</h1>

                <p>
                    Discover new skills, learn at your own pace,
                    and take the next step in your learning journey.
                </p>
            </section>

            <section className="courses-container">
                {/* Search and filters */}
                <div className="courses-filter-panel">
                    <div className="courses-search">
                        <label htmlFor="course-search">
                            Search courses
                        </label>

                        <input
                            id="course-search"
                            type="search"
                            placeholder="Search by title, topic, or instructor..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />
                    </div>

                    <div className="courses-filter">
                        <label htmlFor="course-category">
                            Category
                        </label>

                        <select
                            id="course-category"
                            value={selectedCategory}
                            onChange={(event) =>
                                setSelectedCategory(event.target.value)
                            }
                        >
                            {categories.map((category) => (
                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="courses-filter">
                        <label htmlFor="course-level">
                            Difficulty
                        </label>

                        <select
                            id="course-level"
                            value={selectedLevel}
                            onChange={(event) =>
                                setSelectedLevel(event.target.value)
                            }
                        >
                            <option value="All">All Levels</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">
                                Intermediate
                            </option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        className="courses-clear-button"
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>
                </div>

                <div className="courses-results-heading">
                    <h2>Available Courses</h2>

                    <span>
                        {filteredCourses.length}{" "}
                        {filteredCourses.length === 1
                            ? "course"
                            : "courses"}
                    </span>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="courses-status">
                        Loading courses...
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="courses-error">
                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty API result */}
                {!loading && !error && courses.length === 0 && (
                    <div className="courses-empty">
                        <h3>No courses available yet</h3>

                        <p>
                            Please check again later for new courses.
                        </p>
                    </div>
                )}

                {/* No filter matches */}
                {!loading &&
                    !error &&
                    courses.length > 0 &&
                    filteredCourses.length === 0 && (
                        <div className="courses-empty">
                            <h3>No matching courses found</h3>

                            <p>
                                Try another search term or change
                                your filters.
                            </p>

                            <button
                                type="button"
                                className="courses-clear-button"
                                onClick={clearFilters}
                            >
                                Show All Courses
                            </button>
                        </div>
                    )}

                {/* Course cards */}
                {!loading &&
                    !error &&
                    filteredCourses.length > 0 && (
                        <div className="courses-grid">
                            {filteredCourses.map((course) => (
                                <article
                                    className="course-card"
                                    key={course.id}
                                >
                                    <div className="course-card-top">
                                        <span className="course-card-category">
                                            {course.category || "General"}
                                        </span>

                                        <span className="course-card-level">
                                            {formatLevel(course.level)}
                                        </span>
                                    </div>

                                    <div className="course-card-content">
                                        <h3>{course.title}</h3>

                                        <p className="course-card-description">
                                            {course.description ||
                                                "Explore this course and start learning new skills."}
                                        </p>

                                        <div className="course-card-instructor">
                                            <span className="course-instructor-dot">
                                                {(
                                                    course.instructor_username ||
                                                    "L"
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>

                                            <span>
                                                {course.instructor_username ||
                                                    "Learnova Instructor"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="course-card-footer">
                                        <strong className="course-card-price">
                                            {formatPrice(course.price)}
                                        </strong>

                                        <Link
                                            to={`/courses/${course.id}`}
                                            className="course-card-button"
                                        >
                                            View Details →
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
            </section>
        </main>
    );
}

export default Courses;