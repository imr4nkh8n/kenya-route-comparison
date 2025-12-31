// ===============================
// App bootstrap
// ===============================
console.log("Phase C App.js loaded");

// Chart.js plugins
Chart.register(ChartZoom);
let charts=[]; 
const routes={ 
  "nairobi-nakuru":{dist:160,elev:[1795,1800,1820,1900,2100,2350,2600,2850,3050,2900,2600,2300,2000,1800,1730]}, 
  "nairobi-mombasa":{dist:480,elev:[1795,1900,2200,2600,3000,3400,3000,2600,2200,1800,1400,1000,600,200]}, 
  "nairobi-eldoret":{dist:320,elev:[1795,2000,2400,2600,2300,2000,1700,1400,1100]} }; 

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

function resetCharts(){ 
  charts.forEach(c=>c.destroy()); 
  charts=[]; 
} 

function simulateTruck(truck, route, dieselCost) {
  const step = route.dist / (route.elev.length - 1);
  let speeds = [], fuel = [];
  let totalFuel = 0;

  for (let i = 0; i < route.elev.length; i++) {
    let grade = i ? (route.elev[i] - route.elev[i - 1]) / (step * 1000) : 0;
    let speed = 80 - Math.max(0, grade * 320);
    if (speed < 40) speed = 40;

    speeds.push(speed);

    let mass = truck.kerb + truck.payload;
    let force = mass * 9.81 * (grade + truck.crr);
    let power = force * (speed / 3.6) / 1000;
    let f = (power / (truck.eff * 36)) * dieselCost;

    fuel.push(f);
    totalFuel += f * step;
  }

  return {
    avgSpeed: speeds.reduce((a, b) => a + b) / speeds.length,
    totalFuel
  };
}

function generate() {
  resetCharts();

  const r = routes[route.value];
  const fuso = trucks.fuso;
  const isuzu = trucks.isuzu;
  const payloadKg = payload.value * 1000;
  const dieselCost = +diesel.value;
  const hireRate = +hire.value;

  const step = r.dist / (r.elev.length - 1);
  let speeds = [], fuel = [];
  let totalFuel = 0;
  let gearUsage = [0, 0, 0, 0, 0, 0];

  for (let i = 0; i < r.elev.length; i++) {
    let grade = i ? (r.elev[i] - r.elev[i - 1]) / (step * 1000) : 0;
    let speed = 80 - Math.max(0, grade * 300);
    if (speed < 40) speed = 40;
    speeds.push(speed);
    let gearIndex = gears.findIndex(g => speed <= g.max);
if (gearIndex === -1) gearIndex = gears.length - 1;
gearUsage[gearIndex] += step;


    let force = (t.mass + payloadKg) * 9.81 * (grade + t.crr);
    let power = force * (speed / 3.6) / 1000;
    let f = (power / (t.eff * 36)) * dieselCost;
    fuel.push(f);
    totalFuel += f * step;
  }

  const avgSpeed = speeds.reduce((a, b) => a + b) / speeds.length;
  const profit = hireRate - totalFuel;

  kpiDist.innerText = `${r.dist} km`;
  kpiSpeed.innerText = `${avgSpeed.toFixed(1)} km/h`;
  kpiFuel.innerText = `KES ${totalFuel.toFixed(0)}`;
  kpiProfit.innerText = `KES ${profit.toFixed(0)}`;

const routeObj = routes[route.value];
const dieselCost = +diesel.value;

const fusoSim = simulateTruck(fuso, routeObj, dieselCost);
const isuzuSim = simulateTruck(isuzu, routeObj, dieselCost);

const tripsPerMonth = 39;
const extraTonsPerTrip = fuso.payload / 1000 - isuzu.payload / 1000;

const extraTonsMonth = tripsPerMonth * extraTonsPerTrip;
const extraTonsYear = extraTonsMonth * 12;

const tonKmFuso = routeObj.dist * (fuso.payload / 1000);
const tonKmIsuzu = routeObj.dist * (isuzu.payload / 1000);

const costPerTonKmFuso = fusoSim.totalFuel / tonKmFuso;
const costPerTonKmIsuzu = isuzuSim.totalFuel / tonKmIsuzu;
  
  
  charts.push(new Chart(elevChart, {
    type: "line",
    data: {
      labels: r.elev.map((_, i) => Math.round(i * step)),
      datasets: [{
        label: "Elevation (m)",
        data: r.elev,
        borderColor: "#38bdf8",
        borderWidth: 1.5
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: "Elevation Profile" },
        zoom: { zoom: { wheel: { enabled: true }, pinch: { enabled: true } } }
      }
    }
  }));

  charts.push(new Chart(speedChart, {
    type: "line",
    data: {
      labels: r.elev.map((_, i) => Math.round(i * step)),
      datasets: [{
        label: "Speed (km/h)",
        data: speeds,
        borderColor: "#22c55e",
        borderWidth: 1.5
      }]
    }
  }));

  charts.push(new Chart(fuelChart, {
    type: "line",
    data: {
      labels: r.elev.map((_, i) => Math.round(i * step)),
      datasets: [{
        label: "Fuel Cost (KES/km)",
        data: fuel,
        borderColor: "#ef4444",
        borderWidth: 1.5
      }]
    }
  }));

charts.push(new Chart(gearChart, {
  type: "bar",
  data: {
    labels: ["1", "2", "3", "4", "5", "6"],
    datasets: [{
      label: "Distance per Gear (km)",
      data: gearUsage.map(v => Math.round(v)),
      backgroundColor: "#00f0ff"
    }]
  },
  options: {
    plugins: {
      title: { display: true, text: "Gear Utilization" }
    }
  }
}));

  
  summary.innerHTML = `
<tr><th>Metric</th><th>Fuso FI 1217R</th><th>Isuzu FRR90N</th></tr>

<tr>
  <td>Fuel Cost / Trip</td>
  <td class="good">KES ${fusoSim.totalFuel.toFixed(0)}</td>
  <td>KES ${isuzuSim.totalFuel.toFixed(0)}</td>
</tr>

<tr>
  <td>Cost per ton-km</td>
  <td class="good">KES ${costPerTonKmFuso.toFixed(2)}</td>
  <td>KES ${costPerTonKmIsuzu.toFixed(2)}</td>
</tr>

<tr>
  <td>Extra Payload / Month</td>
  <td colspan="2" class="good">${extraTonsMonth} tons</td>
</tr>

<tr>
  <td>Extra Payload / Year</td>
  <td colspan="2" class="good">${extraTonsYear} tons</td>
</tr>

<tr>
  <td colspan="3">
    Fuso delivers more revenue per trip, lower cost per ton-km, and higher annual hauling capacity on Kenyan routes.
  </td>
</tr>
`;


window.generate = generate;
