'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon paths (must be done at module level, outside hooks)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface College {
  name: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  type: string;
  stream: string;
}

const typeColors: Record<string, string> = {
  government: '#1D9E75',
  autonomous: '#1D9E75',
  private: '#7F77DD',
  deemed: '#E07830',
};

const getTypeColor = (type: string) => {
  const t = type.toLowerCase();
  for (const key of Object.keys(typeColors)) {
    if (t.includes(key)) return typeColors[key];
  }
  return '#7F77DD';
};

const createPin = (type: string, index: number) => L.divIcon({
  className: '',
  html: `
    <div style="
      animation: pinDrop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
      animation-delay: ${Math.min(index * 20, 800)}ms;
      position: relative;
    ">
      <div style="
        width: 26px; height: 26px;
        background: ${getTypeColor(type)};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.2);
        transition: transform 0.2s ease;
      "></div>
      <div style="
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 6px; height: 6px;
        background: ${getTypeColor(type)};
        border-radius: 50%;
        opacity: 0.4;
        filter: blur(2px);
      "></div>
    </div>
  `,
  iconSize: [26, 32],
  iconAnchor: [13, 32],
  popupAnchor: [0, -36],
});

function AutoFitBounds({ colleges }: { colleges: College[] }) {
  const map = useMap();
  useEffect(() => {
    if (colleges.length > 0) {
      const bounds = L.latLngBounds(colleges.map(c => [c.lat, c.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 7 });
    }
  }, [colleges, map]);
  return null;
}

export default function CollegeMapComponent() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    fetch('/data/colleges-map.json')
      .then(res => res.json())
      .then(data => {
        setColleges(data);
        setIsLoading(false);
        // Small delay so the map tiles have a moment to load
        setTimeout(() => setMapReady(true), 300);
      })
      .catch(err => {
        console.error('Error loading map data:', err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="relative w-full" style={{ minHeight: 500 }}>
      {/* Skeleton loading overlay */}
      {isLoading && (
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 20,
            background: 'linear-gradient(135deg, #1a1340 0%, #0f0b2a 100%)',
            borderRadius: 16, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 16,
          }}
        >
          <div style={{
            width: 48, height: 48, border: '3px solid rgba(127,119,221,0.3)',
            borderTopColor: '#7F77DD', borderRadius: '50%',
            animation: 'spin 0.9s linear infinite',
          }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600 }}>
            Loading college map…
          </p>
        </div>
      )}

      {/* Map container */}
      <div
        style={{
          height: 500, borderRadius: 16, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          opacity: mapReady ? 1 : 0,
          transition: 'opacity 0.6s ease',
          animation: mapReady ? 'mapFadeIn 0.6s ease both' : 'none',
        }}
      >
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
          whenReady={() => setMapReady(true)}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          />
          {colleges.length > 0 && <AutoFitBounds colleges={colleges} />}
          {colleges.map((college, idx) => (
            <Marker
              key={idx}
              position={[college.lat, college.lng]}
              icon={createPin(college.type, idx)}
            >
              <Popup maxWidth={230} className="college-map-popup">
                <div style={{ padding: '6px 2px', fontFamily: 'Inter, sans-serif', minWidth: 180 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, margin: '0 0 6px', color: '#1a1340', lineHeight: 1.3 }}>
                    {college.name}
                  </p>
                  <p style={{ fontSize: 11, color: '#6b6491', margin: '0 0 4px' }}>
                    📍 {college.city}, {college.state}
                  </p>
                  <p style={{ fontSize: 11, color: '#6b6491', margin: '0 0 8px' }}>
                    🎓 {college.stream}
                  </p>
                  <span style={{
                    display: 'inline-block', padding: '3px 8px', borderRadius: 6,
                    fontSize: 10, fontWeight: 700, color: '#fff',
                    background: getTypeColor(college.type),
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                  }}>
                    {college.type}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      {mapReady && (
        <div style={{
          position: 'absolute', bottom: 12, left: 12, zIndex: 10,
          background: 'rgba(10,13,36,0.85)', backdropFilter: 'blur(8px)',
          borderRadius: 10, padding: '8px 12px', border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', gap: 12,
        }}>
          {[
            { label: 'Government', color: '#1D9E75' },
            { label: 'Private', color: '#7F77DD' },
            { label: 'Deemed', color: '#E07830' },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
