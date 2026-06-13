import { useState } from "react";
import { useListLocations, useGetLocation, getGetLocationQueryKey, LocationWithStats } from "@workspace/api-client-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Building2, Package, AlertTriangle } from "lucide-react";

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function createCustomIcon(status: string, type: string) {
  const color = status === 'critical' ? '#dc2626' : status === 'low' ? '#f59e0b' : '#16a34a';
  const shape = type === 'warehouse' ? '50%' : '10%';
  
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: ${shape}; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function LocationDetailPanel({ locationId, open, onOpenChange }: { locationId: number | null, open: boolean, onOpenChange: (o: boolean) => void }) {
  const { data: location, isLoading } = useGetLocation(locationId || 0, {
    query: {
      enabled: !!locationId && open,
      queryKey: getGetLocationQueryKey(locationId || 0)
    }
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4 pt-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ) : location ? (
          <>
            <SheetHeader className="mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <SheetTitle className="text-2xl flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                    {location.name}
                  </SheetTitle>
                  <SheetDescription>{location.city}, {location.state}</SheetDescription>
                </div>
                <Badge variant={location.stockStatus === 'healthy' ? 'default' : location.stockStatus === 'critical' ? 'destructive' : 'secondary'}>
                  {location.stockStatus}
                </Badge>
              </div>
            </SheetHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Units</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">{location.totalUnits.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground mt-1">Utilization: {Math.round(location.utilizationPct)}%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Unique SKUs</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">{location.distinctSkus}</div>
                    <div className="text-xs text-muted-foreground mt-1">Capacity: {location.capacity.toLocaleString()}</div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Inventory List
                </h3>
                <div className="space-y-3">
                  {location.inventory && location.inventory.length > 0 ? (
                    location.inventory.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
                        <div>
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-xs text-muted-foreground">{item.productSku}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${item.quantity <= item.threshold ? 'text-destructive' : ''}`}>
                            {item.quantity.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">/ {item.threshold} min</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg text-center">
                      No inventory at this location.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="pt-6 text-center text-muted-foreground">Failed to load location details.</div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function MapView() {
  const { data: locations, isLoading } = useListLocations();
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const handleMarkerClick = (id: number) => {
    setSelectedLocationId(id);
    setPanelOpen(true);
  };

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Network Map</h1>
        <p className="text-muted-foreground">Live view of Distribution Hubs and Local Partner Shops across India.</p>
      </div>

      <Card className="flex-1 overflow-hidden border-primary/20 shadow-md">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-muted/20">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <MapContainer 
            center={[22.5, 80]} 
            zoom={5} 
            className="w-full h-full z-0"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {locations?.map((loc) => (
              <Marker 
                key={loc.id} 
                position={[loc.lat, loc.lng]}
                icon={createCustomIcon(loc.stockStatus, loc.type)}
                eventHandlers={{
                  click: () => handleMarkerClick(loc.id)
                }}
              >
                <Popup className="rounded-xl overflow-hidden">
                  <div className="font-semibold text-base mb-1">{loc.name}</div>
                  <div className="text-xs text-muted-foreground mb-2">{loc.city}, {loc.state}</div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-[10px]">{loc.type === "micro" ? "Local Partner Shop" : "Distribution Hub"}</Badge>
                    <Badge 
                      variant={loc.stockStatus === 'healthy' ? 'default' : loc.stockStatus === 'critical' ? 'destructive' : 'secondary'}
                      className="text-[10px]"
                    >
                      {loc.stockStatus}
                    </Badge>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </Card>

      <LocationDetailPanel 
        locationId={selectedLocationId} 
        open={panelOpen} 
        onOpenChange={setPanelOpen} 
      />
    </div>
  );
}