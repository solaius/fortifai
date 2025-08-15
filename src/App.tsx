import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/Layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Providers from './pages/Providers';
import Secrets from './pages/Secrets';
import Bindings from './pages/Bindings';
import Policies from './pages/Policies';
import Audit from './pages/Audit';
import Settings from './pages/Settings';

function AppContent() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/providers" element={<Providers />} />
        <Route path="/providers/new" element={<Providers />} />
        <Route path="/secrets" element={<Secrets />} />
        <Route path="/secrets/new" element={<Secrets />} />
        <Route path="/bindings" element={<Bindings />} />
        <Route path="/bindings/new" element={<Bindings />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/policies/new" element={<Policies />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
