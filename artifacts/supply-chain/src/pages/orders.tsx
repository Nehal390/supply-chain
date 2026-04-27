import { useState } from "react";
import { useListOrders, useCreateOrder, useUpdateOrderStatus, useSuggestFulfillment, useListProducts, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Search, ShoppingCart, Plus, MapPin, Truck, CheckCircle2, Clock, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";

const createOrderSchema = z.object({
  productId: z.coerce.number().min(1, "Product is required"),
  quantity: z.coerce.number().min(1, "Quantity must be positive"),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  deliveryCity: z.string().min(1, "Delivery city is required"),
  deliveryLat: z.coerce.number().min(-90).max(90),
  deliveryLng: z.coerce.number().min(-180).max(180),
});

export default function Orders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  
  const { data: orders, isLoading } = useListOrders({
    query: {
      queryKey: getListOrdersQueryKey({ customerId: user?.role === 'customer' ? user.id : undefined })
    },
    request: {
      // If the API requires query params, though it uses standard orval pattern
    }
  });

  const { data: products } = useListProducts();

  const suggestMutation = useSuggestFulfillment();
  const createMutation = useCreateOrder({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() }) }
  });
  const updateStatusMutation = useUpdateOrderStatus({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() }) }
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[] | null>(null);

  const form = useForm<z.infer<typeof createOrderSchema>>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      productId: 0, quantity: 1, deliveryAddress: "", deliveryCity: "", deliveryLat: 0, deliveryLng: 0
    },
  });

  const onSubmit = async (values: z.infer<typeof createOrderSchema>) => {
    if (!suggestions) {
      // Step 1: Get suggestions
      try {
        const result = await suggestMutation.mutateAsync({ data: values });
        setSuggestions(Array.isArray(result) ? result : [result]);
      } catch (err) {}
    } else {
      // Step 2: Create order (server will pick the best one anyway based on payload)
      createMutation.mutate({ 
        data: {
          ...values,
          customerId: user!.id,
        } 
      }, {
        onSuccess: () => {
          setDialogOpen(false);
          setSuggestions(null);
          form.reset();
        }
      });
    }
  };

  const resetForm = () => {
    setSuggestions(null);
    form.reset();
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'delivered': return <Badge className="bg-green-600 hover:bg-green-700 gap-1"><CheckCircle2 className="w-3 h-3"/> Delivered</Badge>;
      case 'in_transit': return <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 gap-1"><Truck className="w-3 h-3"/> In Transit</Badge>;
      case 'dispatched': return <Badge variant="secondary" className="gap-1"><Truck className="w-3 h-3"/> Dispatched</Badge>;
      case 'cancelled': return <Badge variant="destructive" className="gap-1">Cancelled</Badge>;
      default: return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3"/> Pending</Badge>;
    }
  };

  const filtered = orders?.filter(o => 
    o.productName?.toLowerCase().includes(search.toLowerCase()) || 
    o.id.toString().includes(search) ||
    o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    o.deliveryCity?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage and track fulfillment across the network.</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-create-order">
              <Plus className="w-4 h-4" /> New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Order</DialogTitle>
              <DialogDescription>
                {suggestions ? "Review fulfillment routing before confirming." : "Enter order details to find the best fulfillment source."}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {!suggestions ? (
                  <>
                    <FormField control={form.control} name="productId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? field.value.toString() : ""}>
                          <FormControl><SelectTrigger data-testid="select-product"><SelectValue placeholder="Select product"/></SelectTrigger></FormControl>
                          <SelectContent>
                            {products?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name} (₹{p.unitPrice})</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage/>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="quantity" render={({ field }) => (
                      <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} data-testid="input-quantity" /></FormControl><FormMessage/></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="deliveryAddress" render={({ field }) => (
                        <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} data-testid="input-address" /></FormControl><FormMessage/></FormItem>
                      )} />
                      <FormField control={form.control} name="deliveryCity" render={({ field }) => (
                        <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} data-testid="input-city" /></FormControl><FormMessage/></FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="deliveryLat" render={({ field }) => (
                        <FormItem><FormLabel>Delivery Lat</FormLabel><FormControl><Input type="number" step="any" {...field} data-testid="input-lat" /></FormControl><FormMessage/></FormItem>
                      )} />
                      <FormField control={form.control} name="deliveryLng" render={({ field }) => (
                        <FormItem><FormLabel>Delivery Lng</FormLabel><FormControl><Input type="number" step="any" {...field} data-testid="input-lng" /></FormControl><FormMessage/></FormItem>
                      )} />
                    </div>
                    <Button type="submit" className="w-full" disabled={suggestMutation.isPending} data-testid="button-suggest">
                      {suggestMutation.isPending ? "Routing..." : "Find Fulfillment Source"}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-md border bg-muted/30 p-4 space-y-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Truck className="w-4 h-4 text-primary" /> Routing Suggestions
                      </h4>
                      {suggestions.length > 0 ? (
                        <div className="space-y-2">
                          {suggestions.map((s, i) => (
                            <div key={i} className={`p-3 rounded-md border ${i === 0 ? 'bg-primary/5 border-primary/30' : 'bg-background'} flex justify-between items-center`}>
                              <div>
                                <div className="font-medium flex items-center gap-1">
                                  {i === 0 && <Check className="w-3 h-3 text-primary" />} {s.locationName}
                                </div>
                                <div className="text-xs text-muted-foreground">{s.distanceKm}km away • {s.availableQuantity} available</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold">{s.etaMinutes} mins</div>
                                <div className="text-xs text-muted-foreground">ETA</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-destructive">No fulfillment sources found with enough stock.</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" className="w-full" onClick={() => setSuggestions(null)}>
                        Back
                      </Button>
                      <Button type="submit" className="w-full" disabled={createMutation.isPending || suggestions.length === 0} data-testid="button-confirm-order">
                        Confirm Order
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 max-w-sm relative">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3" />
        <Input 
          placeholder="Search orders..." 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
          data-testid="input-search"
        />
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Total Price</TableHead>
              <TableHead className="text-center">Status</TableHead>
              {(user?.role === 'admin' || user?.role === 'manager') && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-5 w-20 mx-auto" /></TableCell>
                  {(user?.role === 'admin' || user?.role === 'manager') && <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={(user?.role === 'admin' || user?.role === 'manager') ? 8 : 7} className="text-center py-8 text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-muted-foreground">
                    #{order.id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.customerName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div>{order.productName}</div>
                        <div className="text-xs text-muted-foreground">Qty: {order.quantity}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      {order.deliveryCity}
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.sourceLocationName ? (
                      <div className="text-sm">
                        <div>{order.sourceLocationName}</div>
                        <div className="text-xs text-muted-foreground">{order.distanceKm}km • ETA {order.etaMinutes}m</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{order.totalPrice?.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(order.status)}
                  </TableCell>
                  {(user?.role === 'admin' || user?.role === 'manager') && (
                    <TableCell className="text-right">
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <Select 
                          value={order.status} 
                          onValueChange={(val: any) => {
                            updateStatusMutation.mutate({ id: order.id, data: { status: val } });
                          }}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs ml-auto" data-testid={`select-status-${order.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="dispatched">Dispatched</SelectItem>
                            <SelectItem value="in_transit">In Transit</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
