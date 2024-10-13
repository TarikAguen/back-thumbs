import axios from "axios";

async function geocodeaddress(address: string) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json`;
  const params = {
    address,
    key: process.env.GOOGLE_MAPS_API_KEY,
  };

  try {
    const response = await axios.get(url, { params });
    const { lat, lng } = response.data.results[0].geometry.location;
    return { latitude: lat, longitude: lng };
  } catch (error) {
    console.error("Geocoding error:", error);
    throw error;
  }
}

export default geocodeaddress;
