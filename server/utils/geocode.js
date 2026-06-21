/**
 * Geocoding utility using OpenStreetMap Nominatim API
 * Converts address/city/state/pincode to latitude and longitude coordinates
 * Free to use, no API key required
 */

/**
 * Geocode an address to get coordinates
 * @param {Object} location - Location object with address, city, state, pincode
 * @returns {Promise<Object|null>} - Returns {lat, lng} or null if geocoding fails
 */
export const geocodeAddress = async (location) => {
  // If coordinates already exist, return them
  if (location?.lat && location?.lng) {
    console.log('[Geocode] Coordinates already exist:', { lat: location.lat, lng: location.lng });
    return { lat: location.lat, lng: location.lng };
  }

  // Build query string from available address components
  const addressParts = [];
  if (location?.address) addressParts.push(location.address);
  if (location?.city) addressParts.push(location.city);
  if (location?.state) addressParts.push(location.state);
  if (location?.pincode) addressParts.push(location.pincode);

  if (addressParts.length === 0) {
    console.warn('[Geocode] No address components provided');
    return null;
  }

  const query = addressParts.join(', ');
  console.log('[Geocode] Geocoding address:', query);

  try {
    // Using OpenStreetMap Nominatim API (free, no API key required)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Lumina-Logistics/1.0', // Required by Nominatim policy
      },
    });

    if (!response.ok) {
      console.error('[Geocode] API request failed:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.warn('[Geocode] No results found for address:', query);
      return null;
    }

    const result = data[0];
    const coordinates = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };

    console.log('[Geocode] Successfully geocoded:', {
      query,
      coordinates,
      displayName: result.display_name,
    });

    return coordinates;
  } catch (error) {
    console.error('[Geocode] Error geocoding address:', error.message);
    return null;
  }
};

/**
 * Geocode both sender and receiver locations
 * @param {Object} senderLocation - Sender location object
 * @param {Object} receiverLocation - Receiver location object
 * @returns {Promise<Object>} - Returns { sender: {lat, lng}, receiver: {lat, lng} }
 */
export const geocodeShipmentLocations = async (senderLocation, receiverLocation) => {
  console.log('[Geocode] Starting shipment location geocoding...');

  const [senderCoords, receiverCoords] = await Promise.all([
    geocodeAddress(senderLocation),
    geocodeAddress(receiverLocation),
  ]);

  const result = {
    sender: senderCoords,
    receiver: receiverCoords,
  };

  console.log('[Geocode] Geocoding complete:', result);
  return result;
};
