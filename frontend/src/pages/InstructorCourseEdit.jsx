import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import API from "../services/api";
import "../styles/InstructorCourseEdit.css";

function InstructorCourseEdit() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        level: "beginner",
        price: ""
    });

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCourse = async () => {
            try {
                const response = await API.get(
                    `courses/${id}/`
                );

                setFormData({
                    title: response.data.title,
                    description: response.data.description,
                    category: response.data.category,
                    level: response.data.level,
                    price: response.data.price
                });
            } catch (error) {
                console.log(error.response?.data);
                setError("Unable to load course.");
            } finally {
                setLoading(false);
            }
        };

        loadCourse();
    }, [id]);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");

        try {
            await API.put(
                `courses/${id}/`,
                {
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    level: formData.level,
                    price: formData.price
                }
            );

            setMessage(
                "Course updated successfully!"
            );
        } catch (error) {
            console.log(error.response?.data);

            setError(
                error.response?.data?.message ||
                JSON.stringify(error.response?.data)
            );
        }
    };

    if (loading) {
        return (
            <main className="edit-course-page">
                <div className="edit-course-loading">
                    <div className="edit-loading-spinner"></div>
                    <p>Loading course...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="edit-course-page">
            <div className="edit-course-container">

                <header className="edit-course-header">
                    <span className="edit-course-eyebrow">
                        Course Management
                    </span>

                    <h1>Edit Course</h1>

                    <p>
                        Update your course information and keep
                        your learning content up to date.
                    </p>
                </header>

                {message && (
                    <div className="edit-course-success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="edit-course-error">
                        {error}
                    </div>
                )}

                <section className="edit-course-card">

                    <form
                        className="edit-course-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="edit-form-group">
                            <label htmlFor="edit-title">
                                Course Title
                            </label>

                            <input
                                id="edit-title"
                                type="text"
                                name="title"
                                placeholder="Course title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="edit-form-group">
                            <label htmlFor="edit-description">
                                Description
                            </label>

                            <textarea
                                id="edit-description"
                                name="description"
                                placeholder="Course description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="6"
                                required
                            />
                        </div>

                        <div className="edit-form-row">

                            <div className="edit-form-group">
                                <label htmlFor="edit-category">
                                    Category
                                </label>

                                <input
                                    id="edit-category"
                                    type="text"
                                    name="category"
                                    placeholder="Category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="edit-form-group">
                                <label htmlFor="edit-level">
                                    Level
                                </label>

                                <select
                                    id="edit-level"
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

                            <div className="edit-form-group">
                                <label htmlFor="edit-price">
                                    Price
                                </label>

                                <input
                                    id="edit-price"
                                    type="number"
                                    name="price"
                                    placeholder="Price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                        </div>

                        <div className="edit-course-actions">

                            <button
                                type="button"
                                className="edit-back-button"
                                onClick={() =>
                                    navigate("/instructor/courses")
                                }
                            >
                                ← Back to Courses
                            </button>

                            <button
                                type="submit"
                                className="edit-save-button"
                            >
                                Save Changes
                            </button>

                        </div>

                    </form>

                </section>

            </div>
        </main>
    );
}

export default InstructorCourseEdit;