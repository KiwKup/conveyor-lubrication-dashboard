let monthlyChart, typeChart, equipmentChart;

const monthFilter = document.getElementById("monthFilter");
const systemFilter = document.getElementById("systemFilter");
const typeFilter = document.getElementById("typeFilter");

function uniqueValues(data, key) {
  return ["All", ...new Set(data.map(item => item[key]))];
}

function setupFilters() {
  uniqueValues(lubricationData, "month").forEach(value => {
    monthFilter.innerHTML += `<option value="${value}">${value === "All" ? "ทั้งหมด" : value}</option>`;
  });

  uniqueValues(lubricationData, "system").forEach(value => {
    systemFilter.innerHTML += `<option value="${value}">${value === "All" ? "ทั้งหมด" : value}</option>`;
  });

  [monthFilter, systemFilter, typeFilter].forEach(filter => {
    filter.addEventListener("change", updateDashboard);
  });
}

function getFilteredData() {
  return lubricationData.filter(item => {
    return (monthFilter.value === "All" || item.month === monthFilter.value) &&
           (systemFilter.value === "All" || item.system === systemFilter.value) &&
           (typeFilter.value === "All" || item.type === typeFilter.value);
  });
}

function sum(data, condition) {
  return data.filter(condition).reduce((total, item) => total + item.qty, 0);
}

function getStatus(item) {
  const percent = ((item.qty - item.plan) / item.plan) * 100;
  if (percent <= 0) return { text: "เขียว", className: "status-green" };
  if (percent <= 10) return { text: "เหลือง", className: "status-yellow" };
  return { text: "แดง", className: "status-red" };
}

function updateKPI(data) {
  const oil = sum(data, item => item.type === "Oil");
  const grease = sum(data, item => item.type === "Grease");
  const actual = data.reduce((total, item) => total + item.qty, 0);
  const plan = data.reduce((total, item) => total + item.plan, 0);
  const stock = data.reduce((total, item) => total + item.stock, 0);
  const avgDailyUse = actual / 30;
  const stockDays = avgDailyUse > 0 ? stock / avgDailyUse : 0;

  document.getElementById("oilUsage").textContent = oil.toLocaleString() + " L";
  document.getElementById("greaseUsage").textContent = grease.toLocaleString() + " kg";
  document.getElementById("actualVsPlan").textContent = plan > 0 ? (((actual - plan) / plan) * 100).toFixed(1) + "%" : "0%";
  document.getElementById("stockDays").textContent = stockDays.toFixed(0) + " วัน";
}

function groupBy(data, key) {
  const result = {};
  data.forEach(item => {
    result[item[key]] = (result[item[key]] || 0) + item.qty;
  });
  return result;
}

function renderCharts(data) {
  if (monthlyChart) monthlyChart.destroy();
  if (typeChart) typeChart.destroy();
  if (equipmentChart) equipmentChart.destroy();

  const monthly = groupBy(data, "month");
  monthlyChart = new Chart(document.getElementById("monthlyChart"), {
    type: "line",
    data: {
      labels: Object.keys(monthly),
      datasets: [{ label: "Qty Used", data: Object.values(monthly), tension: 0.3 }]
    },
    options: { responsive: true }
  });

  const type = groupBy(data, "type");
  typeChart = new Chart(document.getElementById("typeChart"), {
    type: "doughnut",
    data: {
      labels: Object.keys(type),
      datasets: [{ data: Object.values(type) }]
    },
    options: { responsive: true }
  });

  const equipment = groupBy(data, "equipment");
  const topEquipment = Object.entries(equipment).sort((a, b) => b[1] - a[1]).slice(0, 10);

  equipmentChart = new Chart(document.getElementById("equipmentChart"), {
    type: "bar",
    data: {
      labels: topEquipment.map(item => item[0]),
      datasets: [{ label: "Qty Used", data: topEquipment.map(item => item[1]) }]
    },
    options: { responsive: true }
  });
}

function renderTable(data) {
  const table = document.getElementById("dataTable");
  table.innerHTML = "";

  data.forEach(item => {
    const status = getStatus(item);
    table.innerHTML += `
      <tr>
        <td>${item.date}</td>
        <td>${item.system}</td>
        <td>${item.equipment}</td>
        <td>${item.point}</td>
        <td>${item.type}</td>
        <td>${item.lubricant}</td>
        <td>${item.qty} ${item.unit}</td>
        <td>${item.stock}</td>
        <td>${item.plan}</td>
        <td class="${status.className}">${status.text}</td>
      </tr>
    `;
  });
}

function updateDashboard() {
  const data = getFilteredData();
  updateKPI(data);
  renderCharts(data);
  renderTable(data);
}

setupFilters();
updateDashboard();
