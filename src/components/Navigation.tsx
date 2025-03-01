
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ListChecks,
  Store,
  BarChart2,
  Menu,
  X,
  User,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const Navigation = () => {
  const { isAdmin, isManager } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

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
      icon: <LayoutDashboard className="h-5 w-5" />,
      title: "Панель управления",
      href: "/dashboard",
      roles: ["admin", "manager"],
      group: "left",
    },
    {
      icon: <ListChecks className="h-5 w-5" />,
      title: "Инвентарь",
      href: "/inventory",
      roles: ["admin", "manager", "user"],
      group: "left",
    },
    {
      icon: <Store className="h-5 w-5" />,
      title: "Точки продаж",
      href: "/locations",
      roles: ["admin", "manager"],
      group: "left",
    },
    {
      icon: <BarChart2 className="h-5 w-5" />,
      title: "Продажи",
      href: "/sales",
      roles: ["admin", "manager", "user"],
      group: "right",
    },
    {
      icon: <BarChart2 className="h-5 w-5" />,
      title: "Статистика",
      href: "/statistics",
      roles: ["admin", "manager"],
      group: "right",
    },
  ];

  // Filter items based on user role and group
  const getMenuItemsByGroup = (group) => {
    return items.filter((item) => {
      const hasPermission = item.roles.includes("user") || isAdmin() || isManager();
      return hasPermission && item.group === group;
    });
  };

  const leftItems = getMenuItemsByGroup("left");
  const rightItems = getMenuItemsByGroup("right");

  return (
    <nav className="bg-[#2C2C2C] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-[#3A3A3A] focus:outline-none"
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

          {/* Logo - centered on mobile, left on desktop */}
          <div className="flex-1 flex items-center justify-center md:justify-start">
            <NavLink to="/" className="text-xl font-medium text-white flex items-center">
              <span>FlakONator</span>
            </NavLink>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:flex-1 md:justify-between">
            {/* Left side items */}
            <div className="flex items-center space-x-2">
              {leftItems.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.href}
                  className={({ isActive }) =>
                    isActive
                      ? "bg-[#3A3A3A] text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                      : "text-white hover:bg-[#3A3A3A]/70 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                  }
                >
                  {item.icon}
                  {item.title}
                </NavLink>
              ))}
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-2">
              {rightItems.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.href}
                  className={({ isActive }) =>
                    isActive
                      ? "bg-[#3A3A3A] text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                      : "text-white hover:bg-[#3A3A3A]/70 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                  }
                >
                  {item.icon}
                  {item.title}
                </NavLink>
              ))}

              {/* Admin profile icon */}
              <div className="flex items-center ml-2">
                <button className="p-2 rounded-full text-white hover:bg-[#3A3A3A]/70">
                  <User className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#2C2C2C]">
          {items.map(
            (item, index) =>
              (item.roles.includes("user") || isAdmin() || isManager()) && (
                <NavLink
                  key={index}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive
                      ? "bg-[#3A3A3A] text-white block px-3 py-2 rounded-md text-base font-medium"
                      : "text-white hover:bg-[#3A3A3A]/70 block px-3 py-2 rounded-md text-base font-medium"
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
