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
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Добавьте новый пункт меню в функциональный компонент Navigation
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
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <NavLink to="/" className="text-xl font-bold text-gray-800">
                ScentTrack
              </NavLink>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {items.map(
                  (item, index) =>
                    (item.roles.includes("user") || isAdmin() || isManager()) && (
                      <NavLink
                        key={index}
                        to={item.href}
                        className={({ isActive }) =>
                          isActive
                            ? "bg-gray-100 text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                        }
                      >
                        {item.title}
                      </NavLink>
                    )
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <Settings />
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`${isMenuOpen ? "block" : "none"} md:hidden`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {items.map(
            (item, index) =>
              (item.roles.includes("user") || isAdmin() || isManager()) && (
                <NavLink
                  key={index}
                  to={item.href}
                  className={({ isActive }) =>
                    isActive
                      ? "bg-gray-100 text-gray-800 block px-3 py-2 rounded-md text-base font-medium"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 block px-3 py-2 rounded-md text-base font-medium"
                  }
                >
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
