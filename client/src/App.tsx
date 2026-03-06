import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Documents from './pages/Documents';
import Upload from './pages/Upload';
import Jobs from './pages/Jobs';
import Search from './pages/Search';
import { AppShell } from './components/layout/AppShell';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/search"
          element={
            <AppShell>
              <Search />
            </AppShell>
          }
        />
        <Route
          path="/search/:id"
          element={
            <AppShell>
              <Search />
            </AppShell>
          }
        />
        <Route
          path="/upload"
          element={
            <AppShell>
              <Upload />
            </AppShell>
          }
        />
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


