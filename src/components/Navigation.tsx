
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
  Flame
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
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <NavLink to="/" className="text-2xl font-bold flex items-center">
                <span className="bg-accent text-accent-foreground px-2 py-0.5 rounded-l-md mr-0.5 flex items-center">
                  <Flame className="h-5 w-5 mr-1" />
                  Flak
                </span>
                <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-r-md font-light">ONator</span>
              </NavLink>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-1">
                {items.map(
                  (item, index) =>
                    (item.roles.includes("user") || isAdmin() || isManager()) && (
                      <NavLink
                        key={index}
                        to={item.href}
                        className={({ isActive }) =>
                          isActive
                            ? "bg-accent text-accent-foreground px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors"
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
            <button className="bg-accent text-accent-foreground p-2 rounded-full">
              <Settings className="h-5 w-5" />
            </button>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent"
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
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800">
          {items.map(
            (item, index) =>
              (item.roles.includes("user") || isAdmin() || isManager()) && (
                <NavLink
                  key={index}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive
                      ? "bg-accent text-accent-foreground block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2"
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
