'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as unknown as Record<string,unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type College = {
  id: number;
  name: string;
  location: string;
  state: string;
  type: string;
  cutoff_general: number;
  avg_package_lpa: number;
  nirf_rank: number;
  website: string;
  latitude: number;
  longitude: number;
};

const typeColors: Record<string, string> = {
  Government: '#a855f7',
  Private: '#3b82f6',
  Deemed: '#f97316',
};

const createPin = (type: string) => L.divIcon({
  className: '',
  html: `<div style="
    width:24px;height:24px;
    background:${typeColors[type] || '#a855f7'};
    border:2.5px solid white;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    box-shadow:0 2px 6px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -28],
});

function MapFit({ colleges }: { colleges: College[] }) {
  const map = useMap();
  useEffect(() => {
    if (colleges.length > 0) {
      const bounds = L.latLngBounds(
        colleges.map(c => [c.latitude, c.longitude])
      );
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [colleges, map]);
  return null;
}

export default function CollegeMap({ colleges }: { colleges: College[] }) {
  return (
    <div style={{ height: '500px', borderRadius: '16px', overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.1)' }}>
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <MapFit colleges={colleges} />
        {colleges.map(c => (
          <Marker key={c.id}
            position={[c.latitude, c.longitude]}
            icon={createPin(c.type)}>
            <Popup maxWidth={240}>
              <div style={{ fontFamily:'sans-serif', padding:'4px' }}>
                <p style={{ fontWeight:700, fontSize:13, marginBottom:6,
                  color:'#1a1a2e', lineHeight:1.3 }}>{c.name}</p>
                <p style={{ fontSize:11, color:'#666', marginBottom:2 }}>
                  📍 {c.location}, {c.state}
                </p>
                <p style={{ fontSize:11, color:'#666', marginBottom:2 }}>
                  🏛️ {c.type}
                </p>
                {c.nirf_rank && (
                  <p style={{ fontSize:11, color:'#666', marginBottom:2 }}>
                    🏆 NIRF #{c.nirf_rank}
                  </p>
                )}
                {c.cutoff_general && (
                  <p style={{ fontSize:11, color:'#666', marginBottom:6 }}>
                    📊 Cutoff: {c.cutoff_general}%
                  </p>
                )}
                {c.website && (
                  <a href={c.website} target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize:11, padding:'4px 10px',
                      background:'#7c3aed', color:'white',
                      borderRadius:6, textDecoration:'none',
                      display:'inline-block' }}>
                    Visit →
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
