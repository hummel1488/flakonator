
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart,
  Boxes,
  Building,
  Calendar,
  Receipt,
  Settings,
  ShoppingBag,
  UserCircle2,
  Users,
  HeartHandshake,
  CalendarClock,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const location = useLocation();
  const { user, logout, isAdmin, isManager, isSeller } = useAuth();
  const isMobile = useMobile();

  const navItems = [
    {
      name: "Панель управления",
      href: "/",
      icon: <BarChart className="h-5 w-5" />,
      roles: ["admin", "manager", "seller"],
    },
    {
      name: "Товары",
      href: "/inventory",
      icon: <Boxes className="h-5 w-5" />,
      roles: ["admin", "manager"],
    },
    {
      name: "Продажи",
      href: "/sales",
      icon: <Receipt className="h-5 w-5" />,
      roles: ["admin", "manager", "seller"],
    },
    {
      name: "Клиенты",
      href: "/clients",
      icon: <Users className="h-5 w-5" />,
      roles: ["admin", "manager", "seller"],
    },
    {
      name: "Точки продаж",
      href: "/locations",
      icon: <Building className="h-5 w-5" />,
      roles: ["admin", "manager"],
    },
    {
      name: "Маркетинг",
      href: "/marketing",
      icon: <HeartHandshake className="h-5 w-5" />,
      roles: ["admin", "manager"],
    },
    {
      name: "Обучение",
      href: "/training",
      icon: <CalendarClock className="h-5 w-5" />,
      roles: ["admin", "manager", "seller"],
    },
    {
      name: "Статистика",
      href: "/statistics",
      icon: <Calendar className="h-5 w-5" />,
      roles: ["admin", "manager"],
    },
    {
      name: "Пользователи",
      href: "/users",
      icon: <User className="h-5 w-5" />,
      roles: ["admin"],
    },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) => {
    if (isAdmin() && item.roles.includes("admin")) return true;
    if (isManager() && item.roles.includes("manager")) return true;
    if (isSeller() && item.roles.includes("seller")) return true;
    return false;
  });

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border">
        <div className="flex h-full justify-center items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-2">
                <ShoppingBag className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              {filteredNavItems.map((item) => (
                <DropdownMenuItem key={item.href}>
                  <Link
                    to={item.href}
                    className="flex items-center w-full"
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                className="text-red-500"
                onClick={logout}
              >
                <Settings className="h-5 w-5 mr-2" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div className="border-r h-screen p-4 w-64 fixed left-0 top-0">
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <Link to="/">
            <h2 className="text-2xl font-bold">âme retail</h2>
          </Link>
        </div>
        <nav className="space-y-2 mb-auto">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-accent",
                location.pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t">
          {user && (
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center space-x-2">
                <UserCircle2 className="h-6 w-6" />
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.role}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="ml-auto"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navigation;
