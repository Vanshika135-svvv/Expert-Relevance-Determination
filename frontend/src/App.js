import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import all the components from your components folder
import HomePage from './components/HomePage'; 
import Login from './components/Login';
import Signup from './components/Signup';
import CandidateDashboard from './components/CandidateDashboard';
import ExpertDashboard from './components/ExpertDashboard';
import AdminDashboard from './components/AdminDashboard'; 
import Interview from './components/Interview';
import Result from './components/Result';

/**
 * PROTECTED ROUTE HELPER
 * Prevents logged-OUT users from seeing dashboards.
 * Redirects to /login if no session is found.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('role');
  
  if (!userRole) {
    return <Navigate replace to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate replace to="/login" />;
  }
  
  return children;
};

/**
 * PUBLIC ROUTE SHIELD
 * Prevents logged-IN users from seeing Login/Signup/Home.
 * It automatically teleports them to their correct workspace.
 */
const PublicRoute = ({ children }) => {
  const userRole = localStorage.getItem('role');
  
  if (userRole === 'Candidate') return <Navigate replace to="/candidate" />;
  if (userRole === 'Expert') return <Navigate replace to="/expert" />;
  if (userRole === 'Admin') return <Navigate replace to="/admin" />;
  
  // If not logged in, let them see the public page (Home/Login/Signup)
  return children;
};

function App() {
  return (
    // Global Aegis AI theme applied to the outermost div
    <div className="bg-navy-950 min-h-screen text-slate-200 font-sans overflow-x-hidden">
      <Router>
        <Routes>
          
          {/* === PUBLIC ROUTES (Shielded) === */}
          {/* If a user is already logged in, they will skip these pages entirely */}
          <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* === ROLE-BASED DASHBOARDS (Protected) === */}
          <Route 
            path="/candidate" 
            element={
              <ProtectedRoute allowedRoles={['Candidate']}>
                <CandidateDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/expert" 
            element={
              <ProtectedRoute allowedRoles={['Expert']}>
                <ExpertDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* === SHARED WORKFLOW ROUTES === */}
          <Route 
            path="/interview" 
            element={
              <ProtectedRoute allowedRoles={['Candidate', 'Expert']}>
                <Interview />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/result" 
            element={
              <ProtectedRoute allowedRoles={['Candidate']}>
                <Result />
              </ProtectedRoute>
            } 
          />

          {/* === FALLBACK === */}
          {/* If a user enters a wrong URL, redirect them back to the start */}
          <Route path="*" element={<Navigate to="/" />} />
          
        </Routes>
      </Router>
    </div>
  );
}

export default App;