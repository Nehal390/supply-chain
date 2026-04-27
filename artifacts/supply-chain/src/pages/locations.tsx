import { useState } from "react";
import { useListLocations, useCreateLocation, useUpdateLocation, useDeleteLocation, getListLocationsQueryKey } from "@workspace/api-client-react";
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
import { Plus, Search, MapPin, Building2, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["warehouse", "micro"]),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  address: z.string().min(1, "Address is required"),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  capacity: z.coerce.number().min(1, "Capacity must be positive"),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
});

export default function Locations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: locations, isLoading } = useListLocations();
  const [search, setSearch] = useState("");
  
  const createMutation = useCreateLocation({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListLocationsQueryKey() })
    }
  });

  const updateMutation = useUpdateLocation({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListLocationsQueryKey() })
    }
  });

  const deleteMutation = useDeleteLocation({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListLocationsQueryKey() })
    }
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", type: "warehouse", city: "", state: "", address: "", lat: 0, lng: 0, capacity: 1000, contactName: "", contactPhone: ""
    },
  });

  const openCreate = () => {
    setEditingId(null);
    form.reset({ name: "", type: "warehouse", city: "", state: "", address: "", lat: 0, lng: 0, capacity: 1000, contactName: "", contactPhone: "" });
    setDialogOpen(true);
  };

  const openEdit = (loc: any) => {
    setEditingId(loc.id);
    form.reset({
      name: loc.name, type: loc.type, city: loc.city, state: loc.state, address: loc.address,
      lat: loc.lat, lng: loc.lng, capacity: loc.capacity, contactName: loc.contactName || "", contactPhone: loc.contactPhone || ""
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: values }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createMutation.mutate({ data: values }, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const filtered = locations?.filter(loc => 
    loc.name.toLowerCase().includes(search.toLowerCase()) || 
    loc.city.toLowerCase().includes(search.toLowerCase()) ||
    loc.state.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
          <p className="text-muted-foreground">Manage warehouses and micro-fulfillment centers.</p>
        </div>

        {user?.role === 'admin' && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="gap-2" data-testid="button-create-location">
                <Plus className="w-4 h-4" /> Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'Add'} Location</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} data-testid="input-name" /></FormControl><FormMessage/></FormItem>
                    )} />
                    <FormField control={form.control} name="type" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger data-testid="select-type"><SelectValue/></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="warehouse">Warehouse</SelectItem>
                            <SelectItem value="micro">Micro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage/>
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} data-testid="input-city" /></FormControl><FormMessage/></FormItem>
                    )} />
                    <FormField control={form.control} name="state" render={({ field }) => (
                      <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} data-testid="input-state" /></FormControl><FormMessage/></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} data-testid="input-address" /></FormControl><FormMessage/></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="lat" render={({ field }) => (
                      <FormItem><FormLabel>Latitude</FormLabel><FormControl><Input type="number" step="any" {...field} data-testid="input-lat" /></FormControl><FormMessage/></FormItem>
                    )} />
                    <FormField control={form.control} name="lng" render={({ field }) => (
                      <FormItem><FormLabel>Longitude</FormLabel><FormControl><Input type="number" step="any" {...field} data-testid="input-lng" /></FormControl><FormMessage/></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="capacity" render={({ field }) => (
                    <FormItem><FormLabel>Capacity (Units)</FormLabel><FormControl><Input type="number" {...field} data-testid="input-capacity" /></FormControl><FormMessage/></FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit">
                    {editingId ? 'Save Changes' : 'Create Location'}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground absolute ml-3" />
        <Input 
          placeholder="Search locations..." 
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
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>City/State</TableHead>
              <TableHead className="text-right">Capacity</TableHead>
              <TableHead className="text-right">Units</TableHead>
              <TableHead className="text-right">Util.</TableHead>
              <TableHead className="text-center">Status</TableHead>
              {user?.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-5 w-16 mx-auto" /></TableCell>
                  {user?.role === 'admin' && <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={user?.role === 'admin' ? 8 : 7} className="text-center py-8 text-muted-foreground">
                  No locations found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {loc.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{loc.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {loc.city}, {loc.state}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{loc.capacity.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">{loc.totalUnits.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{Math.round(loc.utilizationPct)}%</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={loc.stockStatus === 'healthy' ? 'default' : loc.stockStatus === 'critical' ? 'destructive' : 'secondary'}>
                      {loc.stockStatus}
                    </Badge>
                  </TableCell>
                  {user?.role === 'admin' && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(loc)} data-testid={`button-edit-${loc.id}`}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => {
                          if (confirm("Delete this location?")) {
                            deleteMutation.mutate({ id: loc.id });
                          }
                        }} data-testid={`button-delete-${loc.id}`}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
