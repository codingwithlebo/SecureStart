import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { RequireAuth } from './auth/RequireAuth';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { FirmSetup } from './pages/FirmSetup';
import { Assessment } from './pages/Assessment';
import { Findings } from './pages/Findings';
import { FindingDetail } from './pages/FindingDetail';
import { Dashboard, FirmSettings } from './pages/Pages';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<RequireAuth role="owner"><FirmSetup /></RequireAuth>} />
          <Route element={<RequireAuth needsOrg><Layout /></RequireAuth>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/findings" element={<Findings />} />
            <Route path="/findings/:id" element={<FindingDetail />} />
            <Route path="/firm" element={<FirmSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
