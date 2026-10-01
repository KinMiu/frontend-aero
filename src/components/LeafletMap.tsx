import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useMemo } from "react"

export interface MapLocation {
  lat: number
  lng: number
  title: string
  address: string
  color: string
}

function createColoredIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 28 16 28s16-16 16-28C32 7.16 24.84 0 16 0z" fill="${color}" stroke="white" stroke-width="2"/>
    <circle cx="16" cy="16" r="6" fill="white"/>
  </svg>`
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -40],
  })
}

function MapController({
  locations,
  activeIndex,
}: {
  locations: MapLocation[]
  activeIndex: number
}) {
  const map = useMap()

  useEffect(() => {
    if (locations.length === 0) return

    if (activeIndex < 0) {
      if (locations.length === 1) {
        map.setView([locations[0].lat, locations[0].lng], 15, { animate: true })
      } else {
        const bounds = L.latLngBounds(
          locations.map((loc) => [loc.lat, loc.lng] as [number, number])
        )
        map.flyToBounds(bounds, { padding: [60, 60], duration: 1.2 })
      }
    } else {
      const loc = locations[activeIndex]
      map.flyTo([loc.lat, loc.lng], 15, { duration: 1.2 })
    }
  }, [map, locations, activeIndex])

  return null
}

export default function LeafletMap({
  locations,
  activeIndex,
}: {
  locations: MapLocation[]
  activeIndex: number
}) {
  const center = locations[0] ?? { lat: 0, lng: 0 }

  const icons = useMemo(
    () => locations.map((loc) => createColoredIcon(loc.color)),
    [locations]
  )

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={6}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {locations.map((loc, i) => (
        <Marker key={i} position={[loc.lat, loc.lng]} icon={icons[i]}>
          <Popup>
            <strong style={{ color: loc.color }}>{loc.title}</strong>
            <br />
            {loc.address}
          </Popup>
        </Marker>
      ))}
      <MapController locations={locations} activeIndex={activeIndex} />
    </MapContainer>
  )
}
