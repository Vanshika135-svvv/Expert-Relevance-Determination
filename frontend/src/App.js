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
import Chatbot from './components/Chatbot'; // <--- 1. IMPORT THE CHATBOT HERE

/**
 * ==========================================
 * PROTECTED ROUTE HELPER
 * ==========================================
 * Prevents logged-OUT users from seeing dashboards.
 * Redirects to the Home Page ("/") if no session is found or if they have the wrong role.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('role');
  
  // Check 1: If there is no role saved, the user is not logged in.
  // We instantly bounce them back to the Home Page.
  if (!userRole) {
    return <Navigate replace to="/" />;
  }
  
  // Check 2: If they are logged in, but their role isn't allowed on this specific page 
  // (e.g. an Expert trying to access the Candidate Dashboard), bounce them back to Home.
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate replace to="/" />;
  }
  
  // If they pass both security checks, render the requested page!
  return children;
};

/**
 * ==========================================
 * PUBLIC ROUTE SHIELD
 * ==========================================
 * Prevents logged-IN users from seeing the Home, Login, or Signup pages.
 * It automatically teleports them directly to their correct workspace dashboard.
 */
const PublicRoute = ({ children }) => {
  const userRole = localStorage.getItem('role');
  
  if (userRole === 'Candidate') {
    return <Navigate replace to="/candidate" />;
  }
  if (userRole === 'Expert') {
    return <Navigate replace to="/expert" />;
  }
  if (userRole === 'Admin') {
    return <Navigate replace to="/admin" />;
  }
  
  // If they are not logged in, allow them to see the public page.
  return children;
};

function App() {
  return (
    // Global dark theme applied to the outermost container to prevent any white flashing during navigation
    <div className="bg-[#020617] min-h-screen text-slate-200 font-sans overflow-x-hidden">
      <Router>
        <Routes>
          
          {/* ========================================== */}
          {/* PUBLIC ROUTES (Shielded)                   */}
          {/* ========================================== */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <HomePage />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } 
          />

          {/* ========================================== */}
          {/* ROLE-BASED DASHBOARDS (Protected)          */}
          {/* ========================================== */}
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

          {/* ========================================== */}
          {/* SHARED WORKFLOW ROUTES (Protected)         */}
          {/* ========================================== */}
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

          {/* ========================================== */}
          {/* FALLBACK ROUTE                             */}
          {/* ========================================== */}
          {/* If a user enters a completely random/wrong URL, safely redirect them to Home */}
          <Route 
            path="*" 
            element={<Navigate to="/" />} 
          />
          
        </Routes>
        
        {/* ========================================== */}
        {/* 2. GLOBAL CHATBOT COMPONENT                */}
        {/* ========================================== */}
        {/* Because it is inside the Router but outside the Routes, it stays on the screen globally! */}
        <Chatbot />
        
      </Router>
    </div>
  );
}

export default App;
