const stations = [
  { name: "Amsterdam Centraal", region: "Amsterdam, Netherlands", distance: 8.4, eta: 12 },
  { name: "Utrecht Centraal", region: "Utrecht, Netherlands", distance: 36.2, eta: 28 },
  { name: "Rotterdam Centraal", region: "Rotterdam, Netherlands", distance: 58.7, eta: 42 },
  { name: "Den Haag Centraal", region: "The Hague, Netherlands", distance: 51.1, eta: 39 },
  { name: "Bruxelles-Midi", region: "Brussels, Belgium", distance: 165.4, eta: 118 },
  { name: "London St Pancras", region: "London, United Kingdom", distance: 357.9, eta: 241 }
];

const recentStations = stations.slice(0, 3);

const state = {
  selectedStation: null,
  leadMinutes: 5,
  alarmActive: false,
  snoozeUsed: false,
  networkOnline: navigator.onLine
};

const $ = (selector) => document.querySelector(selector);
const screens = {
  home: $("#screen-home"),
  setup: $("#screen-setup"),
  fired: $("#screen-fired")
};

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  screens[name].classList.add("active");
}

function formatMinutes(minutes) {
  return `${minutes} min`;
}

function stationRow(station) {
  const button = document.createElement("button");
  button.className = "station-row";
  button.type = "button";
  button.innerHTML = `
    <span class="station-dot" aria-hidden="true"></span>
    <span>
      <strong>${station.name}</strong>
      <span>${station.region}</span>
    </span>
  `;
  button.addEventListener("click", () => selectStation(station));
  return button;
}

function renderStationList(target, list) {
  target.innerHTML = "";
  list.forEach((station) => target.appendChild(stationRow(station)));
}

function resetSetup() {
  $("#destination-step").classList.remove("hidden");
  $("#lead-step").classList.add("hidden");
  $("#station-search").value = "";
  $("#suggestion-list").classList.add("hidden");
  $("#recent-block").classList.remove("hidden");
  state.selectedStation = null;
  updateNetworkState();
}

function selectStation(station) {
  state.selectedStation = station;
  $("#selected-station-name").textContent = station.name;
  $("#destination-step").classList.add("hidden");
  $("#lead-step").classList.remove("hidden");
}

function updateLeadSelection(minutes) {
  state.leadMinutes = minutes;
  document.querySelectorAll(".lead-option").forEach((button) => {
    button.classList.toggle("selected", Number(button.dataset.minutes) === minutes);
  });
}

function updateNetworkState() {
  state.networkOnline = navigator.onLine;
  $("#network-message").classList.toggle("hidden", state.networkOnline);
  $("#confirm-alarm").disabled = !state.networkOnline;
}

function setAlarm() {
  const custom = Number($("#custom-minutes").value);
  if (custom > 0) {
    updateLeadSelection(custom);
  }

  if (!state.selectedStation || !state.networkOnline) return;

  state.alarmActive = true;
  state.snoozeUsed = false;
  $("#empty-state").classList.add("hidden");
  $("#active-card").classList.remove("hidden");
  $("#active-destination").textContent = state.selectedStation.name;
  $("#lead-display").textContent = formatMinutes(state.leadMinutes);
  $("#distance-remaining").textContent = `${state.selectedStation.distance.toFixed(1)} km`;
  $("#eta-remaining").textContent = formatMinutes(state.selectedStation.eta);
  $("#progress-fill").style.width = `${Math.max(12, 100 - state.selectedStation.distance)}%`;
  showScreen("home");
}

function cancelAlarm() {
  state.alarmActive = false;
  $("#active-card").classList.add("hidden");
  $("#empty-state").classList.remove("hidden");
}

function fireAlarm() {
  if (!state.alarmActive) return;
  $("#fired-destination").textContent = state.selectedStation.name;
  $("#fired-copy").textContent = `You are about ${state.leadMinutes} minutes from arrival.`;
  $("#snooze-alarm").disabled = state.snoozeUsed;
  $("#snooze-note").textContent = state.snoozeUsed
    ? "Snooze has already been used for this alarm."
    : "Snooze is available once for 2 minutes.";
  showScreen("fired");
}

function dismissAlarm() {
  cancelAlarm();
  showScreen("home");
}

function snoozeAlarm() {
  if (state.snoozeUsed) return;
  state.snoozeUsed = true;
  showScreen("home");
}

renderStationList($("#recent-list"), recentStations);

$("#start-flow").addEventListener("click", () => {
  resetSetup();
  showScreen("setup");
});

$("#back-home").addEventListener("click", () => showScreen("home"));
$("#edit-alarm").addEventListener("click", () => {
  resetSetup();
  if (state.selectedStation) selectStation(state.selectedStation);
  showScreen("setup");
});
$("#cancel-alarm").addEventListener("click", cancelAlarm);
$("#confirm-alarm").addEventListener("click", setAlarm);
$("#dismiss-alarm").addEventListener("click", dismissAlarm);
$("#snooze-alarm").addEventListener("click", snoozeAlarm);
$("#permission-button").addEventListener("click", () => {
  alert("StopAlert needs Always location and notifications so the alarm can fire while the phone is locked.");
});

$("#station-search").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  const suggestions = stations.filter((station) => {
    const haystack = `${station.name} ${station.region}`.toLowerCase();
    return haystack.includes(query);
  });

  $("#recent-block").classList.toggle("hidden", query.length > 0);
  $("#suggestion-list").classList.toggle("hidden", query.length === 0);
  renderStationList($("#suggestion-list"), suggestions);
});

document.querySelectorAll(".lead-option").forEach((button) => {
  button.addEventListener("click", () => {
    $("#custom-minutes").value = "";
    updateLeadSelection(Number(button.dataset.minutes));
  });
});

$("#custom-minutes").addEventListener("input", (event) => {
  const minutes = Number(event.target.value);
  if (minutes > 0) {
    updateLeadSelection(minutes);
  }
});

window.addEventListener("online", updateNetworkState);
window.addEventListener("offline", updateNetworkState);

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "f") {
    fireAlarm();
  }
});

setInterval(() => {
  if (!state.alarmActive || screens.fired.classList.contains("active")) return;

  const current = Number.parseFloat($("#distance-remaining").textContent);
  const next = Math.max(0.4, current - 0.2);
  $("#distance-remaining").textContent = `${next.toFixed(1)} km`;
  $("#eta-remaining").textContent = formatMinutes(Math.max(1, Math.round(next * 1.4)));
  $("#progress-fill").style.width = `${Math.min(94, 100 - next * 4)}%`;

  if (Math.round(next * 1.4) <= state.leadMinutes) {
    fireAlarm();
  }
}, 1800);
