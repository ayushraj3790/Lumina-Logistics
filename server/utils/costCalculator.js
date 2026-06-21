/**
 * Simple pricing logic based on weight, distance estimate, and speed
 */
export const calculateShipmentCost = ({ weight, deliverySpeed, distanceKm = 50 }) => {
  const baseRate = 40;
  const perKg = 15;
  const perKm = 2;
  let multiplier = 1;
  if (deliverySpeed === 'express') multiplier = 1.5;
  if (deliverySpeed === 'same-day') multiplier = 2.2;
  const cost = (baseRate + weight * perKg + distanceKm * perKm) * multiplier;
  return Math.round(cost * 100) / 100;
};
