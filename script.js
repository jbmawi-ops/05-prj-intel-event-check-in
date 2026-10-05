// ---- DOM elements (adjust IDs to match index.html) ----
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const greeting = document.getElementById("greeting");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const attendeeList = document.getElementById("attendeeList");
const celebration = document.getElementById("celebration");

// ---- State ----
const maxCount = 50;
let count = 0;
let attendees = []; // { name, teamName }
const teamCounts = {};  // keyed by option value, e.g. { water: 0, ... }
const teamNames = {};   // option value -> display name

// Build team data from the <select> so values/names are never hardcoded
Array.from(teamSelect.options).forEach(function (opt) {
  if (opt.value) {
    teamCounts[opt.value] = 0;
    teamNames[opt.value] = opt.text;
  }
});

// ---- Local storage ----
function saveProgress() {
  localStorage.setItem("summitData", JSON.stringify({ count, teamCounts, attendees }));
}

function loadProgress() {
  const saved = JSON.parse(localStorage.getItem("summitData"));
  if (!saved) return;
  count = saved.count || 0;
  attendees = saved.attendees || [];
  for (const team in teamCounts) {
    teamCounts[team] = (saved.teamCounts && saved.teamCounts[team]) || 0;
  }
}

// ---- Rendering ----
function render() {
  attendeeCount.textContent = count;

  const percentage = Math.min(100, Math.round((count / maxCount) * 100));
  progressBar.style.width = percentage + "%";

  for (const team in teamCounts) {
    document.getElementById(team + "Count").textContent = teamCounts[team];
  }

  attendeeList.innerHTML = "";
  attendees.forEach(function (a) {
    const li = document.createElement("li");
    li.textContent = a.name + " — " + a.teamName;
    attendeeList.appendChild(li);
  });
}

function showCelebration() {
  const top = Math.max(...Object.values(teamCounts));
  const winners = Object.keys(teamCounts)
    .filter(function (t) { return teamCounts[t] === top; })
    .map(function (t) { return teamNames[t]; });
  celebration.textContent =
    "🎉 Goal reached! " +
    (winners.length > 1 ? "It's a tie: " + winners.join(" & ") : winners[0] + " wins") +
    "!";
}

// ---- Form submission ----
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const team = teamSelect.value;
  if (!name || !team) return;

  const teamName = teamNames[team];

  count++;
  teamCounts[team]++;
  attendees.push({ name, teamName });

  greeting.textContent = "Welcome, " + name + "! You're checked in for " + teamName + ".";

  if (count === maxCount) showCelebration();

  saveProgress();
  render();
  form.reset();
});

// ---- Initial load ----
loadProgress();
render();
if (count >= maxCount) showCelebration();