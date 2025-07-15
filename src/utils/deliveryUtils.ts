// Utility functions for delivery calculations

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Calculate distance between two addresses
 * This is a simplified version that uses a mock distance calculation
 * In a real application, you would use a geocoding service like Google Maps API
 */
export function calculateDistance(storeAddress: Address, customerAddress: Address): number {
  // If we have coordinates, use them
  if (storeAddress.latitude && storeAddress.longitude && 
      customerAddress.latitude && customerAddress.longitude) {
    return calculateHaversineDistance(
      storeAddress.latitude, storeAddress.longitude,
      customerAddress.latitude, customerAddress.longitude
    );
  }
  
  // Otherwise, use a simple mock calculation based on postal codes
  // This is just for demonstration purposes
  const storePostcode = storeAddress.zipCode.replace(/\s+/g, '').toUpperCase();
  const customerPostcode = customerAddress.zipCode.replace(/\s+/g, '').toUpperCase();
  
  // Generate a consistent but random-looking distance based on postcodes
  const hash = simpleHash(storePostcode + customerPostcode);
  const baseDistance = (hash % 20) + 1; // 1-20 miles
  
  // Add some variation based on city
  const cityFactor = customerAddress.city.toLowerCase() === storeAddress.city.toLowerCase() ? 0.5 : 1.5;
  
  return Math.round(baseDistance * cityFactor * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate Haversine distance between two points (great-circle distance)
 */
function calculateHaversineDistance(
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

/**
 * Simple string hash function
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Calculate delivery price based on distance and method
 */
export function calculateDeliveryPrice(
  method: any, 
  distance: number | null, 
  orderValue: number
): number {
  // Free pickup
  if (method.id === 'pickup') {
    return 0;
  }
  
  // Check free shipping threshold
  if (method.freeShippingThreshold && orderValue >= method.freeShippingThreshold) {
    return 0;
  }
  
  // Distance-based pricing
  if (method.isDistanceBased && distance !== null && method.distancePricing) {
    const distanceTiers = Object.keys(method.distancePricing)
      .map(Number)
      .sort((a, b) => a - b);
    
    // Find the appropriate price tier based on distance
    for (const tier of distanceTiers) {
      if (distance <= tier) {
        return method.distancePricing[tier.toString()];
      }
    }
    
    // If distance is greater than all tiers, use the highest tier price
    if (distanceTiers.length > 0) {
      return method.distancePricing[Math.max(...distanceTiers).toString()];
    }
  }
  
  // Value-based pricing
  if (method.isValueBased && method.valuePricing) {
    const valueTiers = Object.keys(method.valuePricing)
      .map(Number)
      .sort((a, b) => a - b);
    
    let price = method.basePrice;
    
    // Find the appropriate price tier based on order value
    for (const tier of valueTiers) {
      if (orderValue >= tier) {
        price = method.valuePricing[tier.toString()];
      }
    }
    
    return price;
  }
  
  // Default to base price
  return method.basePrice;
}