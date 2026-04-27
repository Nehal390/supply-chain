import { useGetAnalyticsSummary, useGetInventoryTrends, useGetDemandByRegion, useGetRegionHeatmap, useGetDeliveryEfficiency, useGetDemandForecast } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from "recharts";
import { Badge } from "@/components/ui/badge";

export default function Analytics() {
  const { data: summary, isLoading: isLoadingSummary } = useGetAnalyticsSummary();
  const { data: trends, isLoading: isLoadingTrends } = useGetInventoryTrends({ days: 14 });
  const { data: demandByRegion, isLoading: isLoadingDemand } = useGetDemandByRegion();
  const { data: heatmap, isLoading: isLoadingHeatmap } = useGetRegionHeatmap();
  const { data: efficiency, isLoading: isLoadingEfficiency } = useGetDeliveryEfficiency();
  const { data: forecast, isLoading: isLoadingForecast } = useGetDemandForecast();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Forecasting</h1>
        <p className="text-muted-foreground">Network performance, trends, and predictive demand.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">On-Time Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingEfficiency ? <Skeleton className="h-8 w-20" /> : (
              <>
                <div className="text-2xl font-bold">{efficiency?.onTimePct.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Average over 30 days</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Delivery Time</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingEfficiency ? <Skeleton className="h-8 w-20" /> : (
              <>
                <div className="text-2xl font-bold">{Math.round((efficiency?.avgEtaMinutes || 0) / 60)} hrs</div>
                <p className="text-xs text-muted-foreground mt-1">From order to delivery</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Micro-Fulfillment Share</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-20" /> : (
              <>
                <div className="text-2xl font-bold">{Math.round(summary?.microWarehouseSharePct || 0)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Orders served from micro-hubs</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-20" /> : (
              <>
                <div className="text-2xl font-bold">₹{(summary?.revenue || 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Total value delivered</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Inventory Trends */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Inventory Health (14 Days)</CardTitle>
            <CardDescription>Total units vs critical shortages</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoadingTrends ? <Skeleton className="w-full h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickMargin={10}
                  />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(val) => `${val/1000}k`} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--destructive))" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="totalUnits" name="Total Units" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUnits)" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="shortagesCount" name="Shortages" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Demand by Region */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Demand by State</CardTitle>
            <CardDescription>Order volume across regions</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoadingDemand ? <Skeleton className="w-full h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demandByRegion} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="state" stroke="hsl(var(--muted-foreground))" fontSize={12} tickMargin={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
                  <Bar dataKey="ordersCount" name="Orders" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Delivery Efficiency */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Delivery Efficiency</CardTitle>
            <CardDescription>Average delivery time vs order volume</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoadingEfficiency ? <Skeleton className="w-full h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={efficiency?.byDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickMargin={10}
                  />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-3))" fontSize={12} tickFormatter={(val) => `${Math.round(val/60)}h`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="ordersCount" name="Orders" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} barSize={20} />
                  <Line yAxisId="right" type="monotone" dataKey="avgEtaMinutes" name="Avg ETA" stroke="hsl(var(--chart-3))" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Demand Forecast */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Demand Forecast (Next 7 Days)</CardTitle>
            <CardDescription>Predicted order volume for top SKUs</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] overflow-y-auto pr-4">
            {isLoadingForecast ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : forecast?.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Not enough data for forecasting.
              </div>
            ) : (
              <div className="space-y-6">
                {forecast?.map((item) => (
                  <div key={item.productId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold truncate pr-4" title={item.productName}>{item.productName}</h4>
                      {item.daysUntilStockout && item.daysUntilStockout <= 7 && (
                        <Badge variant="destructive" className="text-[10px]">Stockout in {item.daysUntilStockout}d</Badge>
                      )}
                    </div>
                    <div className="h-[80px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={item.forecast}>
                          <Tooltip 
                            contentStyle={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px' }}
                            labelFormatter={(val) => new Date(val).toLocaleDateString()}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="expectedDemand" 
                            name="Predicted Demand"
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2} 
                            dot={{ r: 2 }}
                            activeDot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}