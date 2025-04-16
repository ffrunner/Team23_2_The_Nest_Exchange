import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import Logo from './components/Logo';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home'; 
import Profile from './pages/Profile'; 
import Admin from './pages/Admin'; // Import the Admin page
import HomeNew from './pages/HomeNew'; // Import the new Home page
import Dashboard from './pages/Dashboard'; // Import the Dashboard page
import { UserProvider } from './context/UserContext'; // Import the UserProvider
import './css/App.css';

function App() {
    const location = useLocation();
    
    const hideNavBarAndSearch = ["/login", "/signup", "/forgot-password"];

    return (
        <UserProvider> {/* Wrap the app with UserProvider */}
            <div>
                {!hideNavBarAndSearch.includes(location.pathname) && <NavBar />}

                <Logo />

                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<HomeNew />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/admin" element={<Admin />} /> 
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Routes>
                </main>
            </div>
        </UserProvider>
    );
}

export default App;