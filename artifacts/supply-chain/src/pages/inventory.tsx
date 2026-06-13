import { useState } from "react";
import { useListInventory, useCreateInventory, useUpdateInventory, useDeleteInventory, useListLocations, useListProducts, getListInventoryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search, MapPin, Box, Pencil, Trash2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";

const formSchema = z.object({
  productId: z.coerce.number().min(1, "Product is required"),
  locationId: z.coerce.number().min(1, "Location is required"),
  quantity: z.coerce.number().min(0, "Quantity must be positive"),
  threshold: z.coerce.number().min(0, "Threshold must be positive"),
});

export default function Inventory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  
  const locationIdParam = filterLocation !== "all" ? Number(filterLocation) : undefined;
  const { data: inventory, isLoading } = useListInventory(
    { locationId: locationIdParam },
    { query: { queryKey: getListInventoryQueryKey({ locationId: locationIdParam }) } }
  );

  const { data: locations } = useListLocations();
  const { data: products } = useListProducts();
  
  const createMutation = useCreateInventory({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey() }) }
  });

  const updateMutation = useUpdateInventory({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey() }) }
  });

  const deleteMutation = useDeleteInventory({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey() }) }
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: 0, locationId: 0, quantity: 0, threshold: 0
    },
  });

  const openCreate = () => {
    setEditingId(null);
    form.reset({ productId: 0, locationId: 0, quantity: 0, threshold: 0 });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    form.reset({
      productId: item.productId, locationId: item.locationId, quantity: item.quantity, threshold: item.threshold
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { quantity: values.quantity, threshold: values.threshold } }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createMutation.mutate({ data: values }, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const filtered = inventory?.filter(item => 
    item.productName.toLowerCase().includes(search.toLowerCase()) || 
    item.productSku.toLowerCase().includes(search.toLowerCase()) ||
    item.locationName.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage stock levels across all locations.</p>
        </div>

        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="gap-2" data-testid="button-create-inventory">
                <Plus className="w-4 h-4" /> Add Inventory
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'Add'} Inventory Record</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="productId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? field.value.toString() : ""} disabled={!!editingId}>
                        <FormControl><SelectTrigger data-testid="select-product"><SelectValue placeholder="Select product"/></SelectTrigger></FormControl>
                        <SelectContent>
                          {products?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.sku})</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage/>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="locationId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? field.value.toString() : ""} disabled={!!editingId}>
                        <FormControl><SelectTrigger data-testid="select-location"><SelectValue placeholder="Select location"/></SelectTrigger></FormControl>
                        <SelectContent>
                          {locations?.map(l => <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage/>
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="quantity" render={({ field }) => (
                      <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} data-testid="input-quantity" /></FormControl><FormMessage/></FormItem>
                    )} />
                    <FormField control={form.control} name="threshold" render={({ field }) => (
                      <FormItem><FormLabel>Min Threshold</FormLabel><FormControl><Input type="number" {...field} data-testid="input-threshold" /></FormControl><FormMessage/></FormItem>
                    )} />
                  </div>
                  <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit">
                    {editingId ? 'Save Changes' : 'Create Record'}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:max-w-sm relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3" />
          <Input 
            placeholder="Search product or location..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <Select value={filterLocation} onValueChange={setFilterLocation}>
          <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-filter-location">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations?.map(loc => (
              <SelectItem key={loc.id} value={loc.id.toString()}>{loc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU / Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Threshold</TableHead>
              <TableHead className="text-center">Status</TableHead>
              {(user?.role === 'admin' || user?.role === 'manager') && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                  {(user?.role === 'admin' || user?.role === 'manager') && <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={user?.role === 'admin' || user?.role === 'manager' ? 7 : 6} className="text-center py-8 text-muted-foreground">
                  No inventory records found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className={item.quantity <= item.threshold ? "bg-destructive/5" : ""}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Box className="w-4 h-4 text-muted-foreground" />
                      {item.productName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{item.productSku}</div>
                    <div className="text-xs text-muted-foreground">{item.productCategory}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      {item.locationName}
                    </div>
                    <div className="text-xs text-muted-foreground ml-4">{item.locationCity}</div>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${item.quantity <= item.threshold ? 'text-destructive' : ''}`}>
                    {item.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {item.threshold.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.quantity <= item.threshold ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="w-3 h-3" /> Low Stock
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">Healthy</Badge>
                    )}
                  </TableCell>
                  {(user?.role === 'admin' || user?.role === 'manager') && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)} data-testid={`button-edit-${item.id}`}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {user?.role === 'admin' && (
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => {
                            if (confirm("Delete this inventory record?")) {
                              deleteMutation.mutate({ id: item.id });
                            }
                          }} data-testid={`button-delete-${item.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
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
