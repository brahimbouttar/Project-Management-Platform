import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface AppLayoutProps {
  children: ReactNode;
  hideSidebar?: boolean;
}

const AppLayout = ({ children, hideSidebar }: AppLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (hideSidebar) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar onMenuClick={() => {}} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
