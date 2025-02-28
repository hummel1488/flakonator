
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  ShoppingBag, 
  Package,
  Store,
  LogOut,
  Menu,
  X,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const Navigation = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin, isSeller, isManager } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleBadgeVariant = () => {
    if (isAdmin()) return "admin";
    if (isSeller()) return "seller";
    if (isManager()) return "manager";
    return "default";
  };

  const getRoleLabel = () => {
    if (isAdmin()) return "Администратор";
    if (isSeller()) return "Продавец";
    if (isManager()) return "Управляющий";
    return "Пользователь";
  };

  const menuItems = [
    {
      name: "Статистика",
      path: "/statistics",
      icon: <BarChart3 className="w-5 h-5" />,
      showFor: ["admin"]
    },
    {
      name: "Продажи",
      path: "/sales",
      icon: <ShoppingBag className="w-5 h-5" />,
      showFor: ["admin", "seller"]
    },
    {
      name: "Инвентарь",
      path: "/inventory",
      icon: <Package className="w-5 h-5" />,
      showFor: ["admin", "manager"]
    },
    {
      name: "Точки продаж",
      path: "/locations",
      icon: <Store className="w-5 h-5" />,
      showFor: ["admin"]
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !user?.role || item.showFor.includes(user.role)
  );

  return (
    <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center">
              <img
                src="/lovable-uploads/68b9ed5b-c4d4-44be-bf47-99958ce5197f.png"
                alt="âme logo"
                className="h-10"
              />
            </Link>

            {/* Desktop menu */}
            <nav className="hidden md:flex items-center gap-1">
              {filteredMenuItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  asChild
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Link to={item.path} className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </Button>
              ))}
            </nav>
          </div>

          {/* User menu */}
          <div className="flex items-center gap-2">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Профиль</span>
                    <Badge variant={getRoleBadgeVariant()}>{getRoleLabel()}</Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Выйти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-3 flex flex-col gap-2">
              {filteredMenuItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                </Button>
              ))}
              <Button
                variant="destructive"
                className="w-full justify-start mt-2"
                onClick={handleLogout}
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <span>Выйти</span>
                </div>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navigation;
