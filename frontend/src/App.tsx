import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/queryClient';
import { useSocket } from './hooks/useSocket';
import { useAuthStore } from './store/authStore';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import WorkspacePage from './pages/workspace/WorkspacePage';
import CreateWorkspacePage from './pages/workspace/CreateWorkspacePage';
import WorkspaceDashboard from './pages/workspace/WorkspaceDashboard';
import ProjectLayout from './pages/project/ProjectLayout';
import BoardView from './pages/project/BoardView';
import ListView from './pages/project/ListView';
import PageList from './components/pages/PageList';
import PageEditorPage from './pages/docs/PageEditorPage';
import ProjectSettings from './pages/project/ProjectSettings';
import MembersPage from './pages/project/MembersPage';
import ChatPage from './pages/chat/ChatPage';
import NotFoundPage from './pages/NotFoundPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const SocketInitializer = ({ children }: { children: React.ReactNode }) => {
  useSocket();
  return <>{children}</>;
};

const PageListWrapper = () => {
  const { projectId, slug } = useParams<{ projectId: string; slug: string }>();
  if (!projectId || !slug) return <NotFoundPage />;
  return <PageList projectId={projectId} workspaceSlug={slug} />;
};

const AppContent = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <SocketInitializer>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/workspaces" replace /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/workspaces"
          element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>}
        />
        <Route
          path="/workspaces/create"
          element={<ProtectedRoute><CreateWorkspacePage /></ProtectedRoute>}
        />

        <Route
          path="/w/:slug"
          element={<ProtectedRoute><WorkspaceDashboard /></ProtectedRoute>}
        />

        <Route
          path="/w/:slug/projects/:projectId"
          element={<ProtectedRoute><ProjectLayout /></ProtectedRoute>}
        >
          <Route index element={<Navigate to="board" replace />} />
          <Route path="board" element={<BoardView />} />
          <Route path="list" element={<ListView />} />
          <Route path="pages" element={<PageListWrapper />} />
          <Route path="pages/:pageId" element={<PageEditorPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="settings" element={<ProjectSettings />} />
        </Route>

        <Route
          path="/w/:slug/chat"
          element={<ProtectedRoute><ChatPage /></ProtectedRoute>}
        />
        <Route
          path="/w/:slug/chat/:channelId"
          element={<ProtectedRoute><ChatPage /></ProtectedRoute>}
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </SocketInitializer>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontSize: '14px', borderRadius: '8px' },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
