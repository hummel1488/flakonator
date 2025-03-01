
import React, { useState, useEffect } from "react";
import {
  Home,
  LayoutDashboard,
  ListChecks,
  Store,
  BarChart2,
  Users,
  Speaker,
  GraduationCap,
  Settings,
  Database,
  Menu,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const { isAdmin, isManager } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const items = [
    {
      icon: <Home className="h-5 w-5" />,
      title: "Главная",
      href: "/",
      roles: ["admin", "manager", "user"],
    },
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      title: "Панель управления",
      href: "/dashboard",
      roles: ["admin", "manager"],
    },
    {
      icon: <ListChecks className="h-5 w-5" />,
      title: "Инвентарь",
      href: "/inventory",
      roles: ["admin", "manager", "user"],
    },
    {
      icon: <Store className="h-5 w-5" />,
      title: "Точки продаж",
      href: "/locations",
      roles: ["admin", "manager"],
    },
    {
      icon: <BarChart2 className="h-5 w-5" />,
      title: "Продажи",
      href: "/sales",
      roles: ["admin", "manager", "user"],
    },
    {
      icon: <BarChart2 className="h-5 w-5" />,
      title: "Статистика",
      href: "/statistics",
      roles: ["admin", "manager"],
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Клиенты",
      href: "/clients",
      roles: ["admin"],
    },
    {
      icon: <Speaker className="h-5 w-5" />,
      title: "Маркетинг",
      href: "/marketing",
      roles: ["admin"],
    },
    {
      icon: <GraduationCap className="h-5 w-5" />,
      title: "Обучение",
      href: "/training",
      roles: ["admin"],
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: "Управление данными",
      href: "/data-management",
      roles: ["admin", "manager"],
    },
    {
      icon: <Settings className="h-5 w-5" />,
      title: "Управление пользователями",
      href: "/user-management",
      roles: ["admin"],
    },
  ];

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <NavLink to="/" className="text-xl font-bold text-white flex items-center">
                <span className="bg-white text-purple-700 px-2 py-0.5 rounded-md mr-1">Flak</span>
                <span className="text-white font-light">ONator</span>
              </NavLink>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-2">
                {items.map(
                  (item, index) =>
                    (item.roles.includes("user") || isAdmin() || isManager()) && (
                      <NavLink
                        key={index}
                        to={item.href}
                        className={({ isActive }) =>
                          isActive
                            ? "bg-white text-purple-700 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors"
                            : "text-white hover:bg-purple-500 hover:bg-opacity-30 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors"
                        }
                      >
                        {item.icon}
                        {item.title}
                      </NavLink>
                    )
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-purple-500 hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-purple-700 rounded-b-lg">
          {items.map(
            (item, index) =>
              (item.roles.includes("user") || isAdmin() || isManager()) && (
                <NavLink
                  key={index}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive
                      ? "bg-white text-purple-700 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2"
                      : "text-white hover:bg-purple-600 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2"
                  }
                >
                  {item.icon}
                  {item.title}
                </NavLink>
              )
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
