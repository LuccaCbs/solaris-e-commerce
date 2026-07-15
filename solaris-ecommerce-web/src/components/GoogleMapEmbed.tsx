import { buildGoogleMapsEmbedUrl } from '../utils/googleMaps'

type GoogleMapEmbedProps = {
  latitude: string
  longitude: string
  address: string
  zoom?: string
  title?: string
  className?: string
}

const GoogleMapEmbed = ({
  latitude,
  longitude,
  address,
  zoom = '15',
  title = 'Map',
  className = '',
}: GoogleMapEmbedProps) => {
  const embedUrl = buildGoogleMapsEmbedUrl({
    mapLatitude: latitude,
    mapLongitude: longitude,
    mapAddress: address,
    mapZoom: zoom,
  })

  if (!embedUrl) return null

  return (
    <iframe
      title={title}
      src={embedUrl}
      className={`w-full h-full border-0 rounded-lg ${className}`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  )
}

export default GoogleMapEmbed
