"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Users,
} from "lucide-react";

interface SidebarProps {
  sidebarOpen?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  sidebarOpen,
  collapsed = false,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const iconMap: Record<string, React.ReactNode> = {
    "SmartVitals": <Activity className="h-5 w-5" />,
    "Users": <Users className="h-5 w-5" />,
    "Log Out": <LogOut className="h-5 w-5" />,
  };

  const navItems = [
    { label: "SmartVitals", href: "/dashboard" },
    { label: "Users", href: "/dashboard/users" },
  ];

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && onCloseMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={clsx(
          "fixed lg:static z-50 top-0 left-0 bottom-0 bg-gradient-to-b from-[#00f5ef] via-[#02b8f2] to-[#0a3a7a] text-white flex flex-col transition-all duration-300 ease-in-out shadow-lg",
          collapsed ? "w-20" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header Section with Logo */}
        <div className="relative flex-shrink-0">
          <div
            className={clsx(
              "flex justify-center items-center pt-6 pb-4 transition-all duration-300",
              collapsed ? "px-2" : "px-6"
            )}
          >
            {collapsed ? (
              <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white font-extrabold uppercase border-2 border-white/20 text-xs">
                MDR
              </div>
            ) : (
              <div className="text-center">
                <div className="relative flex items-center justify-center mb-2">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white font-extrabold uppercase border-2 border-white/20 text-base">
                    MDR
                  </div>
                </div>
                <div className="text-xs font-semibold text-white/90">
                  mdr. MYDIGIRECORDS
                </div>
              </div>
            )}
          </div>

          {!collapsed && <div className="mx-6 h-px bg-white/20" />}
        </div>

        {/* Collapse Toggle Button - Simple and Prominent (Desktop Only) */}
        {onToggleCollapse && (
          <div className="py-3 hidden lg:flex justify-center border-b border-white/10">
            <button
              onClick={onToggleCollapse}
              className="p-1.5 text-white hover:bg-white/10 rounded transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>
        )}

        {/* Navigation Section */}
        <nav
          className={clsx(
            "flex-1 flex flex-col transition-all duration-300 overflow-y-auto overflow-x-hidden",
            collapsed ? "px-2 pt-2" : "px-4 pt-2"
          )}
        >
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  onClick={onCloseMobile}
                  className={clsx(
                    "flex items-center gap-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative group",
                    collapsed ? "justify-center px-3" : "px-4",
                    isActive
                      ? "bg-white text-[#0a3a7a] shadow-md"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {/* Active Indicator */}
                  {isActive && !collapsed && (
                    <div
                      className={clsx(
                        "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-white"
                      )}
                    />
                  )}

                  <span
                    className={clsx(
                      "flex-shrink-0 transition-all duration-200",
                      isActive
                        ? "text-[#0a3a7a]"
                        : "text-white"
                    )}
                  >
                    {iconMap[item.label]}
                  </span>

                  {!collapsed && (
                    <span
                      className={clsx(
                        "transition-all duration-200 whitespace-nowrap",
                        isActive
                          ? "font-semibold text-[#0a3a7a]"
                          : "font-medium"
                      )}
                    >
                      {item.label}
                    </span>
                  )}

                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                      {item.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer Section with Log Out */}
        <div className="flex-shrink-0 pb-4">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2 px-2">
              <button
                onClick={handleLogout}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Log Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="px-4">
              <div className="h-px bg-white/20 mb-3" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
