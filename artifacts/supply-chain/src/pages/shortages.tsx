import { useState } from "react";
import { useListShortages } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle, ArrowRight, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Shortages() {
  const [search, setSearch] = useState("");
  const { data: shortages, isLoading } = useListShortages();

  const filtered = shortages?.filter(s => 
    s.productName.toLowerCase().includes(search.toLowerCase()) || 
    s.locationName.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-destructive flex items-center gap-2">
            <AlertTriangle className="w-8 h-8" />
            Critical Shortages
          </h1>
          <p className="text-muted-foreground">Inventory below minimum thresholds — resolved by nearby Local Partner Shops with excess inventory.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm relative">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3" />
        <Input 
          placeholder="Search shortages..." 
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
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">Shortfall</TableHead>
              <TableHead>Nearby Shop with Excess Inventory</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No critical shortages found. The network is healthy.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className="bg-destructive/5">
                  <TableCell className="font-medium">
                    <div>{item.locationName}</div>
                    <div className="text-xs text-muted-foreground">{item.locationCity}, {item.locationState}</div>
                  </TableCell>
                  <TableCell>
                    <div>{item.productName}</div>
                    <div className="text-xs text-muted-foreground">SKU: {item.productSku} • {item.productCategory}</div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-destructive">
                    {item.quantity.toLocaleString()} <span className="text-xs font-normal">/ {item.threshold}</span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-destructive">
                    {item.shortfall.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {item.nearestAlternativeName ? (
                      <div className="flex items-center gap-3 bg-background border p-2 rounded-md">
                        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div>
                          <div className="text-sm font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-primary" /> {item.nearestAlternativeName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.nearestAlternativeDistanceKm}km away
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">No nearby source</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
