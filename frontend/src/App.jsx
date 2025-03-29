import React from 'react'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './pages/Login';
import { Routes, Route } from 'react-router-dom'
import SignUp from './pages/SignUp'

function App() {
  //const [count, setCount] = useState(0)

  return (
    <main className="main-content">
    <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        {/* Optionally add a 404 page handling */}
        {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
</main>
  );
}

export default App;