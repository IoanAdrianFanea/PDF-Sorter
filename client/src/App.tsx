import { useEffect, useState, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import VerifyEmail from './pages/VerifyEmail';
import Documents from './pages/Documents';
import Upload from './pages/Upload';
import Jobs from './pages/Jobs';
import Search from './pages/Search';
import { AppShell } from './components/layout/AppShell';
import { authService } from './api/auth';
import AdminProjects from './pages/admin/AdminProjects';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPending from './pages/admin/AdminPending';
import AdminArchive from './pages/admin/AdminArchive';
import AdminFilters from './pages/admin/AdminFilters';
import AdminRecycleBin from './pages/admin/AdminRecycleBin';

interface AdminGuardProps {
  children: ReactNode;
}

function AdminGuard({ children }: AdminGuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isActive = true;
    const accessToken = sessionStorage.getItem('accessToken');

    if (!accessToken) {
      setIsAdmin(false);
      setIsChecking(false);
      return () => {
        isActive = false;
      };
    }

    authService
      .getMe(accessToken)
      .then((user) => {
        if (!isActive) return;
        setIsAdmin(user.role === 'ADMIN');
      })
      .catch(() => {
        if (!isActive) return;
        setIsAdmin(false);
      })
      .finally(() => {
        if (!isActive) return;
        setIsChecking(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  if (isChecking) {
    return null;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const renderAdminPage = (page: ReactNode) => (
  <AdminGuard>
    <AppShell>{page}</AppShell>
  </AdminGuard>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
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
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <Navigate to="/admin/projects" replace />
            </AdminGuard>
          }
        />
        <Route path="/admin/projects" element={renderAdminPage(<AdminProjects />)} />
        <Route path="/admin/users" element={renderAdminPage(<AdminUsers />)} />
        <Route path="/admin/pending" element={renderAdminPage(<AdminPending />)} />
        <Route path="/admin/recycle-bin" element={renderAdminPage(<AdminRecycleBin />)} />
        <Route path="/admin/archive" element={renderAdminPage(<AdminArchive />)} />
        <Route path="/admin/filters" element={renderAdminPage(<AdminFilters />)} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


