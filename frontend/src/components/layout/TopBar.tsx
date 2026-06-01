import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '../../api/notification.api';
import Avatar from '../ui/Avatar';
import Dropdown, { DropdownItem, DropdownDivider } from '../ui/Dropdown';
import { formatDistanceToNow } from 'date-fns';

interface TopBarProps {
  onMenuClick: () => void;
}

const BreadcrumbLabel: Record<string, string> = {
  workspaces: 'Workspaces',
  create: 'Create',
};

const TopBar = ({ onMenuClick }: TopBarProps) => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.list,
    refetchInterval: 30000,
  });

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  // Close notification panel on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifications]);

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((seg, i) => {
    const path = '/' + pathSegments.slice(0, i + 1).join('/');
    let label = seg;
    if (BreadcrumbLabel[seg]) label = BreadcrumbLabel[seg];
    else if (seg === 'w' && pathSegments[i + 1]) label = '';
    else if (seg === 'projects' && pathSegments[i + 1]) label = '';
    else if (seg === 'chat') label = 'Chat';
    else if (seg === 'board') label = 'Board';
    else if (seg === 'list') label = 'List';
    else if (seg === 'pages') label = 'Pages';
    else if (seg === 'settings') label = 'Settings';
    else {
      label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
    }
    return { label, path, skip: !label };
  }).filter((b) => !b.skip);

  // Simplified breadcrumb for workspace pages
  const isWorkspacePage = pathSegments[0] === 'w';
  const simplifiedBreadcrumbs = isWorkspacePage
    ? [{ label: 'Workspaces', path: '/workspaces' }]
    : breadcrumbs;

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        <button onClick={onMenuClick} className="btn-ghost p-1 lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
        {isWorkspacePage && (
          <Link
            to="/workspaces"
            className="hidden sm:inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 shrink-0"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            All Workspaces
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="input-field w-56 lg:w-64 pl-9"
          />
        </div>

        <div ref={notifRef} className="relative">
          <button className="btn-ghost relative p-2" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-1 z-50 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="border-b border-gray-200 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications && notifications.length > 0 ? (
                  notifications.slice(0, 10).map((n) => (
                    <div key={n.id} className={`border-b border-gray-100 px-4 py-3 ${!n.read ? 'bg-indigo-50' : ''}`}>
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-500">{n.message}</p>
                      <p className="mt-1 text-[10px] text-gray-400">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-6 text-center text-sm text-gray-500">No notifications</p>
                )}
              </div>
            </div>
          )}
        </div>

        <Dropdown
          trigger={
            <button className="btn-ghost p-0.5">
              <Avatar name={user?.displayName || 'U'} size="sm" />
            </button>
          }
          align="right"
        >
          <div className="border-b border-gray-100 px-4 py-2">
            <p className="text-sm font-medium text-gray-900">{user?.displayName}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <DropdownItem onClick={() => {}}>Profile Settings</DropdownItem>
          <DropdownDivider />
          <DropdownItem onClick={logout} danger>Log out</DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
};

export default TopBar;
