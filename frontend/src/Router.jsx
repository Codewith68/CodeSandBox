import { Route, Routes } from "react-router-dom";
import { CreateProject } from "./pages/createProject";
import { ProjectPlayground } from "./pages/ProjectPlayground";
import { MyProjectsPage } from "./pages/MyProjectsPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { GoogleAuthSuccess, GoogleAuthFailure } from "./pages/GoogleAuthCallback";
import { ProtectedRoute, PublicRoute } from "./components/atoms/RouteGuards";

export const Router = () => {
    return (
        <Routes>
            {/* Public routes — redirect to / if already logged in */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <RegisterPage />
                    </PublicRoute>
                }
            />

            {/* Google OAuth callbacks */}
            <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
            <Route path="/auth/google/failure" element={<GoogleAuthFailure />} />

            {/* Password reset routes — accessible to everyone */}
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Home — landing page (accessible to all) */}
            <Route path="/" element={<CreateProject />} />

            {/* Protected routes — require authentication */}
            <Route
                path="/projects"
                element={
                    <ProtectedRoute>
                        <MyProjectsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/project/:projectId"
                element={
                    <ProtectedRoute>
                        <ProjectPlayground />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};