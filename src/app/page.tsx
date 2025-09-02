import CampusMap from "@/components/CampusMap";

export default function Home() {
  return (
    <main className="p-4 space-y-3">
      <h1 className="text-2xl font-semibold">Carte interactive UdeM – MVP</h1>
      <p className="text-sm text-gray-600">
        Bâtiments et stationnements (données démo GeoJSON)
      </p>
      <CampusMap />
      <footer className="text-xs text-gray-500">
        Tuiles © OpenStreetMap • Rendu MapLibre
      </footer>
    </main>
  );
}
