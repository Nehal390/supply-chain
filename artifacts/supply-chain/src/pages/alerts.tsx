import { useState } from "react";
import { useListAlerts, useResolveAlert, getListAlertsQueryKey, AlertSeverity } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, AlertCircle, Info, CheckCircle2, MapPin, Box } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Alerts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("active");
  
  const { data: alerts, isLoading } = useListAlerts();
  
  const resolveMutation = useResolveAlert({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAlertsQueryKey() })
    }
  });

  const filtered = alerts?.filter(a => {
    const matchesSearch = 
      a.message.toLowerCase().includes(search.toLowerCase()) ||
      a.locationName?.toLowerCase().includes(search.toLowerCase()) ||
      a.productName?.toLowerCase().includes(search.toLowerCase());
    
    if (statusTab === "active") return matchesSearch && !a.resolved;
    if (statusTab === "resolved") return matchesSearch && a.resolved;
    return matchesSearch;
  }) || [];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      case 'warning': return <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white">Warning</Badge>;
      default: return <Badge variant="secondary">Info</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Alerts</h1>
          <p className="text-muted-foreground">Monitor and resolve network incidents and stock warnings.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:max-w-sm relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3" />
          <Input 
            placeholder="Search alerts..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <Tabs value={statusTab} onValueChange={setStatusTab} className="w-full sm:w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" data-testid="tab-active">Active</TabsTrigger>
            <TabsTrigger value="resolved" data-testid="tab-resolved">Resolved</TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Context</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-5 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full max-w-[300px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mb-4 opacity-50" />
                    <p>No alerts found matching your criteria.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((alert) => (
                <TableRow key={alert.id} className={alert.severity === 'critical' && !alert.resolved ? 'bg-destructive/5' : ''}>
                  <TableCell>
                    {getSeverityIcon(alert.severity)}
                  </TableCell>
                  <TableCell>
                    {getSeverityBadge(alert.severity)}
                  </TableCell>
                  <TableCell className="font-medium">
                    <span className={alert.resolved ? 'text-muted-foreground line-through' : ''}>
                      {alert.message}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {alert.locationName && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" /> {alert.locationName}
                        </div>
                      )}
                      {alert.productName && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Box className="w-3 h-3" /> {alert.productName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(alert.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {!alert.resolved && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                        disabled={resolveMutation.isPending}
                        onClick={() => resolveMutation.mutate({ id: alert.id })}
                        data-testid={`button-resolve-${alert.id}`}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Resolve
                      </Button>
                    )}
                    {alert.resolved && (
                      <span className="text-xs font-medium text-green-600 flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Resolved
                      </span>
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