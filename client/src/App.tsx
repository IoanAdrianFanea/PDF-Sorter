import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Documents from './pages/Documents';
import Jobs from './pages/Jobs';
import { AppShell } from './components/layout/AppShell';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/documents"
          element={
            <AppShell>
              <Documents />
            </AppShell>
          }
        />
        <Route
          path="/documents/:id"
          element={
            <AppShell>
              <Documents />
            </AppShell>
          }
        />
        <Route
          path="/jobs"
          element={
            <AppShell>
              <Jobs />
            </AppShell>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <AppShell>
              <Jobs />
            </AppShell>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


