import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import "../styles/Register.css";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userType, setUserType] = useState("student");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await API.post("register/", {
                username: username,
                email: email,
                password: password,
                user_type: userType
            });

            setMessage(response.data.message);

            setUsername("");
            setEmail("");
            setPassword("");
            setUserType("student");

        } catch (error) {
            console.log(error.response?.data);

            const errorData = error.response?.data;

            if (typeof errorData === "object") {
                setError(
                    Object.values(errorData)
                        .flat()
                        .join(" ")
                );
            } else {
                setError("Registration failed. Please try again.");
            }
        }
    };

    return (
        <main className="register-page">
            <section className="register-card">

                <div className="register-header">
                    <div className="register-logo">L</div>

                    <h1>Create your account</h1>

                    <p>
                        Join Learnova and start your learning journey.
                    </p>
                </div>

                <form
                    className="register-form"
                    onSubmit={handleRegister}
                >

                    {message && (
                        <div className="register-success">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="register-error">
                            {error}
                        </div>
                    )}

                    <div className="register-field">
                        <label htmlFor="register-username">
                            Username
                        </label>

                        <input
                            id="register-username"
                            type="text"
                            placeholder="Choose a username"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="register-field">
                        <label htmlFor="register-email">
                            Email
                        </label>

                        <input
                            id="register-email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="register-field">
                        <label htmlFor="register-password">
                            Password
                        </label>

                        <input
                            id="register-password"
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="register-field">
                        <label htmlFor="register-user-type">
                            Account Type
                        </label>

                        <select
                            id="register-user-type"
                            value={userType}
                            onChange={(e) =>
                                setUserType(e.target.value)
                            }
                        >
                            <option value="student">
                                Student
                            </option>

                            <option value="instructor">
                                Instructor
                            </option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="register-button"
                    >
                        Create Account
                    </button>

                </form>

                <div className="register-footer">
                    <p>
                        Already have an account?{" "}
                        <Link to="/login">
                            Login
                        </Link>
                    </p>
                </div>

            </section>
        </main>
    );
}

export default Register;
