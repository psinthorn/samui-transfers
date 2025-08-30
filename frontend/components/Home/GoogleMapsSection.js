"use client"

import React, { useCallback, useEffect, useState, memo } from 'react';
import { useSourceContext } from '@/context/SourceContext'
import { useDestinationContext } from '@/context/DestinationContext'
import { DirectionsRenderer, GoogleMap, MarkerF, OverlayView, OverlayViewF, useJsApiLoader } from '@react-google-maps/api';
import { Divide } from 'lucide-react';

  // Google Maps Section component for rendering google maps and direction route
  const GoogleMapsSection = () => {
    const {source, setSource} = useSourceContext();
    const {destination, setDestination} = useDestinationContext(); 
    // const [directionRoutePoints, setDirectionRoutePoints] = useState([]);
    const [directionRoutePoints, setDirectionRoutePoints] = useState(null);
    const containerStyle = {
      width: '100%',
      height: '100%'
    };
    
    const [center,setCenter ] = useState({
      // need to update to Samui-Transfers.com Office
      lat: 9.53216, 
      lng: 100.04386
    });

    const [map, setMap] = useState(null)

    // Normalize various point shapes into {lat, lng}
  const getCoords = (pt) => {
    if (!pt) return null;
    if (typeof pt.lat === 'number' && typeof pt.lng === 'number') return { lat: pt.lat, lng: pt.lng };
    if (pt.geometry?.location) {
      const loc = pt.geometry.location;
      const lat = typeof loc.lat === 'function' ? loc.lat() : loc.lat;
      const lng = typeof loc.lng === 'function' ? loc.lng() : loc.lng;
      if (typeof lat === 'number' && typeof lng === 'number') return { lat, lng };
    }
    if (pt.location && typeof pt.location.lat === 'function') {
      return { lat: pt.location.lat(), lng: pt.location.lng() };
    }
    return null;
  };

  const directionRoute = (src, dst) => {
    if (typeof google === 'undefined' || !google.maps) return;
    const DirectionService = new google.maps.DirectionsService();
    DirectionService.route(
      {
        origin: src,
        destination: dst,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirectionRoutePoints(result);
        } else {
          console.error('Directions error:', status);
          setDirectionRoutePoints(null);
        }
      }
    );
  };

    // React to source/destination/map changes safely
    useEffect(() => {
      const src = getCoords(source);
      const dst = getCoords(destination);

      if (map && src) {
        map.panTo(src);
        setCenter(src);
      } else if (map && !src && dst) {
        map.panTo(dst);
        setCenter(dst);
      }

      if (src && dst) {
        directionRoute(src, dst);
      } else {
        setDirectionRoutePoints(null);
      }
    }, [source, destination, map]); // re-run when any change

    const onLoad = useCallback(function callback(m) {
      // Fit to initial center
      if (typeof google !== 'undefined' && google.maps) {
        const bounds = new google.maps.LatLngBounds(center);
        m.fitBounds(bounds);
      }
      setMap(m);
    }, [center]);

    const onUnmount = useCallback(function callback() {
      setMap(null);
    }, []);

    const src = getCoords(source);
    const dst = getCoords(destination);

  return (
    <div className='w-full h-full relative mx-auto bg-white'>
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={14}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{mapId:'976a7c2e003306bf'}}
          >
            {/* Source marker */}
        {src ? (
          <MarkerF
            position={src}
            icon={{
              url: '/source-destination.png',
              // If you prefer exact sizing, use Size: new google.maps.Size(60, 60)
              scaledSize: { width: 60, height: 60 },
            }}
          >
            <OverlayViewF position={src} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} />
          </MarkerF>
        ) : null}

        {/* Destination marker */}
        {dst ? (
          <MarkerF
            position={dst}
            icon={{
              url: '/source-destination.png',
              scaledSize: { width: 60, height: 60 },
            }}
          >
            <OverlayViewF position={dst} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} />
          </MarkerF>
        ) : null}

        {/* render route on the maps  */}
          <DirectionsRenderer 
            directions={directionRoutePoints}
            options={{
            polylineOptions:{
              strokeColor: "#D94141",
              strokeWeight: 4,
              draggable: false,
            },
              suppressMarkers: true
                }}
              />
          </GoogleMap>
      </div>
      ) 
}


export default GoogleMapsSection;