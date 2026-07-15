type MapLocation = {
  mapEnabled: boolean
  mapAddress: string
  mapLatitude: string
  mapLongitude: string
  mapZoom: string
}

export const buildGoogleMapsEmbedUrl = ({
  mapLatitude,
  mapLongitude,
  mapAddress,
  mapZoom = '15',
}: Pick<MapLocation, 'mapLatitude' | 'mapLongitude' | 'mapAddress' | 'mapZoom'>): string | null => {
  const zoom = Math.min(21, Math.max(1, parseInt(mapZoom, 10) || 15))
  const lat = parseFloat(mapLatitude)
  const lng = parseFloat(mapLongitude)

  if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
    return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`
  }

  if (mapAddress.trim()) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(mapAddress.trim())}&z=${zoom}&output=embed`
  }

  return null
}

export const hasMapLocation = (location: Pick<MapLocation, 'mapEnabled' | 'mapLatitude' | 'mapLongitude' | 'mapAddress'>): boolean => {
  if (!location.mapEnabled) return false
  const lat = parseFloat(location.mapLatitude)
  const lng = parseFloat(location.mapLongitude)
  return (!Number.isNaN(lat) && !Number.isNaN(lng)) || Boolean(location.mapAddress.trim())
}

export type { MapLocation }
