import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './pages/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import Upload from './pages/Upload';
import Chat from './pages/Chat';
import Analysis from './pages/Analysis';
import Settings from './pages/Settings';
import Landing from './pages/Landing';

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<DashboardLayout />}>
                            {/* The index route just shows chat. Overview is a separate route. */}
                            <Route path="overview" element={<DashboardHome />} />
                            <Route path="upload" element={<Upload />} />

                            <Route path="resumes" element={<Analysis />} />
                            <Route path="settings" element={<Settings />} />
                        </Route>
                    </Route>

                    {/* Default Redirect */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

