export function payloadUplift({
  operatingDays = 26,
  returnLoadFactor = 0.5,
  extraTons = 2
}) {
  const tripsPerMonth =
    operatingDays + operatingDays * returnLoadFactor;

  const extraMonthlyTons = tripsPerMonth * extraTons;
  const extraAnnualTons = extraMonthlyTons * 12;

  return {
    tripsPerMonth,
    extraMonthlyTons,
    extraAnnualTons
  };
}

export function costPerTonKm(cost, tons, distanceKm) {
  return cost / (tons * distanceKm);
}
