import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Donations from './pages/Donations';
import Organizations from './pages/Organizations';
import Profile from './pages/Profile';
import DonationDetail from './pages/DonationDetail';
import OrganizationDetail from './pages/OrganizationDetail';
import CreateDonation from './pages/CreateDonation';
import CreateOrganization from './pages/CreateOrganization';
import ReservedDonations from './pages/ReservedDonations';
import OrderFood from './pages/OrderFood';
import OrderDetail from './pages/OrderDetail';
import OrdersList from './pages/OrdersList';
import Community from './pages/Community';
import PostDetail from './pages/PostDetail';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminOrders from './pages/AdminOrders';
import AdminDonations from './pages/AdminDonations';

// Route guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Routes>

          {/* ---------------- PUBLIC ROUTES ---------------- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ---------------- PROTECTED ROUTES (all users) ---------------- */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Browse Donations */}
          <Route path="/donations" element={
            <ProtectedRoute>
              <Donations />
            </ProtectedRoute>
          } />
          <Route path="/donations/:id" element={
            <ProtectedRoute>
              <DonationDetail />
            </ProtectedRoute>
          } />

          {/* Community Section */}
          <Route path="/community" element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          } />
          <Route path="/community/:id" element={
            <ProtectedRoute>
              <PostDetail />
            </ProtectedRoute>
          } />
          
          {/* Analytics Dashboard */}
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          
          {/* Notifications */}
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />

          {/* Browse Organizations */}
          <Route path="/organizations" element={
            <ProtectedRoute>
              <Organizations />
            </ProtectedRoute>
          } />
          <Route path="/organizations/:id" element={
            <ProtectedRoute>
              <OrganizationDetail />
            </ProtectedRoute>
          } />

          {/* Orders (all authenticated users) */}
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrdersList />
            </ProtectedRoute>
          } />
          <Route path="/orders/:id" element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          } />

          {/* ---------------- ROLE-BASED ROUTES ---------------- */}

          {/* Create Donation (role-based) */}
          <Route path="/donations/create" element={
            <RoleBasedRoute allowedRoles={['donor', 'organization', 'admin']}>
              <CreateDonation />
            </RoleBasedRoute>
          } />
          <Route path="/order-food" element={
            <ProtectedRoute>
              <OrderFood />
            </ProtectedRoute>
          } />
          <Route path="/reserved-donations" element={
            <RoleBasedRoute allowedRoles={['recipient']}>
              <ReservedDonations />
            </RoleBasedRoute>
          } />
          <Route path="/donations/reserved" element={
            <RoleBasedRoute allowedRoles={['recipient']}>
              <ReservedDonations />
            </RoleBasedRoute>
          } />

          {/* Admins + Volunteers */}
          <Route path="/organizations/create" element={
            <RoleBasedRoute allowedRoles={['admin', 'volunteer']}>
              <CreateOrganization />
            </RoleBasedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleBasedRoute>
          } />
          <Route path="/admin/users" element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </RoleBasedRoute>
          } />
          <Route path="/admin/orders" element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminOrders />
            </RoleBasedRoute>
          } />
          <Route path="/admin/donations" element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <AdminDonations />
            </RoleBasedRoute>
          } />

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
