import { useAuth } from "@/lib/auth";
import { 
  useGetAnalyticsSummary, 
  useListAlerts, 
  useListShortages, 
  useListOrders 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, PackageOpen, ShoppingCart, TrendingUp, Building2, Package } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: summary, isLoading: isLoadingSummary } = useGetAnalyticsSummary();
  const { data: alerts, isLoading: isLoadingAlerts } = useListAlerts();
  const { data: shortages, isLoading: isLoadingShortages } = useListShortages();
  const { data: orders, isLoading: isLoadingOrders } = useListOrders();

  const criticalAlerts = alerts?.filter(a => a.severity === 'critical' && !a.resolved) || [];
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground mt-1">Here is the latest from the network command center.</p>
      </div>

      {(user?.role === 'admin' || user?.role === 'manager') && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network Locations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-2xl font-bold">{summary?.totalLocations || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {summary?.totalWarehouses} Hubs • {summary?.totalMicroWarehouses} Local Partner Shops
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-2xl font-bold">{(summary?.totalUnits || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Across {summary?.totalProducts} SKUs</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-destructive">Critical Shortages</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-2xl font-bold text-destructive">{summary?.criticalShortages || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Requires immediate action</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? <Skeleton className="h-8 w-20" /> : (
                <>
                  <div className="text-2xl font-bold">{summary?.ordersByStatus?.filter(s => ["pending","dispatched","in_transit"].includes(s.status)).reduce((a,b) => a + b.count, 0) ?? 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">Pending & In Transit</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Critical Alerts
                </CardTitle>
                <Link href="/alerts" className="text-sm text-primary hover:underline">View all</Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAlerts ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : criticalAlerts.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <span className="bg-muted px-3 py-1 rounded-full text-sm">No critical alerts</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {criticalAlerts.slice(0, 5).map(alert => (
                    <div key={alert.id} className="flex items-start gap-3 pb-4 border-b last:pb-0 last:border-0">
                      <div className="w-2 h-2 mt-2 rounded-full bg-destructive shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Recent Orders
              </CardTitle>
              <Link href="/orders" className="text-sm text-primary hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingOrders ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !orders || orders.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <span className="bg-muted px-3 py-1 rounded-full text-sm">No recent orders</span>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between pb-4 border-b last:pb-0 last:border-0">
                    <div>
                      <p className="text-sm font-medium">#{order.id} - {order.productName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {order.quantity} units • {order.customerName}
                      </p>
                    </div>
                    <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className="capitalize">
                      {order.status.replace('_', ' ')}
                    </Badge>
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