import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { type Complaint } from "@/lib/api";

// Fix for default marker icons in React-Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/**
 * Custom hook/component to update map center and zoom
 */
const MapUpdater = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

interface LiveMapProps {
  complaints: Complaint[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  onMarkerClick?: (complaint: Complaint) => void;
}

const LiveMap = ({ 
  complaints, 
  center = [28.6139, 77.209], // Default: New Delhi
  zoom = 13,
  className = "h-full w-full rounded-2xl",
  onMarkerClick
}: LiveMapProps) => {

  return (
    <div className={className}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="h-full w-full rounded-[inherit]"
      >
        <TileLayer
          // Modern Dark Theme (Stadia Maps Alidade Smooth Dark)
          // Stadia tiles are free for non-commercial but need registration.
          // Using CartoDB Voyager as a safe, beautiful alternative
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater center={center} zoom={zoom} />
        
        {complaints.map((complaint) => (
          <Marker 
            key={complaint.id} 
            position={[complaint.latitude, complaint.longitude]}
            eventHandlers={{
              click: () => onMarkerClick?.(complaint),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1 max-w-[200px]">
                {complaint.image_url && (
                    <img 
                      src={complaint.image_url} 
                      alt={complaint.title}
                      className="w-full h-24 object-cover rounded-md mb-2"
                    />
                )}
                <h4 className="font-bold text-sm mb-1">{complaint.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{complaint.description}</p>
                <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        complaint.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        complaint.status === 'verified' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                        {complaint.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground italic">#{complaint.id}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
