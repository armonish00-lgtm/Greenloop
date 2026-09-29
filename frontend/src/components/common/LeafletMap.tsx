import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Listing } from '../../types';
import { getImageUrl } from '../../services/api';

interface LeafletMapProps {
  listings: Listing[];
  center: { lat: number; lng: number };
  radiusKm?: number;
  onSelectListing?: (listing: Listing) => void;
  className?: string;
}

const SVG_ICONS = {
  SHARE_BORROW: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>`,
  FOOD_RESCUE: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8Z"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/><path d="m2.1 21.8 6.4-6.3"/><path d="m19 5-7 7"/></svg>`,
  INDUSTRIAL_SURPLUS: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/></svg>`,
  GREEN_MARKETPLACE: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.2a1.8 1.8 0 0 0 1.5-2.6L16.2 9.5"/><path d="m4.5 14 3.5 5-3.5 5"/><path d="m19.5 14-3.5 5 3.5 5"/><path d="M14 5a1.8 1.8 0 0 0-1.5-1H11.5a1.8 1.8 0 0 0-1.5 1L5.5 14h13Z"/></svg>`,
  PIN: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`,
};

const MODULE_COLORS: Record<string, { bg: string; iconSvg: string; text: string }> = {
  SHARE_BORROW: { bg: '#357056', iconSvg: SVG_ICONS.SHARE_BORROW, text: 'Share & Borrow' },
  FOOD_RESCUE: { bg: '#d97706', iconSvg: SVG_ICONS.FOOD_RESCUE, text: 'Food Rescue' },
  INDUSTRIAL_SURPLUS: { bg: '#2563eb', iconSvg: SVG_ICONS.INDUSTRIAL_SURPLUS, text: 'Industrial Surplus' },
  GREEN_MARKETPLACE: { bg: '#059669', iconSvg: SVG_ICONS.GREEN_MARKETPLACE, text: 'Marketplace' },
};

function createCustomPin(module: string): L.DivIcon {
  const meta = MODULE_COLORS[module] || { bg: '#357056', iconSvg: SVG_ICONS.PIN, text: 'Resource' };
  const html = `
    <div style="
      background-color: ${meta.bg};
      width: 38px;
      height: 38px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      border: 2px solid #ffffff;
      cursor: pointer;
      transition: transform 0.2s ease;
    ">
      <div style="
        transform: rotate(45deg);
        display: flex;
        align-items: center;
        justify-content: center;
      ">${meta.iconSvg}</div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-map-pin',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  listings,
  center,
  radiusKm = 5,
  onSelectListing,
  className = 'h-[500px] w-full rounded-2xl overflow-hidden shadow-inner',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circleLayerRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([center.lat, center.lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([center.lat, center.lng], 13);
    }
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // Draw radius circle around user location
    if (circleLayerRef.current) {
      circleLayerRef.current.remove();
    }

    circleLayerRef.current = L.circle([center.lat, center.lng], {
      radius: radiusKm * 1000,
      color: '#357056',
      fillColor: '#357056',
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: '4, 4',
    }).addTo(mapInstanceRef.current);

    // User center marker
    const userCenterIcon = L.divIcon({
      html: `
        <div style="
          width: 18px;
          height: 18px;
          background: #2563eb;
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(37,99,235,0.3);
        "></div>
      `,
      className: 'user-location-pulse',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    L.marker([center.lat, center.lng], { icon: userCenterIcon })
      .addTo(markersLayerRef.current)
      .bindTooltip('Your Location', { permanent: false, direction: 'top' });

    // Add listing pins
    listings.forEach((listing) => {
      const pin = createCustomPin(listing.module);
      const marker = L.marker([listing.latitude, listing.longitude], { icon: pin });

      const coverImg = listing.images?.[0]?.imageUrl
        ? getImageUrl(listing.images[0].imageUrl)
        : 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80';

      const priceDisplay = listing.isFree ? 'Free' : `₹${listing.price} ${listing.priceUnit || ''}`;
      const moduleMeta = MODULE_COLORS[listing.module] || MODULE_COLORS.SHARE_BORROW;

      const popupHtml = `
        <div style="width: 220px; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; font-size: 13px;">
          <img src="${coverImg}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
          <div style="display: inline-block; background: ${moduleMeta.bg}15; color: ${moduleMeta.bg}; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; margin-bottom: 4px;">
            ${moduleMeta.text}
          </div>
          <div style="font-weight: 700; font-size: 14px; color: #111827; margin-bottom: 2px; line-height: 1.2;">
            ${listing.title}
          </div>
          <div style="color: #6b7280; font-size: 11px; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${listing.neighborhood} • ${listing.distanceKm !== undefined ? `${listing.distanceKm} km away` : ''}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f3f4f6; padding-top: 6px;">
            <span style="font-weight: 700; color: #166534; font-size: 13px;">${priceDisplay}</span>
            <button id="btn-view-${listing.id}" style="
              background: #357056;
              color: #ffffff;
              border: none;
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 600;
              cursor: pointer;
            ">View Details</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-view-${listing.id}`);
        if (btn && onSelectListing) {
          btn.onclick = () => onSelectListing(listing);
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [listings, center.lat, center.lng, radiusKm, onSelectListing]);

  return <div ref={mapContainerRef} className={className} />;
};
