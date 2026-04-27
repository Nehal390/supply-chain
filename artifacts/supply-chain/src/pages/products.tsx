import { useState } from "react";
import { useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search, Box, Pencil, Trash2, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  unitPrice: z.coerce.number().min(0, "Price must be positive"),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export default function Products() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useListProducts();
  const [search, setSearch] = useState("");
  
  const createMutation = useCreateProduct({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }) }
  });

  const updateMutation = useUpdateProduct({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }) }
  });

  const deleteMutation = useDeleteProduct({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }) }
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", sku: "", category: "", unitPrice: 0, imageUrl: ""
    },
  });

  const openCreate = () => {
    setEditingId(null);
    form.reset({ name: "", sku: "", category: "", unitPrice: 0, imageUrl: "" });
    setDialogOpen(true);
  };

  const openEdit = (product: any) => {
    setEditingId(product.id);
    form.reset({
      name: product.name, sku: product.sku, category: product.category, unitPrice: product.unitPrice, imageUrl: product.imageUrl || ""
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload = {
      ...values,
      imageUrl: values.imageUrl || null,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createMutation.mutate({ data: payload }, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const filtered = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Catalog</h1>
          <p className="text-muted-foreground">Manage SKUs and product details across the network.</p>
        </div>

        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="gap-2" data-testid="button-create-product">
                <Plus className="w-4 h-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'Add'} Product</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} data-testid="input-name" /></FormControl><FormMessage/></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="sku" render={({ field }) => (
                      <FormItem><FormLabel>SKU</FormLabel><FormControl><Input {...field} data-testid="input-sku" /></FormControl><FormMessage/></FormItem>
                    )} />
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} data-testid="input-category" /></FormControl><FormMessage/></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="unitPrice" render={({ field }) => (
                    <FormItem><FormLabel>Unit Price (₹)</FormLabel><FormControl><Input type="number" step="0.01" {...field} data-testid="input-price" /></FormControl><FormMessage/></FormItem>
                  )} />
                  <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem><FormLabel>Image URL (Optional)</FormLabel><FormControl><Input {...field} placeholder="https://..." data-testid="input-image" /></FormControl><FormMessage/></FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit">
                    {editingId ? 'Save Changes' : 'Create Product'}
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
          placeholder="Search products by name, SKU, or category..." 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
          data-testid="input-search"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-xl p-4 space-y-3 bg-card">
              <div className="flex gap-4">
                <Skeleton className="w-16 h-16 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground border rounded-xl bg-card">
            No products found.
          </div>
        ) : (
          filtered.map((product) => (
            <div key={product.id} className="border rounded-xl p-4 bg-card hover:border-primary/30 transition-colors flex flex-col group">
              <div className="flex gap-4 items-start">
                <div className="w-16 h-16 shrink-0 rounded-md bg-muted border overflow-hidden flex items-center justify-center">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Box className="w-8 h-8 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate" title={product.name}>{product.name}</h3>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1 truncate">
                    <Tag className="w-3 h-3" /> {product.sku}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{product.category}</Badge>
                    <span className="font-semibold text-primary">₹{product.unitPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <div className="mt-4 pt-4 border-t flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm" onClick={() => openEdit(product)} data-testid={`button-edit-${product.id}`}>
                    <Pencil className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  {user?.role === 'admin' && (
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
                      if (confirm("Delete this product?")) {
                        deleteMutation.mutate({ id: product.id });
                      }
                    }} data-testid={`button-delete-${product.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
