
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlusCircle, ArrowLeft, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useInventory, Product } from "@/hooks/use-inventory";
import { useLocations } from "@/hooks/use-locations";
import { useSales } from "@/hooks/use-sales";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";

interface CartItem extends Product {
  cartQuantity: number;
}

const Sales = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { inventory, updateProductQuantity } = useInventory();
  const { locations } = useLocations();
  const { recordSale } = useSales();
  const { isAdmin, isManager, isSeller } = useAuth();
  
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [saleComplete, setSaleComplete] = useState(false);
  
  // Reset selection if location is deleted
  useEffect(() => {
    if (selectedLocation && !locations.some(loc => loc.id === selectedLocation)) {
      setSelectedLocation("");
    }
  }, [locations, selectedLocation]);

  // Filter products by selected location and search term
  const filteredProducts = inventory.filter((product) => {
    const matchesLocation = !selectedLocation || product.locationId === selectedLocation;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLocation && matchesSearch && product.quantity > 0;
  });

  // Group products by name and size
  type GroupedProducts = {
    [key: string]: Product[];
  };

  const groupedProducts = filteredProducts.reduce<GroupedProducts>((acc, product) => {
    const key = `${product.name}-${product.size}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(product);
    return acc;
  }, {});

  // Add product to cart
  const addToCart = (product: Product) => {
    const existingItemIndex = cart.findIndex(
      item => item.id === product.id
    );

    if (existingItemIndex >= 0) {
      // Item already in cart, increment quantity
      if (cart[existingItemIndex].cartQuantity < product.quantity) {
        const updatedCart = [...cart];
        updatedCart[existingItemIndex].cartQuantity += 1;
        setCart(updatedCart);
      } else {
        toast({
          title: "Максимальное количество",
          description: "Вы выбрали все доступные единицы этого товара",
          variant: "destructive",
        });
      }
    } else {
      // Add new item to cart
      setCart([...cart, { ...product, cartQuantity: 1 }]);
    }
  };

  // Remove product from cart
  const removeFromCart = (productId: string) => {
    const existingItemIndex = cart.findIndex(
      item => item.id === productId
    );

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      if (updatedCart[existingItemIndex].cartQuantity > 1) {
        // Decrement quantity
        updatedCart[existingItemIndex].cartQuantity -= 1;
      } else {
        // Remove item from cart
        updatedCart.splice(existingItemIndex, 1);
      }
      setCart(updatedCart);
    }
  };

  // Delete product from cart completely
  const deleteFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      let price = 0;
      
      // Set price based on size
      switch (item.size) {
        case "5":
          price = 500;
          break;
        case "16":
          price = 1000;
          break;
        case "20":
          price = 1300;
          break;
        case "25":
          price = 1500;
          break;
        case "30":
          price = 1800;
          break;
        case "car":
          price = 500;
          break;
        default:
          price = 500;
      }
      
      return total + (price * item.cartQuantity);
    }, 0);
  };

  // Complete sale
  const completeSale = () => {
    if (cart.length === 0) return;

    // Update inventory quantities
    cart.forEach(item => {
      const newQuantity = item.quantity - item.cartQuantity;
      updateProductQuantity(item.id, newQuantity);
    });

    // Record the sale
    recordSale({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        size: item.size,
        quantity: item.cartQuantity,
        locationId: item.locationId,
      })),
      total: calculateTotal(),
    });

    toast({
      title: "Продажа завершена",
      description: "Товары успешно проданы и инвентарь обновлен",
    });

    setSaleComplete(true);
  };

  // Start a new sale
  const startNewSale = () => {
    setCart([]);
    setSearchTerm("");
    setSaleComplete(false);
  };

  // Функция для определения варианта кнопки в зависимости от роли пользователя
  const getButtonVariant = () => {
    if (isAdmin()) return "admin";
    if (isManager()) return "manager";
    return "seller";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-medium">Продажи</h1>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              {!saleComplete ? (
                <Card className="shadow-md border border-gray-100 bg-white">
                  <CardHeader>
                    <CardTitle>Выбрать товары</CardTitle>
                    <CardDescription>
                      Выберите точку продажи и добавьте товары
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location">Точка продажи</Label>
                          <Select
                            value={selectedLocation}
                            onValueChange={setSelectedLocation}
                          >
                            <SelectTrigger id="location">
                              <SelectValue placeholder="Выберите точку" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.length === 0 ? (
                                <SelectItem value="no-locations" disabled>
                                  Нет доступных точек
                                </SelectItem>
                              ) : (
                                locations.map((location) => (
                                  <SelectItem key={location.id} value={location.id}>
                                    {location.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="search">Поиск товара</Label>
                          <Input
                            id="search"
                            placeholder="Введите название..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </div>

                      {selectedLocation ? (
                        Object.keys(groupedProducts).length > 0 ? (
                          <div className="bg-gray-50 rounded-md overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[340px]">Название</TableHead>
                                  <TableHead>Объем</TableHead>
                                  <TableHead>Остаток</TableHead>
                                  <TableHead className="text-right">Добавить</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {Object.values(groupedProducts).flat().map((product) => (
                                  <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                      {product.name}
                                    </TableCell>
                                    <TableCell>
                                      {product.size === "car"
                                        ? "Автофлакон"
                                        : `${product.size} мл`}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline">{product.quantity}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        size="sm"
                                        onClick={() => addToCart(product)}
                                        variant={getButtonVariant()}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 rounded-md">
                            <p className="text-gray-500">
                              {searchTerm
                                ? "Нет товаров, соответствующих поиску"
                                : "Нет доступных товаров на выбранной точке"}
                            </p>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-md">
                          <p className="text-gray-500">
                            Выберите точку продажи, чтобы увидеть доступные товары
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-md border border-gray-100 bg-white">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="bg-green-100 text-green-800 p-3 rounded-full mb-4">
                        <ShoppingCart className="h-6 w-6" />
                      </div>
                      <h2 className="text-xl font-medium mb-2">Продажа завершена</h2>
                      <p className="text-gray-500 mb-6">
                        Продажа успешно проведена. Инвентарь обновлен.
                      </p>
                      <Button onClick={startNewSale} variant={getButtonVariant()}>
                        Новая продажа
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="h-fit"
            >
              <Card className="shadow-md border border-gray-100 bg-white h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Корзина
                  </CardTitle>
                  <CardDescription>
                    {cart.length === 0
                      ? "Корзина пуста"
                      : `${cart.length} ${
                          cart.length === 1 ? "товар" : "товаров"
                        } в корзине`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {cart.length > 0 ? (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                          <div className="flex-1">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              {item.size === "car"
                                ? "Автофлакон"
                                : `${item.size} мл`}{" "}
                              × {item.cartQuantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-6 text-center">
                              {item.cartQuantity}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => addToCart(item)}
                              disabled={item.cartQuantity >= item.quantity}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                              onClick={() => deleteFromCart(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      <div className="pt-4 border-t mt-4">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Итого:</span>
                          <span className="font-bold">
                            {calculateTotal().toLocaleString()} ₽
                          </span>
                        </div>
                        <div className="mt-4">
                          <Button
                            className="w-full"
                            onClick={completeSale}
                            disabled={cart.length === 0 || saleComplete}
                            variant={getButtonVariant()}
                          >
                            Завершить продажу
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <div className="bg-gray-100 text-gray-400 p-3 rounded-full mb-4">
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                      <p className="text-gray-500">
                        Добавьте товары, чтобы начать продажу
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
