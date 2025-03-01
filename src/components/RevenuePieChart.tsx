
import { useMemo } from "react";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { useSales } from "@/hooks/use-sales";
import { useLocations } from "@/hooks/use-locations";

interface RevenuePieChartProps {
  className?: string;
}

export const RevenuePieChart = ({ className }: RevenuePieChartProps) => {
  const { sales } = useSales();
  const { locations } = useLocations();
  
  // Цвета для диаграммы
  const COLORS = [
    '#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#8884D8', 
    '#FF6B6B', '#4BC0C0', '#A3A1FB', '#FFCE56', '#FF9F40'
  ];
  
  // Данные для диаграммы
  const chartData = useMemo(() => {
    const currentDate = new Date();
    const currentMonthStart = startOfMonth(currentDate);
    const currentMonthEnd = currentDate;
    
    // Фильтруем продажи за текущий месяц
    const currentMonthSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= currentMonthStart && saleDate <= currentMonthEnd;
    });
    
    // Группируем выручку по точкам
    const revenueByLocation = new Map<string, number>();
    
    currentMonthSales.forEach(sale => {
      const locationId = sale.locationId;
      const currentRevenue = revenueByLocation.get(locationId) || 0;
      revenueByLocation.set(locationId, currentRevenue + sale.total);
    });
    
    // Создаем данные для диаграммы
    const data = [];
    
    for (const [locationId, revenue] of revenueByLocation.entries()) {
      const location = locations.find(loc => loc.id === locationId);
      
      if (location) {
        data.push({
          name: location.name,
          value: revenue,
          locationId
        });
      }
    }
    
    // Сортируем по убыванию выручки
    return data.sort((a, b) => b.value - a.value);
  }, [sales, locations]);
  
  // Если нет данных, не показываем диаграмму
  if (chartData.length === 0) {
    return null;
  }
  
  // Форматирование подписей для диаграммы
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  // Форматирование всплывающих подсказок
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 p-2 rounded shadow-lg text-sm">
          <p className="font-semibold">{payload[0].name}</p>
          <p>
            Выручка: {new Intl.NumberFormat('ru-RU').format(payload[0].value)} ₽
          </p>
          <p>
            Доля: {(payload[0].payload.percent * 100).toFixed(1)}%
          </p>
        </div>
      );
    }

    return null;
  };
  
  // Вычисляем общую выручку
  const totalRevenue = chartData.reduce((sum, item) => sum + item.value, 0);
  
  // Добавляем проценты к данным для отображения
  const dataWithPercent = chartData.map(item => ({
    ...item,
    percent: item.value / totalRevenue
  }));

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5 text-brand-gold" />
          Распределение выручки по точкам
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(), 'LLLL yyyy')}
            </p>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat('ru-RU').format(totalRevenue)} ₽
            </p>
          </div>
        </div>
        
        <div className="w-full h-[300px] overflow-x-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithPercent}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {dataWithPercent.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                formatter={(value, entry, index) => (
                  <span className="text-sm">
                    {value} - {new Intl.NumberFormat('ru-RU').format(chartData[index].value)} ₽
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
