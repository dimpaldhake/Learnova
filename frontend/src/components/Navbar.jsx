import { Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import "../styles/Navbar.css";

function Navbar() {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="navbar">
            <div className="navbar-container">

                <Link to="/" className="navbar-brand">
                    Learnova
                </Link>

                <div className="navbar-links">
                    <Link to="/">Home</Link>
                    <Link to="/courses">Courses</Link>

                    {user && (
                        <>
                            <Link to="/profile">Profile</Link>

                            <Link to="/ai-assistant">
                                ✨ AI Assistant
                            </Link>

                            {user.user_type === "student" && (
                                <>
                                    <Link to="/my-enrollments">
                                        My Enrollments
                                    </Link>

                                    <Link to="/quizzes">
                                        Quizzes
                                    </Link>

                                    <Link to="/quiz-attempts">
                                        Quiz History
                                    </Link>

                                    <Link to="/dashboard">
                                        Dashboard
                                    </Link>
                                </>
                            )}

                            {user.user_type === "instructor" && (
                                <>
                                    <Link to="/instructor/courses">
                                        Instructor Courses
                                    </Link>

                                    <Link to="/instructor-dashboard">
                                        Instructor Dashboard
                                    </Link>
                                </>
                            )}
                        </>
                    )}
                </div>

                <div className="navbar-actions">
                    {user ? (
                        <>
                            <span className="navbar-welcome">
                                Welcome, {user.username}
                            </span>

                            <button
                                className="navbar-logout"
                                onClick={logout}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="navbar-login"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="navbar-register"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>

            </div>
        </nav>
    );
}

export default Navbar;