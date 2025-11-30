import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        {/* dawshboard */}
        <Route path="/" element={<Dashboard />} />
        
        {/* login */}
        <Route path="/login" element={<AuthPage type="login" />} />
        
        {/* register */}
        <Route path="/register" element={<AuthPage type="register" />} />

        {/* profile */}
        <Route path="/profile" element={<Profile />} />
        
        {/* redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </Router>
  );
}

export default App;