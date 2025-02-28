
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Search, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useInventory } from "@/hooks/use-inventory";
import { useLocations } from "@/hooks/use-locations";
import { useSales } from "@/hooks/use-sales";

type CartItem = {
  id: string;
  productId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
};

const Sales = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { inventory, updateProductQuantity } = useInventory();
  const { locations } = useLocations();
  const { addSale } = useSales();
  
  const [selectedLocation, setSelectedLocation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [saleComplete, setSaleComplete] = useState(false);
  
  // Reset completion state when changing locations
  useEffect(() => {
    setSaleComplete(false);
    setCart([]);
  }, [selectedLocation]);

  const filteredInventory = inventory.filter((item) => {
    return (
      item.locationId === selectedLocation &&
      item.quantity > 0 &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getLocationName = (id: string) => {
    const location = locations.find(loc => loc.id === id);
    return location ? location.name : "";
  };

  const getSizeLabel = (size: string) => {
    return size === "car" ? "Автофлакон" : `${size} мл`;
  };

  const getProductPrice = (size: string) => {
    // Example pricing structure
    const prices: Record<string, number> = {
      "5": 700,
      "16": 1500,
      "20": 1800,
      "30": 2500,
      "car": 500
    };
    return prices[size] || 0;
  };

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.quantity) {
        setCart(cart.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        ));
      } else {
        toast({
          title: "Ошибка",
          description: "Недостаточно товара на складе",
          variant: "destructive"
        });
      }
    } else {
      setCart([
        ...cart, 
        {
          id: Date.now().toString(),
          productId: product.id,
          name: product.name,
          size: product.size,
          price: getProductPrice(product.size),
          quantity: 1
        }
      ]);
    }
  };

  const decreaseQuantity = (cartItemId: string) => {
    setCart(cart.map(item => 
      item.id === cartItemId 
        ? { ...item, quantity: Math.max(1, item.quantity - 1) } 
        : item
    ));
  };

  const increaseQuantity = (cartItemId: string) => {
    const cartItem = cart.find(item => item.id === cartItemId);
    if (!cartItem) return;
    
    const product = inventory.find(p => p.id === cartItem.productId);
    if (!product) return;
    
    if (cartItem.quantity < product.quantity) {
      setCart(cart.map(item => 
        item.id === cartItemId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      toast({
        title: "Ошибка",
        description: "Недостаточно товара на складе",
        variant: "destructive"
      });
    }
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter(item => item.id !== cartItemId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const completeSale = () => {
    if (cart.length === 0) {
      toast({
        title: "Ошибка",
        description: "Корзина пуста",
        variant: "destructive"
      });
      return;
    }

    if (!selectedLocation) {
      toast({
        title: "Ошибка",
        description: "Выберите точку продажи",
        variant: "destructive"
      });
      return;
    }

    // Update inventory
    cart.forEach(item => {
      const product = inventory.find(p => p.id === item.productId);
      if (product) {
        updateProductQuantity(item.productId, product.quantity - item.quantity);
      }
    });

    // Record the sale
    addSale({
      id: Date.now().toString(),
      locationId: selectedLocation,
      items: cart.map(item => ({
        productId: item.productId,
        name: item.name,
        size: item.size,
        price: item.price,
        quantity: item.quantity
      })),
      total: calculateTotal(),
      date: new Date().toISOString()
    });

    toast({
      title: "Успех",
      description: "Продажа успешно завершена"
    });

    setSaleComplete(true);
  };

  const startNewSale = () => {
    setCart([]);
    setSaleComplete(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <div className="mb-6">
                  <Label htmlFor="location">Точка продажи</Label>
                  <Select
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
                  >
                    <SelectTrigger id="location" className="w-full">
                      <SelectValue placeholder="Выберите точку продажи" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.length === 0 ? (
                        <SelectItem value="" disabled>
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

                {selectedLocation && !saleComplete && (
                  <>
                    <div className="mb-6">
                      <Label htmlFor="search">Поиск товаров</Label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="search"
                          type="text"
                          placeholder="Поиск по названию..."
                          className="pl-9"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {filteredInventory.length === 0 ? (
                        <div className="md:col-span-2 text-center py-10 text-gray-500">
                          {searchTerm 
                            ? "Нет товаров, соответствующих запросу" 
                            : "Нет доступных товаров в этой точке продажи"}
                        </div>
                      ) : (
                        filteredInventory.map((product) => (
                          <div 
                            key={product.id}
                            className="bg-white rounded-lg border border-gray-200 p-4 flex justify-between items-center hover:shadow-sm transition-shadow"
                          >
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <span>{getSizeLabel(product.size)}</span>
                                <span>•</span>
                                <span>Остаток: {product.quantity}</span>
                              </div>
                              <p className="font-medium text-gray-900 mt-2">
                                {getProductPrice(product.size).toLocaleString()} ₽
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => addToCart(product)}
                              className="bg-gray-900 hover:bg-black text-white"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}

                {saleComplete && (
                  <div className="text-center py-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                      <ShoppingBag className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Продажа завершена</h3>
                    <p className="text-gray-500 mb-6">
                      Продажа успешно проведена. Инвентарь обновлен.
                    </p>
                    <Button onClick={startNewSale}>Новая продажа</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="shadow-sm border border-gray-100 sticky top-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Корзина
                </h2>

                {selectedLocation ? (
                  <>
                    <p className="text-sm text-gray-500 mb-4">
                      Точка: {getLocationName(selectedLocation)}
                    </p>

                    {cart.length === 0 ? (
                      <div className="text-center py-10 text-gray-500">
                        Корзина пуста
                      </div>
                    ) : (
                      <div>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto py-2">
                          {cart.map((item) => (
                            <div key={item.id} className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                  {getSizeLabel(item.size)} • {item.price.toLocaleString()} ₽
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-7 w-7"
                                  onClick={() => decreaseQuantity(item.id)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-6 text-center">{item.quantity}</span>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-7 w-7"
                                  onClick={() => increaseQuantity(item.id)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 text-gray-400 hover:text-red-500"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-2 mb-6">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Количество товаров</span>
                            <span>
                              {cart.reduce((total, item) => total + item.quantity, 0)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center font-medium">
                            <span>Итого</span>
                            <span>{calculateTotal().toLocaleString()} ₽</span>
                          </div>
                        </div>

                        <Button 
                          className="w-full bg-gray-900 hover:bg-black"
                          onClick={completeSale}
                          disabled={cart.length === 0 || saleComplete}
                        >
                          Завершить продажу
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    Выберите точку продажи
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
