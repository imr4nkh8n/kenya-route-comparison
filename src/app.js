// ===============================
// App bootstrap
// ===============================
console.log("Phase C App.js loaded");

// Register Chart.js zoom
Chart.register(ChartZoom);

let charts = [];

// ===============================
// Data
// ===============================
const routes = {
  "nairobi-nakuru": { dist: 160, elev: [1795,1800,1820,1900,2100,2350,2600,2850,3050,2900,2600,2300,2000,1800,1730] },
  "nairobi-mombasa": { dist: 480, elev: [1795,1900,2200,2600,3000,3400,3000,2600,2200,1800,1400,1000,600,200] },
  "nairobi-eldoret": { dist: 320, elev: [1795,2000,2400,2600,2300,2000,1700,1400,1100] }
};

const trucks = {
  fuso: {
    name: "Fuso FI 1217R",
    kerb: 14800,
    payload: 12000,
    crr: 0.006,
    eff: 0.38
  },
  isuzu: {
    name: "Isuzu FRR90N",
    kerb: 14800,
    payload: 10000,
    crr: 0.007,
    eff: 0.36
  }
};

const gears = [
  { gear: 1, max: 15 },
  { gear: 2, max: 25 },
  { gear: 3, max: 40 },
  { gear: 4, max: 55 },
  { gear: 5, max: 70 },
  { gear: 6, max: 90 }
];

// ===============================
// Helpers
// ===============================
function resetCharts() {
  charts.forEach(c => c.destroy());
  charts = [];
}

function simulateTruck(truck, route, dieselCost) {
  const step = route.dist / (route.elev.length - 1);
  let speeds = [];
  let totalFuel = 0;

  for (let i = 0; i < route.elev.length; i++) {
    let grade = i ? (route.elev[i] - route.elev[i - 1]) / (step * 1000) : 0;
    let speed = Math.max(40, 80 - grade * 320);
    speeds.push(speed);

    let mass = truck.kerb + truck.payload;
    let force = mass * 9.81 * (grade + truck.crr);
    let power = force * (speed / 3.6) / 1000;
    let fuel = (power / (truck.eff * 36)) * dieselCost;

    totalFuel += fuel * step;
  }

  return {
    avgSpeed: speeds.reduce((a, b) => a + b) / speeds.length,
    totalFuel
  };
}

// ===============================
// MAIN ACTION
// ===============================
function generate() {
  resetCharts();

  const r = routes[route.value];
  const dieselCost = +diesel.value;
  const hireRate = +hire.value;

  const fusoSim = simulateTruck(trucks.fuso, r, dieselCost);
  const isuzuSim = simulateTruck(trucks.isuzu, r, dieselCost);

  // Gear usage (based on generic speed profile)
  const step = r.dist / (r.elev.length - 1);
  let gearUsage = [0,0,0,0,0,0];

  r.elev.forEach((_, i) => {
    let grade = i ? (r.elev[i] - r.elev[i - 1]) / (step * 1000) : 0;
    let speed = Math.max(40, 80 - grade * 300);
    let g = gears.findIndex(x => speed <= x.max);
    if (g === -1) g = 5;
    gearUsage[g] += step;
  });

  // KPIs
  kpiDist.innerText = `${r.dist} km`;
  kpiSpeed.innerText = `${fusoSim.avgSpeed.toFixed(1)} km/h`;
  kpiFuel.innerText = `KES ${fusoSim.totalFuel.toFixed(0)}`;
  kpiProfit.innerText = `KES ${(hireRate - fusoSim.totalFuel).toFixed(0)}`;

  // Charts
  charts.push(new Chart(gearChart, {
    type: "bar",
    data: {
      labels: ["1","2","3","4","5","6"],
      datasets: [{
        label: "Distance per Gear (km)",
        data: gearUsage.map(v => Math.round(v)),
        backgroundColor: "#00f0ff"
      }]
    }
  }));

  // Sales metrics
  const tripsPerMonth = 39;
  const extraTonsMonth = tripsPerMonth * 2;
  const extraTonsYear = extraTonsMonth * 12;

  const tonKmFuso = r.dist * 12;
  const tonKmIsuzu = r.dist * 10;

  summary.innerHTML = `
    <tr><th>Metric</th><th>Fuso</th><th>Isuzu</th></tr>
    <tr><td>Fuel / Trip</td><td class="good">KES ${fusoSim.totalFuel.toFixed(0)}</td><td>KES ${isuzuSim.totalFuel.toFixed(0)}</td></tr>
    <tr><td>Cost / ton-km</td><td class="good">KES ${(fusoSim.totalFuel/tonKmFuso).toFixed(2)}</td><td>KES ${(isuzuSim.totalFuel/tonKmIsuzu).toFixed(2)}</td></tr>
    <tr><td>Extra Payload / Month</td><td colspan="2" class="good">${extraTonsMonth} tons</td></tr>
    <tr><td>Extra Payload / Year</td><td colspan="2" class="good">${extraTonsYear} tons</td></tr>
  `;
}

// Make button work
window.generate = generate;
