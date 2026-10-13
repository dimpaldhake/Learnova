import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";

import { AuthProvider } from "./context/AuthContext";
import AuthContext from "./context/AuthContext";

import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import MyEnrollments from "./pages/MyEnrollments";
import Lessons from "./pages/Lessons";
import InstructorLessons from "./pages/InstructorLessons";

import Quizzes from "./pages/Quizzes";
import QuizDetails from "./pages/QuizDetails";
import QuizAttempts from "./pages/QuizAttempts";

import Dashboard from "./pages/Dashboard";
import InstructorDashboard from "./pages/InstructorDashboard";

import InstructorQuizzes from "./pages/InstructorQuizzes";
import InstructorQuizQuestions from "./pages/InstructorQuizQuestions";

import InstructorCourses from "./pages/InstructorCourses";
import InstructorCourseEdit from "./pages/InstructorCourseEdit";
import AIChatbot from "./pages/AIChatbot";


/* Student/normal dashboard */
function DashboardRouter() {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.user_type === "instructor") {
        return <Navigate to="/instructor-dashboard" replace />;
    }

    return <Dashboard />;
}


/* Instructor-only route protection */
function InstructorRoute({ children }) {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.user_type !== "instructor") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}


function App() {
    return (
        <AuthProvider>
            <BrowserRouter>

                <Navbar />

                <Routes>

                    {/* Public pages */}
                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route
                        path="/courses"
                        element={<Courses />}
                    />

                    <Route
                        path="/courses/:id"
                        element={<CourseDetails />}
                    />


                    {/* Logged-in user pages */}
                    <Route
                        path="/profile"
                        element={<Profile />}
                    />

                    <Route
                        path="/my-enrollments"
                        element={<MyEnrollments />}
                    />

                    <Route
                        path="/courses/:id/lessons"
                        element={<Lessons />}
                    />

                    <Route
                        path="/quizzes"
                        element={<Quizzes />}
                    />

                    <Route
                        path="/quizzes/:id"
                        element={<QuizDetails />}
                    />

                    <Route
                        path="/quiz-attempts"
                        element={<QuizAttempts />}
                    />


                    {/* Dashboard */}
                    <Route
                        path="/dashboard"
                        element={<DashboardRouter />}
                    />


                    {/* =========================
                        INSTRUCTOR-ONLY ROUTES
                       ========================= */}

                    <Route
                        path="/instructor-dashboard"
                        element={
                            <InstructorRoute>
                                <InstructorDashboard />
                            </InstructorRoute>
                        }
                    />

                    <Route
                        path="/instructor/courses"
                        element={
                            <InstructorRoute>
                                <InstructorCourses />
                            </InstructorRoute>
                        }
                    />

                    <Route
                        path="/instructor/courses/:id/edit"
                        element={
                            <InstructorRoute>
                                <InstructorCourseEdit />
                            </InstructorRoute>
                        }
                    />

                    <Route
                        path="/instructor/courses/:id/lessons"
                        element={
                            <InstructorRoute>
                                <InstructorLessons />
                            </InstructorRoute>
                        }
                    />

                    <Route
                        path="/instructor/courses/:id/quizzes"
                        element={
                            <InstructorRoute>
                                <InstructorQuizzes />
                            </InstructorRoute>
                        }
                    />

                    <Route
                        path="/instructor/quizzes/:id/questions"
                        element={
                            <InstructorRoute>
                                <InstructorQuizQuestions />
                            </InstructorRoute>
                        }
                    />
                    <Route
                        path="/ai-assistant"
                        element={<AIChatbot />}
                    />

                </Routes>

            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
