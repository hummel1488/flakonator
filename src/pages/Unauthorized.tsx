
import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="max-w-md text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100 mb-6">
          <Shield className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Доступ запрещен</h1>
        <p className="text-gray-600 mb-6">
          У вас нет прав доступа к запрашиваемому ресурсу.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            На главную
          </Button>
          <Button 
            variant="destructive"
            onClick={handleLogout}
          >
            Выйти из системы
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
