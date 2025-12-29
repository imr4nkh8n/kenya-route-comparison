import { gradeResistance } from "./routeModel.js";

export function wheelTorque(vehicle, gearIndex) {
  return (
    vehicle.engineTorqueNm *
    vehicle.gearRatios[gearIndex] *
    vehicle.finalDrive *
    vehicle.drivetrainEfficiency
  );
}

export function tractiveForce(vehicle, gearIndex) {
  return wheelTorque(vehicle, gearIndex) / vehicle.tyreRadiusM;
}

export function speedFromRpm(vehicle, rpm, gearIndex) {
  const wheelRpm =
    rpm / (vehicle.gearRatios[gearIndex] * vehicle.finalDrive);

  return (2 * Math.PI * vehicle.tyreRadiusM * wheelRpm * 60) / 1000;
}

export function selectGear(vehicle, weightKg, gradientPercent) {
  const resistance = gradeResistance(weightKg, gradientPercent);

  for (let g = vehicle.gearRatios.length - 1; g >= 0; g--) {
    if (tractiveForce(vehicle, g) > resistance) {
      return g;
    }
  }
  return 0;
}

export function speedDecay(vehicle, gear, gradientPercent) {
  const penalty = gradientPercent * 0.06;
  const baseSpeed = speedFromRpm(vehicle, 1800, gear);
  return Math.max(baseSpeed * (1 - penalty), 12);
}
