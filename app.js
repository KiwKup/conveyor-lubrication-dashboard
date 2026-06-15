let consumptionData = [];
let monthlyChart, groupChart, equipmentChart;
const monthFilter = document.getElementById('monthFilter');
const conveyorFilter = document.getElementById('conveyorFilter');
const groupFilter = document.getElementById('groupFilter');

document.getElementById('excelFile').addEventListener('change', handleFile);
[monthFilter, conveyorFilter, groupFilter].forEach(f => f.addEventListener('change', updateDashboard));

function handleFile(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    const workbook = XLSX.read(evt.target.result, {type:'array', cellDates:true});
    const sheet = workbook.Sheets['Consumption'];
    if(!sheet){ alert('ไม่พบ Sheet ชื่อ Consumption'); return; }
    const rows = XLSX.utils.sheet_to_json(sheet, {defval:''});
    consumptionData = rows.filter(r => r.Date && r.Lubricant_Group).map(r => ({
      date: formatDate(r.Date),
      month: r.Month || getMonth(r.Date),
      conveyor: r.Conveyor || '',
      system: r.System || '',
      equipment: r.Equipment || '',
      point: r.Point || '',
      group: r.Lubricant_Group || '',
      lubricant: r.Lubricant_Name || '',
      type: r.Type || '',
      unit: r.Unit || '',
      qty: Number(r.Qty_Used || 0),
      plan: Number(r.Plan_Qty || 0),
      stock: Number(r.Stock_Remain || 0),
      costUnit: Number(r.Cost_Unit || 0),
      totalCost: Number(r.Total_Cost || (Number(r.Qty_Used||0)*Number(r.Cost_Unit||0)))
    }));
    setupFilters();
    updateDashboard();
  };
  reader.readAsArrayBuffer(file);
}
function formatDate(v){ if(v instanceof Date) return v.toISOString().slice(0,10); return String(v).slice(0,10); }
function getMonth(v){ return formatDate(v).slice(0,7); }
function optionList(data,key){ return ['All',...new Set(data.map(x=>x[key]).filter(Boolean))]; }
function setupFilters(){
  monthFilter.innerHTML=''; conveyorFilter.innerHTML=''; groupFilter.innerHTML='';
  optionList(consumptionData,'month').forEach(v=>monthFilter.innerHTML+=`<option value="${v}">${v==='All'?'ทั้งหมด':v}</option>`);
  optionList(consumptionData,'conveyor').forEach(v=>conveyorFilter.innerHTML+=`<option value="${v}">${v==='All'?'ทั้งหมด':v}</option>`);
  optionList(consumptionData,'group').forEach(v=>groupFilter.innerHTML+=`<option value="${v}">${v==='All'?'ทั้งหมด':v}</option>`);
}
function filtered(){ return consumptionData.filter(x=>(monthFilter.value==='All'||x.month===monthFilter.value)&&(conveyorFilter.value==='All'||x.conveyor===conveyorFilter.value)&&(groupFilter.value==='All'||x.group===groupFilter.value)); }
function sum(arr,fn){ return arr.reduce((t,x)=>t+fn(x),0); }
function groupBy(arr,key){ const o={}; arr.forEach(x=>o[x[key]]=(o[x[key]]||0)+x.qty); return o; }
function status(x){ const p=x.plan?((x.qty-x.plan)/x.plan)*100:0; if(p<=0)return ['GREEN','green']; if(p<=10)return ['YELLOW','yellow']; return ['RED','red']; }
function updateKpi(data){
  const oil=sum(data,x=>x.type==='Oil'?x.qty:0), grease=sum(data,x=>x.type==='Grease'?x.qty:0), actual=sum(data,x=>x.qty), plan=sum(data,x=>x.plan), cost=sum(data,x=>x.totalCost);
  document.getElementById('oilUsage').textContent = oil.toLocaleString()+' L';
  document.getElementById('greaseUsage').textContent = grease.toLocaleString()+' kg';
  document.getElementById('actualVsPlan').textContent = plan?(((actual-plan)/plan)*100).toFixed(1)+'%':'0%';
  document.getElementById('totalCost').textContent = cost.toLocaleString()+' THB';
}
function drawCharts(data){
  if(monthlyChart)monthlyChart.destroy(); if(groupChart)groupChart.destroy(); if(equipmentChart)equipmentChart.destroy();
  const m=groupBy(data,'month'); monthlyChart=new Chart(document.getElementById('monthlyChart'),{type:'line',data:{labels:Object.keys(m),datasets:[{label:'Qty Used',data:Object.values(m),tension:.3}]}});
  const g=groupBy(data,'group'); groupChart=new Chart(document.getElementById('groupChart'),{type:'doughnut',data:{labels:Object.keys(g),datasets:[{data:Object.values(g)}]}});
  const e=Object.entries(groupBy(data,'equipment')).sort((a,b)=>b[1]-a[1]).slice(0,10); equipmentChart=new Chart(document.getElementById('equipmentChart'),{type:'bar',data:{labels:e.map(x=>x[0]),datasets:[{label:'Qty Used',data:e.map(x=>x[1])}]}});
}
function drawTable(data){
  const tb=document.getElementById('dataTable'); tb.innerHTML='';
  data.forEach(x=>{const s=status(x); tb.innerHTML+=`<tr><td>${x.date}</td><td>${x.month}</td><td>${x.conveyor}</td><td>${x.system}</td><td>${x.equipment}</td><td>${x.group}</td><td>${x.lubricant}</td><td>${x.qty} ${x.unit}</td><td>${x.plan}</td><td>${x.totalCost.toLocaleString()}</td><td class="${s[1]}">${s[0]}</td></tr>`});
}
function updateDashboard(){ const d=filtered(); updateKpi(d); drawCharts(d); drawTable(d); }
