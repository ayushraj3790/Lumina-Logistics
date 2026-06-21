/**
 * AI-powered logistics helpers
 * Uses enhanced algorithms + Google Gemini for chatbot
 */

// Haversine distance in km
export const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Intelligent Driver Assignment
 * Automatically assigns the best available driver based on:
 * - driver availability
 * - driver rating
 * - total deliveries
 * - current workload
 * - proximity to pickup location
 */
export const assignBestDriver = async (availableDrivers, pickupLocation) => {
  if (!availableDrivers || availableDrivers.length === 0) {
    return null;
  }

  const scoredDrivers = availableDrivers.map((driver) => {
    const profile = driver.driverProfile || {};
    
    // Base score components
    const ratingScore = (profile.rating || 5) * 20; // Max 100 points
    const experienceScore = Math.min(profile.totalDeliveries || 0, 100) * 0.3; // Max 30 points
    const availabilityScore = profile.isAvailable ? 50 : 0; // Max 50 points
    
    // Workload score (fewer active deliveries = higher score)
    const workloadScore = Math.max(0, 50 - (profile.currentWorkload || 0) * 5); // Max 50 points
    
    // Proximity score (closer to pickup = higher score)
    let proximityScore = 0;
    if (pickupLocation?.lat && pickupLocation?.lng && profile.currentLocation?.lat) {
      const distance = getDistanceKm(
        pickupLocation.lat,
        pickupLocation.lng,
        profile.currentLocation.lat,
        profile.currentLocation.lng
      );
      proximityScore = Math.max(0, 50 - distance * 2); // Max 50 points, decreases with distance
    } else {
      proximityScore = 25; // Default score if location not available
    }
    
    // Calculate total score
    const totalScore = ratingScore + experienceScore + availabilityScore + workloadScore + proximityScore;
    
    return {
      driver,
      score: totalScore,
      breakdown: {
        rating: ratingScore,
        experience: experienceScore,
        availability: availabilityScore,
        workload: workloadScore,
        proximity: proximityScore,
      },
    };
  });

  // Sort by score descending and return the best driver
  scoredDrivers.sort((a, b) => b.score - a.score);
  
  return scoredDrivers[0]?.driver || null;
};

/**
 * Enhanced AI ETA Prediction based on:
 * - distance
 * - delivery speed
 * - historical delivery data
 * - weather data (if available)
 * - time of day factors
 */
export const predictETA = async (shipment, historicalData = null, weatherData = null) => {
  const pickup = shipment.sender?.location;
  const drop = shipment.receiver?.location;
  let distanceKm = 50;
  if (pickup?.lat && drop?.lat) {
    distanceKm = getDistanceKm(pickup.lat, pickup.lng, drop.lat, drop.lng);
  }

  const speedFactors = { standard: 40, express: 55, 'same-day': 70 }; // km/h avg
  const avgSpeed = speedFactors[shipment.deliverySpeed] || 40;

  // Time of day factor (rush hours slower)
  const hour = new Date().getHours();
  let timeMultiplier = 1;
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    timeMultiplier = 1.3; // Rush hours
  } else if (hour >= 10 && hour <= 16) {
    timeMultiplier = 1.1; // Daytime
  }

  // Weather impact (if provided)
  let weatherMultiplier = 1;
  if (weatherData) {
    if (weatherData.condition === 'rain') weatherMultiplier = 1.15;
    if (weatherData.condition === 'storm') weatherMultiplier = 1.35;
    if (weatherData.condition === 'snow') weatherMultiplier = 1.4;
    if (weatherData.condition === 'fog') weatherMultiplier = 1.2;
  } else {
    // Fallback to simulated weather if not provided
    const weatherOptions = ['clear', 'rain', 'storm'];
    const weather = weatherOptions[Math.floor(Math.random() * 3)];
    if (weather === 'rain') weatherMultiplier = 1.15;
    if (weather === 'storm') weatherMultiplier = 1.35;
  }

  // Historical data adjustment (if provided)
  let historicalMultiplier = 1;
  if (historicalData && historicalData.avgSpeed) {
    historicalMultiplier = avgSpeed / historicalData.avgSpeed;
  }

  // Traffic simulation (can be enhanced with real traffic API)
  const trafficOptions = ['light', 'moderate', 'heavy'];
  const traffic = trafficOptions[Math.floor(Math.random() * 3)];
  let trafficMultiplier = 1;
  if (traffic === 'moderate') trafficMultiplier = 1.2;
  if (traffic === 'heavy') trafficMultiplier = 1.5;

  // Calculate total multiplier
  const totalMultiplier = timeMultiplier * weatherMultiplier * historicalMultiplier * trafficMultiplier;

  const hours = (distanceKm / avgSpeed) * totalMultiplier;
  const predictedAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  
  // Confidence score based on data quality
  let confidence = 85;
  if (historicalData) confidence += 5;
  if (weatherData) confidence += 5;
  confidence = Math.min(95, Math.max(70, confidence - Math.floor(distanceKm / 30)));

  return {
    predictedAt,
    confidence,
    factors: {
      distance: Math.round(distanceKm),
      traffic,
      weather: weatherData?.condition || 'simulated',
      timeOfDay: hour,
      historicalDataAvailable: !!historicalData,
    },
  };
};

/**
 * Enhanced AI Delay Detection
 * Predicts delay risk using:
 * - elapsed shipment time
 * - route distance
 * - shipment status history
 * Returns confidence score
 */
export const detectDelay = (shipment) => {
  const now = Date.now();
  const lastActivity = new Date(shipment.lastActivityAt || shipment.updatedAt).getTime();
  const hoursSinceActivity = (now - lastActivity) / (1000 * 60 * 60);

  const statusThresholds = {
    pending: 24,
    picked_up: 12,
    in_warehouse: 48,
    in_transit: 36,
    out_for_delivery: 8,
  };

  const threshold = statusThresholds[shipment.status] || 24;
  const isInactive = hoursSinceActivity > threshold;
  const isPastEta = shipment.eta?.predictedAt && new Date(shipment.eta.predictedAt) < new Date() && shipment.status !== 'delivered';

  // Calculate delay risk confidence score
  let delayRisk = 0;
  let riskFactors = [];

  // Factor 1: Inactivity duration
  if (hoursSinceActivity > threshold) {
    const inactivityRisk = Math.min(40, (hoursSinceActivity - threshold) * 2);
    delayRisk += inactivityRisk;
    riskFactors.push(`Inactivity: ${Math.floor(hoursSinceActivity)}h (threshold: ${threshold}h)`);
  }

  // Factor 2: Past ETA
  if (isPastEta) {
    delayRisk += 35;
    riskFactors.push('Past estimated delivery time');
  }

  // Factor 3: Status history analysis
  if (shipment.timeline && shipment.timeline.length > 1) {
    const statusChanges = shipment.timeline.length;
    const avgTimePerStatus = hoursSinceActivity / statusChanges;
    if (avgTimePerStatus > 12) {
      delayRisk += 15;
      riskFactors.push(`Slow status progression (${avgTimePerStatus.toFixed(1)}h per status)`);
    }
  }

  // Factor 4: Distance factor (longer routes have higher delay risk)
  if (shipment.eta?.factors?.distance > 200) {
    delayRisk += 10;
    riskFactors.push('Long distance route');
  }

  // Normalize delay risk to 0-100
  delayRisk = Math.min(100, delayRisk);

  if (delayRisk > 50) {
    return {
      isDelayed: true,
      reason: riskFactors.join(', ') || 'Multiple delay factors detected',
      confidence: Math.round(delayRisk),
      riskFactors,
    };
  }

  return {
    isDelayed: false,
    confidence: Math.round(delayRisk),
    riskFactors: delayRisk > 20 ? riskFactors : [],
  };
};

/**
 * Enhanced AI Route Suggestions
 * Generates:
 * - fastest route
 * - cheapest route
 * - balanced route
 * Returns structured route suggestions
 */
export const suggestRoutes = (pickup, drop) => {
  const baseDist = pickup?.lat && drop?.lat ? getDistanceKm(pickup.lat, pickup.lng, drop.lat, drop.lng) : 45;

  // Fastest route (highway focused, higher speed)
  const fastestRoute = {
    type: 'fastest',
    name: 'Fastest Route',
    distance: Math.round(baseDist),
    duration: Math.round((baseDist / 65) * 60), // Assuming 65 km/h on highways
    estimatedCost: Math.round(baseDist * 2.5), // Higher fuel cost
    description: 'Prioritizes speed using major highways',
  };

  // Cheapest route (shorter distance, lower speed)
  const cheapestRoute = {
    type: 'cheapest',
    name: 'Most Economical',
    distance: Math.round(baseDist * 0.95),
    duration: Math.round((baseDist * 0.95 / 45) * 60), // Assuming 45 km/h on local roads
    estimatedCost: Math.round(baseDist * 0.95 * 1.8), // Lower fuel cost
    description: 'Minimizes fuel and toll costs',
  };

  // Balanced route (optimal mix)
  const balancedRoute = {
    type: 'balanced',
    name: 'Balanced Route',
    distance: Math.round(baseDist * 1.02),
    duration: Math.round((baseDist * 1.02 / 55) * 60), // Assuming 55 km/h average
    estimatedCost: Math.round(baseDist * 1.02 * 2.1), // Moderate cost
    description: 'Optimal balance of time and cost',
  };

  return [fastestRoute, cheapestRoute, balancedRoute];
};

/**
 * AI Analytics Helper Functions
 */

// Calculate delivery success score (0-100)
export const calculateDeliverySuccessScore = (shipments) => {
  if (!shipments || shipments.length === 0) return 0;

  const delivered = shipments.filter((s) => s.status === 'delivered').length;
  const delayed = shipments.filter((s) => s.isDelayed).length;
  const cancelled = shipments.filter((s) => s.status === 'cancelled').length;
  const total = shipments.length;

  const onTimeRate = ((delivered - delayed) / total) * 100;
  const completionRate = (delivered / total) * 100;
  const cancellationPenalty = (cancelled / total) * 20;

  const successScore = Math.max(0, Math.min(100, (onTimeRate * 0.6) + (completionRate * 0.4) - cancellationPenalty));
  return Math.round(successScore);
};

// Calculate driver performance score (0-100)
export const calculateDriverPerformanceScore = (driver, shipments) => {
  if (!driver || !shipments || shipments.length === 0) return 0;

  const profile = driver.driverProfile || {};
  
  // Rating component (40%)
  const ratingScore = (profile.rating || 5) * 20; // Max 40 points

  // Delivery volume component (30%)
  const volumeScore = Math.min(30, (profile.totalDeliveries || 0) * 0.5);

  // On-time delivery component (20%)
  const onTimeDeliveries = shipments.filter((s) => s.status === 'delivered' && !s.isDelayed).length;
  const totalDeliveries = shipments.filter((s) => s.status === 'delivered').length;
  const onTimeRate = totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) * 20 : 0;

  // Availability component (10%)
  const availabilityScore = profile.isAvailable ? 10 : 5;

  const performanceScore = ratingScore + volumeScore + onTimeRate + availabilityScore;
  return Math.round(Math.min(100, performanceScore));
};

// Calculate shipment risk score (0-100)
export const calculateShipmentRiskScore = (shipment) => {
  if (!shipment) return 0;

  let riskScore = 0;
  const riskFactors = [];

  // Distance risk
  if (shipment.eta?.factors?.distance > 300) {
    riskScore += 20;
    riskFactors.push('Long distance');
  } else if (shipment.eta?.factors?.distance > 150) {
    riskScore += 10;
  }

  // Fragile items
  if (shipment.package?.type === 'fragile') {
    riskScore += 15;
    riskFactors.push('Fragile package');
  }

  // High value (if cost is high)
  if (shipment.estimatedCost > 5000) {
    riskScore += 10;
    riskFactors.push('High value shipment');
  }

  // Time-sensitive delivery
  if (shipment.deliverySpeed === 'same-day') {
    riskScore += 15;
    riskFactors.push('Same-day delivery pressure');
  }

  // Current delay status
  if (shipment.isDelayed) {
    riskScore += 30;
    riskFactors.push('Already delayed');
  }

  // ETA confidence (lower confidence = higher risk)
  if (shipment.eta?.confidence < 75) {
    riskScore += 10;
    riskFactors.push('Low ETA confidence');
  }

  return {
    score: Math.min(100, riskScore),
    riskFactors,
    level: riskScore > 50 ? 'high' : riskScore > 25 ? 'medium' : 'low',
  };
};

/**
 * AI Analytics Insights for admin dashboard
 */
export const generateAnalyticsInsights = (stats) => {
  const insights = [];
  if (stats.peakHour) insights.push({ type: 'peak', text: `Peak delivery hours: ${stats.peakHour}:00 - ${stats.peakHour + 2}:00` });
  if (stats.topDriver) insights.push({ type: 'driver', text: `Top performer: ${stats.topDriver.name} (${stats.topDriver.deliveries} deliveries)` });
  if (stats.delayRate > 10) insights.push({ type: 'warning', text: `Delay rate at ${stats.delayRate}% — consider assigning more drivers` });
  else insights.push({ type: 'success', text: `Delivery success rate: ${stats.successRate}%` });
  insights.push({ type: 'revenue', text: `Projected monthly revenue: ₹${(stats.revenue * 1.12).toLocaleString('en-IN')}` });
  return insights;
};
