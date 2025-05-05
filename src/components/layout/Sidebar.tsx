import React from 'react';
import { observer } from 'mobx-react-lite';
import { NavLink } from 'react-router-dom';
import { 
  ChevronLeft,
  LayoutDashboard,
  User,
  Users,
  Settings,
  Bell,
  Shield,
  FileText,
  Grid3X3,
  Files
} from 'lucide-react';
import rootStore from '../../store/RootStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
  childItems?: { to: string, label: string }[];
  requiresAdmin?: boolean;
  end?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ 
  to, icon: Icon, label, collapsed, childItems, requiresAdmin = false, end = false
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { currentUser } = rootStore.userStore;
  
  // Don't render admin-only items for non-admins
  if (requiresAdmin && currentUser?.role !== 'admin') {
    return null;
  }
  
  return (
    <>
      <li>
        <NavLink
          to={to}
          end={end}
          className={({ isActive }) => 
            `flex items-center py-2 px-4 rounded-md transition-colors relative
             ${isActive ? 'bg-sidebar-accent text-primary' : 'hover:bg-sidebar-accent/50'}`
          }
          onClick={() => childItems && setIsOpen(!isOpen)}
        >
          <Icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'}`} />
          {!collapsed && <span>{label}</span>}
          {!collapsed && childItems && (
            <ChevronLeft 
              className={`ml-auto h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            />
          )}
        </NavLink>
      </li>
      
      {!collapsed && isOpen && childItems && (
        <ul className="ml-6 space-y-1 mt-1">
          {childItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/documents"}
                className={({ isActive }) => 
                  `block py-1 px-4 rounded-md transition-colors
                   ${isActive ? 'bg-sidebar-accent text-primary' : 'hover:bg-sidebar-accent/50'}`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export const Sidebar = observer(() => {
  const { sidebarCollapsed, toggleSidebar } = rootStore.uiStore;
  
  return (
    <TooltipProvider>
      <aside 
        className={`bg-sidebar fixed md:static inset-y-0 left-0 z-20 transform transition-all duration-300 ease-in-out
                    ${sidebarCollapsed ? 'w-16' : 'w-64'} 
                    ${sidebarCollapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}
      >
        <div className="flex flex-col h-full border-r border-border">
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            {!sidebarCollapsed && (
              <span className="text-primary font-semibold">Navigation</span>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleSidebar}
                  className={`p-1 rounded-md hover:bg-sidebar-accent focus:outline-none focus:ring-2 focus:ring-primary
                            ${sidebarCollapsed ? 'mx-auto' : 'ml-auto'}`}
                  aria-label="Toggle sidebar"
                >
                  <ChevronLeft 
                    className={`h-5 w-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} 
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              <NavItem 
                to="/"
                icon={LayoutDashboard}
                label="Dashboard"
                collapsed={sidebarCollapsed}
              />
              
              <NavItem 
                to="/users"
                icon={Users}
                label="Users"
                collapsed={sidebarCollapsed}
                childItems={[
                  { to: "/users/list", label: "User List" },
                  { to: "/users/new", label: "Add User" }
                ]}
                requiresAdmin
              />
              
              <NavItem 
                to="/documents"
                icon={Files}
                label="Documents"
                collapsed={sidebarCollapsed}
                childItems={[
                  { to: "/documents", label: "All Documents" },
                  { to: "/documents/upload", label: "Upload Document" }
                ]}
                end={true}
              />
              
              <NavItem 
                to="/forms"
                icon={FileText}
                label="Forms"
                collapsed={sidebarCollapsed}
                childItems={[
                  { to: "/forms/basic", label: "Basic Form" },
                  { to: "/forms/advanced", label: "Advanced Form" }
                ]}
              />
              
              <NavItem 
                to="/data"
                icon={Grid3X3}
                label="Data Grids"
                collapsed={sidebarCollapsed}
              />
              
              <NavItem 
                to="/profile"
                icon={User}
                label="User Profile"
                collapsed={sidebarCollapsed}
              />
              
              <NavItem 
                to="/notifications"
                icon={Bell}
                label="Notifications"
                collapsed={sidebarCollapsed}
              />
              
              <NavItem 
                to="/admin"
                icon={Shield}
                label="Admin Panel"
                collapsed={sidebarCollapsed}
                requiresAdmin
              />
              
              <NavItem 
                to="/settings"
                icon={Settings}
                label="Settings"
                collapsed={sidebarCollapsed}
              />
            </ul>
          </nav>
          
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-border">
              <div className="bg-sidebar-accent rounded-md p-3 text-sm">
                <p className="font-medium mb-1">Portal Template System</p>
                <p className="text-muted-foreground">v1.0.0</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
});
