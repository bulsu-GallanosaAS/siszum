import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, Layout } from './components';
import { Login, Dashboard, Reservations, Inventory, Customers, Orders, POS, Timer, Transactions, Refills, Profile } from './pages';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Navigate to="/dashboard" replace />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/reservations" element={
              <ProtectedRoute>
                <Layout>
                  <Reservations />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/inventory" element={
              <ProtectedRoute>
                <Layout>
                  <Inventory />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/customers" element={
              <ProtectedRoute>
                <Layout>
                  <Customers />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/transactions" element={
              <ProtectedRoute>
                <Layout>
                  <Transactions />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/refills" element={
              <ProtectedRoute>
                <Layout>
                  <Refills />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/pos" element={
              <ProtectedRoute>
                <Layout>
                  <POS />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/orders" element={
              <ProtectedRoute>
                <Layout>
                  <Orders />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/receipt/:orderId" element={
              <ProtectedRoute>
                <Layout>
                  <div>Receipt Page (Coming Soon)</div>
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/timers" element={
              <ProtectedRoute>
                <Layout>
                  <Timer />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
