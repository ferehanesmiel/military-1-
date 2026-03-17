/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard, AdminDashboard, CommanderDashboard, OfficerDashboard, StaffDashboard } from './pages/Dashboards';
import { Analysis } from './pages/Analysis';
import { Personnel } from './pages/Personnel';
import { Materials } from './pages/Materials';
import { Reports } from './pages/Reports';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/personnel" element={<Personnel />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/commander" element={<ProtectedRoute allowedRoles={['commander']}><CommanderDashboard /></ProtectedRoute>} />
              <Route path="/officer" element={<ProtectedRoute allowedRoles={['officer']}><OfficerDashboard /></ProtectedRoute>} />
              <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
