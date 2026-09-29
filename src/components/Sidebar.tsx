import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Folder,
  FileText,
  LogOut,
  Settings,
  Menu,
  X,
  MessageCircle,
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/auth.store";

interface SidebarLink {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar, isMobile, closeSidebar } = useSidebar();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const sidebarLinks: SidebarLink[] = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
    { label: "Projects", icon: <Folder size={20} />, path: "/projects" },
    { label: "Articles", icon: <FileText size={20} />, path: "/articles" },
    {label: "Messages", icon: <MessageCircle size={20} />, path: "/messages" },
  ];

  const bottomLinks: SidebarLink[] = [
    { label: "Settings", icon: <Settings size={20} />, path: "/settings" },
  ];

  const handleLogout = async () => {
    try {
      const res = await logout();
      if (!res.success) {
        return;
      }
      navigate("/");
    } catch (error: unknown) {
      toast.error(`Failed to logout: ${error}`);
    }
  };

  const renderLink = (link: SidebarLink) => (
    <li key={link.label}>
      <NavLink
        to={link.path}
        onClick={() => isMobile && closeSidebar()}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant transition-all duration-200 hover:bg-surface-container/60 hover:text-on-surface group ${
            isActive ? "bg-primary/10 text-primary hover:bg-primary/10" : ""
          } ${!isSidebarOpen ? "justify-center" : ""}`
        }
      >
        {({ isActive }) => (
          <>
            <span
              className={`transition-colors duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-on-surface-variant/60 group-hover:text-on-surface"
              }`}
            >
              {link.icon}
            </span>
            {isSidebarOpen && (
              <>
                <span
                  className={`font-body text-body-sm flex-1 ${
                    isActive ? "text-primary" : ""
                  }`}
                >
                  {link.label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </>
            )}
          </>
        )}
      </NavLink>
    </li>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      <div
        className={`
          fixed lg:sticky top-0 h-screen bg-surface-container-high
          border-r border-outline-variant/20 p-4 flex flex-col
          transition-all duration-300 z-50
          ${isSidebarOpen ? "w-64" : "w-16"}
          ${isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        {/* Logo */}
        <div
          className={`mb-8 px-2 flex items-center gap-2 ${
            isSidebarOpen ? "justify-between" : "justify-center"
          }`}
        >
          {isSidebarOpen && (
            <div>
              <h1 className="font-heading text-headline-md font-bold text-primary whitespace-nowrap">
                <code>&lt;CMS/&gt;</code>
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/40 mt-1">
                Portfolio Manager
              </p>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-surface-container/60 transition-colors"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? (
              <X size={20} className="text-on-surface-variant/60 hover:text-on-surface transition-colors" />
            ) : (
              <Menu size={20} className="text-on-surface-variant/60 hover:text-on-surface transition-colors" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-1">{sidebarLinks.map(renderLink)}</ul>
        </nav>

        {/* Bottom Links */}
        <div className="border-t border-outline-variant/10 pt-4 mt-4">
          <ul className="space-y-1">{bottomLinks.map(renderLink)}</ul>

          <button
            type="button"
            onClick={handleLogout}
            className={`mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant transition-all duration-200 hover:bg-error/10 hover:text-error group ${
              !isSidebarOpen ? "justify-center" : ""
            }`}
          >
            <LogOut
              size={20}
              className="text-on-surface-variant/60 group-hover:text-error transition-colors"
            />
            {isSidebarOpen && (
              <span className="font-body text-body-sm flex-1 text-left">
                Logout
              </span>
            )}
          </button>
        </div>

        {/* User Info */}
        {isSidebarOpen && (
          <div className="mt-4 pt-4 border-t border-outline-variant/10">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="font-mono text-xs text-primary font-bold">
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                  {user?.name?.[0]?.toUpperCase() ?? ""}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-body-sm text-on-surface truncate">
                  {`${user?.name ?? ""}`.trim() || "User"}
                </p>
                <p className="font-mono text-[8px] uppercase tracking-widest text-on-surface-variant/40 truncate">
                  {/* {user?.role?.replace("_", " ").toLowerCase() || "user"} */}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;