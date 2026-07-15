export const geocodeAddress = async (
  address: string
): Promise<{ latitude: string; longitude: string } | null> => {
  const query = address.trim()
  if (!query) return null

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
    { headers: { 'Accept-Language': 'es,en' } }
  )

  if (!response.ok) return null

  const results = await response.json()
  if (!Array.isArray(results) || results.length === 0) return null

  const { lat, lon } = results[0]
  if (!lat || !lon) return null

  return { latitude: String(lat), longitude: String(lon) }
}
