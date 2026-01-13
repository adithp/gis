import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const API_URL = "http://127.0.0.1:8000/get-features";

export default function MapView() {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        mapRef.current = new maplibregl.Map({
            container: mapContainer.current,
            style: "https://demotiles.maplibre.org/style.json",
            center: [76.35, 11.55],
            zoom: 10,
        });

        mapRef.current.on("load", () => {
            loadEpoch(1704067200, 1704067200);
        });

        return () => mapRef.current.remove();
    }, []);

    const loadEpoch = async (start, end) => {
        const response = await fetch(
            `${API_URL}?tenant_id=company1&start_epoch=${start}&end_epoch=${end}`
        );
        const data = await response.json();

        if (mapRef.current.getSource("sites")) {
            mapRef.current.getSource("sites").setData(data);
            return;
        }

        mapRef.current.addSource("sites", {
            type: "geojson",
            data: data,
        });

        mapRef.current.addLayer({
            id: "sites-layer",
            type: "fill",
            source: "sites",
            paint: {
                "fill-color": "#ff6600",
                "fill-opacity": 0.5,
            },
        });

        mapRef.current.on("click", "sites-layer", (e) => {
            const props = e.features[0].properties;

            new maplibregl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`
          <strong>Tenant:</strong> ${props.tenant_id}<br/>
          <strong>Epoch:</strong> ${props.epoch_id}<br/>
          <strong>Area:</strong> ${Number(props.area_sqm).toFixed(2)} m²
        `)
                .addTo(mapRef.current);
        });
    };

    return (
        <>
            <div style={{ position: "absolute", zIndex: 1, padding: 10 }}>
                <button onClick={() => loadEpoch(1704067200, 1704067200)}>
                    Epoch A
                </button>
                <button onClick={() => loadEpoch(1717200000, 1717200000)}>
                    Epoch B
                </button>
            </div>

            <div
                ref={mapContainer}
                style={{ width: "100vw", height: "100vh" }}
            />
        </>
    );
}