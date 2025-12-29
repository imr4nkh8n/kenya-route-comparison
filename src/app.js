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

const trucks={ 
  fuso:{mass:24800,crr:0.006,eff:0.38}, 
  isuzu:{mass:21000,crr:0.007,eff:0.36} 
}; 

function resetCharts(){ 
  charts.forEach(c=>c.destroy()); 
  charts=[]; 
} 

function generate(){ 
  resetCharts(); 
  
  const r=routes[route.value]; 
  const t=trucks[truck.value]; 
  const payloadKg=payload.value*1000; 
  const dieselCost=+diesel.value; 
  const hireRate=+hire.value; 
  
  const step=r.dist/(r.elev.length-1); 
  let speeds=[],fuel=[]; 
  let totalFuel=0; 
  
  for(let i=0;i<r.elev.length;i++){ 
    let grade=i? (r.elev[i]-r.elev[i-1])/(step*1000):0; 
    let speed=80-Math.max(0,grade*300); 
    if(speed<40)speed=40; 
    speeds.push(speed); 
    
    let force=(t.mass+payloadKg)*9.81*(grade+t.crr); 
    let power=force*(speed/3.6)/1000; 
    let f=(power/(t.eff*36))*dieselCost; 
    fuel.push(f); 
    totalFuel+=f*step; 
  } 
  
  const avgSpeed=speeds.reduce((a,b)=>a+b)/speeds.length; 
  const profit=hireRate-totalFuel; 
  
  kpiDist.innerText = `${r.dist} km`;
kpiSpeed.innerText = `${avgSpeed.toFixed(1)} km/h`;
kpiFuel.innerText = `KES ${totalFuel.toFixed(0)}`;
kpiProfit.innerText = `KES ${profit.toFixed(0)}`;

const route = document.getElementById("route");
const truck = document.getElementById("truck");
const payload = document.getElementById("payload");
const diesel = document.getElementById("diesel");
const hire = document.getElementById("hire");

const kpiDist = document.getElementById("kpiDist");
const kpiSpeed = document.getElementById("kpiSpeed");
const kpiFuel = document.getElementById("kpiFuel");
const kpiProfit = document.getElementById("kpiProfit");

const elevChart = document.getElementById("elevChart");
const speedChart = document.getElementById("speedChart");
const fuelChart = document.getElementById("fuelChart");
const gearChart = document.getElementById("gearChart");

const summary = document.getElementById("summary");

  
  charts.push(new Chart(elevChart,{ 
    type:"line", 
    data:{labels:r.elev.map((_,i)=>Math.round(i*step)), 
          datasets:[{label:"Elevation (m)",data:r.elev,borderColor:"#38bdf8",borderWidth:1.5}]}, 
    options:{plugins:{title:{display:true,text:"Elevation Profile"},zoom:{zoom:{wheel:{enabled:true},pinch:{enabled:true}}}}, 
             scales:{x:{title:{display:true,text:"Distance (km)"}},y:{title:{display:true,text:"m"}}}} })); 
  
  charts.push(new Chart(speedChart,{ type:"line", 
                                    data:{labels:r.elev.map((_,i)=>Math.round(i*step)), 
                                          datasets:[{label:"Speed (km/h)",data:speeds,borderColor:"#22c55e",borderWidth:1.5}]}, 
                                    options:{plugins:{title:{display:true,text:"Speed vs Distance"},zoom:{zoom:{wheel:{enabled:true}}}}, 
                                             scales:{x:{title:{display:true,text:"Distance (km)"}},y:{title:{display:true,text:"km/h"}}}} })); 
  
  charts.push(new Chart(fuelChart,{ type:"line", 
                                   data:{labels:r.elev.map((_,i)=>Math.round(i*step)), 
                                         datasets:[{label:"Fuel Cost (KES/km)",data:fuel,borderColor:"#ef4444",borderWidth:1.5}]}, 
                                   options:{plugins:{title:{display:true,text:"Fuel Intensity"},zoom:{zoom:{wheel:{enabled:true}}}}, 
                                            scales:{x:{title:{display:true,text:"Distance (km)"}},y:{title:{display:true,text:"KES/km"}}}} })); 
  
  charts.push(new Chart(gearChart,{ type:"bar", 
                                   data:{labels:["1","2","3","4","5","6"], 
                                         datasets:[{label:"Gear Usage (placeholder)",data:[5,12,22,30,20,11],backgroundColor:"#00f0ff"}]}, 
                                   options:{plugins:{title:{display:true,text:"Gear Usage (Phase C placeholder)"}}} })); 
  
  summary.innerHTML = `
  <tr><th>Metric</th><th>${truck.options[truck.selectedIndex].text}</th></tr>
  <tr><td>Fuel Cost</td><td class="good">KES ${totalFuel.toFixed(0)}</td></tr>
  <tr><td>Avg Speed</td><td>${avgSpeed.toFixed(1)} km/h</td></tr>
  <tr><td>Trip Profit</td><td class="good">KES ${profit.toFixed(0)}</td></tr>
  <tr><td colspan="2">Maintains higher climb speed with lower fuel penalty on Kenyan gradients.</td></tr>
`;

window.generate = generate;
