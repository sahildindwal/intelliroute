import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const locationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const turnIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const selectedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [30, 49],
    iconAnchor: [15, 49],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function MapBounds({ allLocations }) {
    const map = useMap();

    useEffect(() => {
        if (allLocations && allLocations.length > 0) {
            const validLocations = allLocations.filter(
                loc => loc.latitude && loc.longitude
            );
            
            if (validLocations.length > 0) {
                const bounds = L.latLngBounds(
                    validLocations.map(loc => [loc.latitude, loc.longitude])
                );
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [allLocations, map]);

    return null;
}

export default function PathViewMap({ 
    locations = [], 
    turns = [], 
    selectedLocationId = null,
    connectedLocationIds = [],
    height = '100%' 
}) {
    const allLocations = useMemo(() => [...locations, ...turns], [locations, turns]);
    
    const validLocations = useMemo(() => 
        allLocations.filter(loc => loc.latitude && loc.longitude),
        [allLocations]
    );

    const center = useMemo(() => {
        if (validLocations.length > 0) {
            return [validLocations[0].latitude, validLocations[0].longitude];
        }
        return [0, 0];
    }, [validLocations]);

    // Get selected location
    const selectedLocation = useMemo(() => 
        validLocations.find(loc => loc._id === selectedLocationId),
        [validLocations, selectedLocationId]
    );

    // Get connected locations
    const connectedLocations = useMemo(() => 
        validLocations.filter(loc => connectedLocationIds.includes(loc._id)),
        [validLocations, connectedLocationIds]
    );

    // Create polylines for connections
    const connectionLines = useMemo(() => {
        if (!selectedLocation) return [];
        
        return connectedLocations.map(connLoc => ({
            positions: [
                [selectedLocation.latitude, selectedLocation.longitude],
                [connLoc.latitude, connLoc.longitude]
            ],
            location: connLoc
        }));
    }, [selectedLocation, connectedLocations]);

    if (validLocations.length === 0) {
        return (
            <div style={{ 
                height, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#f0f0f0',
                borderRadius: '8px'
            }}>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>
                    No location coordinates available
                </p>
            </div>
        );
    }

    return (
        <MapContainer
            center={center}
            zoom={15}
            style={{ height, width: '100%', borderRadius: '12px' }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapBounds allLocations={validLocations} />

            {/* Draw connection lines */}
            {connectionLines.map((line, idx) => (
                <Polyline
                    key={`connection-${idx}`}
                    positions={line.positions}
                    color="#ef4444"
                    weight={4}
                    opacity={0.8}
                    dashArray="10, 10"
                >
                    <Popup>
                        <strong>Connected to:</strong><br />
                        {line.location.name}
                    </Popup>
                </Polyline>
            ))}

            {/* Draw all markers */}
            {validLocations.map((location) => {
                const isTurn = location.type === 'NODE' || location.type === 'node';
                const isSelected = location._id === selectedLocationId;
                const isConnected = connectedLocationIds.includes(location._id);
                
                let icon = isTurn ? turnIcon : locationIcon;
                if (isSelected) icon = selectedIcon;
                
                return (
                    <Marker
                        key={location._id}
                        position={[location.latitude, location.longitude]}
                        icon={icon}
                        opacity={isSelected || isConnected || !selectedLocationId ? 1 : 0.3}
                    >
                        <Popup>
                            <div style={{ minWidth: '150px' }}>
                                <strong style={{ 
                                    fontSize: '1.1rem', 
                                    color: isSelected ? '#ef4444' : (isTurn ? '#f59e0b' : '#10b981')
                                }}>
                                    {location.name}
                                    {isSelected && ' (Selected)'}
                                </strong>
                                <br />
                                <span style={{ fontSize: '0.9rem', color: '#666' }}>
                                    Code: {location.code}
                                </span>
                                <br />
                                <span style={{ fontSize: '0.85rem', color: '#888' }}>
                                    Type: {isTurn ? 'Turn' : 'Location'}
                                </span>
                                <br />
                                <span style={{ fontSize: '0.8rem', color: '#999' }}>
                                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                </span>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
