import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import Logo from './components/Logo';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home'; // Ensure you import the Home component
import './css/App.css';

function App() {
    const location = useLocation();
    
    const hideNavBarAndSearch = ["/", "/signup", "/forgot-password"];

    return (
        <div>
        <Logo />
        {!hideNavBarAndSearch.includes(location.pathname) && <NavBar />}
        <main className="main-content">
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/home" element={<Home />} /> {/* Add the Home route */}
                {/* Optionally add a 404 page handling */}
                {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>
        </main>
        </div> 
    );
}

export default App;