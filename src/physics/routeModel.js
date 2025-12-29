export function gradeResistance(weightKg, gradientPercent) {
  const g = 9.81;
  return weightKg * g * (gradientPercent / 100);
}
