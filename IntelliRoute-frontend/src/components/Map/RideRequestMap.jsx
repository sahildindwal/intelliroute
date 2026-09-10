import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

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

const sourceIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [30, 49],
    iconAnchor: [15, 49],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
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

// Animated polyline component
function AnimatedPath({ pathDetails }) {
    const [dashOffset, setDashOffset] = useState(0);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setDashOffset(prev => (prev - 5) % 40);
        }, 100);
        
        return () => clearInterval(interval);
    }, []);

    if (!pathDetails || pathDetails.length < 2) return null;

    const positions = pathDetails.map(loc => [loc.latitude, loc.longitude]);

    return (
        <>
            {/* Background path (solid) */}
            <Polyline
                positions={positions}
                color="#3b82f6"
                weight={6}
                opacity={0.3}
            />
            {/* Animated gradient path */}
            <Polyline
                positions={positions}
                pathOptions={{
                    color: '#10b981',
                    weight: 4,
                    opacity: 0.9,
                    dashArray: '20, 20',
                    dashOffset: dashOffset,
                    lineCap: 'round',
                }}
            >
                <Popup>
                    <strong>Shortest Path</strong><br />
                    {pathDetails.length} waypoints
                </Popup>
            </Polyline>
        </>
    );
}

// Click handler component
function LocationClickHandler({ onLocationClick, locations, turns }) {
    const allLocations = useMemo(() => [...locations, ...turns], [locations, turns]);
    
    useMapEvents({
        click: (e) => {
            const { lat, lng } = e.latlng;
            
            // Find nearest location within 50 meters
            let nearest = null;
            let minDistance = Infinity;
            
            allLocations.forEach(loc => {
                if (loc.latitude && loc.longitude) {
                    const distance = Math.sqrt(
                        Math.pow(lat - loc.latitude, 2) + 
                        Math.pow(lng - loc.longitude, 2)
                    ) * 111000; // Rough conversion to meters
                    
                    if (distance < minDistance && distance < 100) {
                        minDistance = distance;
                        nearest = loc;
                    }
                }
            });
            
            if (nearest) {
                onLocationClick(nearest);
            }
        },
    });
    
    return null;
}

export default function RideRequestMap({ 
    locations = [], 
    turns = [],
    sourceId,
    destinationId,
    onSourceSelect,
    onDestinationSelect,
    pathInfo,
    onClickModeChange,
    height = '100%' 
}) {
    const [clickMode, setClickMode] = useState('source'); // 'source' or 'destination'
    
    useEffect(() => {
        if (onClickModeChange) {
            onClickModeChange(clickMode);
        }
    }, [clickMode, onClickModeChange]);
    
    const allLocations = useMemo(() => [...locations, ...turns], [locations, turns]);
    
    const validLocations = useMemo(() => 
        allLocations.filter(loc => loc.latitude && loc.longitude),
        [allLocations]
    );

    const center = useMemo(() => {
        if (validLocations.length > 0) {
            return [validLocations[0].latitude, validLocations[0].longitude];
        }
        return [28.6139, 77.2090];
    }, [validLocations]);

    const sourceLocation = useMemo(() => 
        validLocations.find(loc => loc._id === sourceId),
        [validLocations, sourceId]
    );

    const destinationLocation = useMemo(() => 
        validLocations.find(loc => loc._id === destinationId),
        [validLocations, destinationId]
    );

    const handleLocationClick = (location) => {
        if (clickMode === 'source') {
            onSourceSelect(location._id);
            setClickMode('destination');
        } else {
            onDestinationSelect(location._id);
            setClickMode('source');
        }
    };

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
        <div style={{ height, width: '100%', position: 'relative' }}>
            {/* Distance display */}
            {pathInfo && pathInfo.distanceInMeters && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                }}>
                    📏 Distance: {pathInfo.distanceInMeters} m
                </div>
            )}

            <MapContainer
                key={`map-${validLocations.length}`}
                center={center}
                zoom={15}
                style={{ height: '100%', width: '100%', borderRadius: '8px', minHeight: '400px', cursor: 'pointer' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapBounds allLocations={validLocations} />
                <LocationClickHandler 
                    onLocationClick={handleLocationClick}
                    locations={locations}
                    turns={turns}
                />

                {/* Draw animated path if available */}
                {pathInfo && pathInfo.pathDetails && pathInfo.pathDetails.length > 0 && (
                    <AnimatedPath pathDetails={pathInfo.pathDetails} />
                )}

                {/* Draw all location markers */}
                {validLocations.map((location) => {
                    const isTurn = location.type === 'NODE' || location.type === 'node';
                    const isSource = location._id === sourceId;
                    const isDestination = location._id === destinationId;
                    
                    let icon = isTurn ? turnIcon : locationIcon;
                    if (isSource) icon = sourceIcon;
                    if (isDestination) icon = destinationIcon;
                    
                    const isInPath = pathInfo?.pathDetails?.some(p => p._id === location._id);
                    
                    return (
                        <Marker
                            key={location._id}
                            position={[location.latitude, location.longitude]}
                            icon={icon}
                            opacity={isSource || isDestination || isInPath || !sourceId ? 1 : 0.3}
                            eventHandlers={{
                                click: () => handleLocationClick(location)
                            }}
                        >
                            <Popup>
                                <div style={{ minWidth: '150px' }}>
                                    <strong style={{ 
                                        fontSize: '1.1rem', 
                                        color: isSource ? '#3b82f6' : (isDestination ? '#ef4444' : (isTurn ? '#f59e0b' : '#10b981'))
                                    }}>
                                        {location.name}
                                        {isSource && ' (SOURCE)'}
                                        {isDestination && ' (DESTINATION)'}
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
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleLocationClick(location);
                                        }}
                                        style={{
                                            marginTop: '0.5rem',
                                            padding: '0.4rem 0.8rem',
                                            background: clickMode === 'source' ? '#3b82f6' : '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Set as {clickMode === 'source' ? 'Source' : 'Destination'}
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
