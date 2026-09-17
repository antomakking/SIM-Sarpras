/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Facilities from './pages/Facilities';
import Consumables from './pages/Consumables';
import Scanner from './pages/Scanner';
import Loans from './pages/Loans';
import Reports from './pages/Reports';
import Maintenance from './pages/Maintenance';
import Books from './pages/Books';
import ActivityLog from './pages/ActivityLog';
import UserManagement from './pages/UserManagement';
import StockOpname from './pages/StockOpname';
import Login from './pages/Login';
import { ThemeProvider } from './components/ThemeProvider';

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="iq-assets-theme">
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="facilities" element={<Facilities />} />
            <Route path="consumables" element={<Consumables />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="books" element={<Books />} />
            <Route path="stock-opname" element={<StockOpname />} />
            <Route path="scanner" element={<Scanner />} />
            <Route path="loans" element={<Loans />} />
            <Route path="reports" element={<Reports />} />
            <Route path="activity-log" element={<ActivityLog />} />
            <Route path="users" element={<UserManagement />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
