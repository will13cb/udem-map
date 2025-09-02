"use client";
import { useEffect, useRef } from "react";
import maplibregl, {
  Map,
  MapGeoJSONFeature,
  MapLayerMouseEvent,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type CampusProps = {
  name?: string;
  type?: "building" | "parking" | "poi" | string;
  code?: string;
  description?: string;
};

export default function CampusMap() {
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      center: [-73.614, 45.504], // UdeM approx
      zoom: 14,
      style: {
        version: 8,
        // Pour pouvoir dessiner du texte (labels)
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        sources: {
          // Fond OSM raster (rues, parcs, eau, etc.)
          osm: {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      // 1) Source GeoJSON (POI/bâtiments/parkings)
      map.addSource("campus", {
        type: "geojson",
        data: "/data/campus.geojson",
      });

      // 2) Cercles par type pour visualiser rapidement certains lieux 
      // TODO (à transformer en polygones plus tard)
      map.addLayer({
        id: "campus-circles",
        type: "circle",
        source: "campus",
        paint: {
          // Couleur selon le type
          "circle-color": [
            "match",
            ["get", "type"],
            "building",
            "#7c3aed", // violet
            "parking",
            "#0284c7", // bleu
            "poi",
            "#16a34a", // vert
            /* default */ "#444"
          ],
          "circle-radius": 6,
          "circle-opacity": 0.9,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 1,
        },
      });

      // 3) Labels (texte) — nécessite glyphs (défini plus haut)
      map.addLayer({
        id: "campus-labels",
        type: "symbol",
        source: "campus",
        layout: {
          "text-field": ["get", "name"],
          "text-size": 12,
          "text-offset": [0, 1.2],
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#1f2937",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.2,
        },
      });

      // 4) Popup au clic
      map.on("click", "campus-circles", (e: MapLayerMouseEvent) => {
        const f = e.features?.[0] as MapGeoJSONFeature | undefined;
        if (!f) return;
        const p: CampusProps = (f.properties ?? {}) as unknown as CampusProps;

        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(
            `<strong>${p.name ?? "Sans nom"}</strong><br/>` +
              `Type: ${p.type ?? "N/A"}` +
              (p.code ? `<br/>Code: ${p.code}` : "") +
              (p.description ? `<br/>${p.description}` : "")
          )
          .addTo(map);
      });

      map.on("mouseenter", "campus-circles", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "campus-circles", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    mapRef.current = map;
    return () => map.remove();
  }, []);

  return <div ref={containerRef} className="h-[80vh] w-full rounded-xl" />;
}
