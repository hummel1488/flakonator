
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ListChecks,
  Store,
  BarChart2,
  Menu,
  X,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const { isAdmin, isManager, logout, user } = useAuth();
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
      group: "operational",
    },
    {
      icon: <ListChecks className="h-5 w-5" />,
      title: "Инвентарь",
      href: "/inventory",
      roles: ["admin", "manager", "user"],
      group: "operational",
    },
    {
      icon: <Store className="h-5 w-5" />,
      title: "Точки продаж",
      href: "/locations",
      roles: ["admin", "manager"],
      group: "operational",
    },
    {
      icon: <BarChart2 className="h-5 w-5" />,
      title: "Продажи",
      href: "/sales",
      roles: ["admin", "manager", "user"],
      group: "analytical",
    },
    {
      icon: <BarChart2 className="h-5 w-5" />,
      title: "Статистика",
      href: "/statistics",
      roles: ["admin", "manager"],
      group: "analytical",
    },
  ];

  const getMenuItemsByGroup = (group) => {
    return items.filter((item) => {
      const hasPermission = item.roles.includes("user") || isAdmin() || isManager();
      return hasPermission && item.group === group;
    });
  };

  const operationalItems = getMenuItemsByGroup("operational");
  const analyticalItems = getMenuItemsByGroup("analytical");

  const menuBgColor = "bg-[#3A3A3A]";
  const textColor = "text-white";
  const activeItemBg = "bg-[#4A4A4A]";
  const hoverBg = "hover:bg-[#4A4A4A]";

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className={`${menuBgColor} shadow-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="text-xl font-bold flex items-center">
              <span className={`text-[26px] font-montserrat font-bold ${textColor}`}>
                Flak<span className="text-[#0FA0CE]">ON</span>ator
              </span>
            </NavLink>
          </div>

          <div className="hidden md:flex md:flex-1 md:justify-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-6 pr-6 border-r border-white/20">
                {operationalItems.map((item, index) => (
                  <NavLink
                    key={index}
                    to={item.href}
                    className={({ isActive }) =>
                      isActive
                        ? `${activeItemBg} ${textColor} px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors`
                        : `${textColor} ${hoverBg} px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors`
                    }
                  >
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </NavLink>
                ))}
              </div>
              
              <div className="flex items-center space-x-6 pl-2">
                {analyticalItems.map((item, index) => (
                  <NavLink
                    key={index}
                    to={item.href}
                    className={({ isActive }) =>
                      isActive
                        ? `${activeItemBg} ${textColor} px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors`
                        : `${textColor} ${hoverBg} px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors`
                    }
                  >
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className={`inline-flex items-center justify-center p-2 rounded-md ${textColor} ${hoverBg} focus:outline-none`}
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

          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`p-2 rounded-full ${textColor} ${hoverBg}`}>
                  <User className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {user?.name || 'Профиль пользователя'}
                </DropdownMenuLabel>
                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                  {user?.role === 'admin' ? 'Администратор' : 
                   user?.role === 'manager' ? 'Менеджер' : 'Продавец'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Настройки</span>
                </DropdownMenuItem>
                {isAdmin() && (
                  <DropdownMenuItem asChild>
                    <NavLink to="/user-management">
                      <User className="mr-2 h-4 w-4" />
                      <span>Управление пользователями</span>
                    </NavLink>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Выйти</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <div className="border-b border-white/20 pb-2 mb-2">
            <div className="px-3 py-1 text-xs font-medium text-white/70 uppercase">
              Операционные
            </div>
            {operationalItems.map(
              (item, index) =>
                (item.roles.includes("user") || isAdmin() || isManager()) && (
                  <NavLink
                    key={index}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      isActive
                        ? `${activeItemBg} ${textColor} block px-3 py-2 rounded-md text-base font-medium`
                        : `${textColor} ${hoverBg} block px-3 py-2 rounded-md text-base font-medium`
                    }
                  >
                    {item.title}
                  </NavLink>
                )
            )}
          </div>
          
          <div>
            <div className="px-3 py-1 text-xs font-medium text-white/70 uppercase">
              Аналитические
            </div>
            {analyticalItems.map(
              (item, index) =>
                (item.roles.includes("user") || isAdmin() || isManager()) && (
                  <NavLink
                    key={index}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      isActive
                        ? `${activeItemBg} ${textColor} block px-3 py-2 rounded-md text-base font-medium`
                        : `${textColor} ${hoverBg} block px-3 py-2 rounded-md text-base font-medium`
                    }
                  >
                    {item.title}
                  </NavLink>
                )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
