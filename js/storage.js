import {
  initialClubs,
  initialMembers,
  initialRecruitments,
  initialEvents,
  initialFinances,
  initialActivities
} from './data.js';

const STORAGE_KEY = 'humg_clubs_manager_db_v3';
const listeners = [];

export function getInitialState() {
  return {
    clubs: JSON.parse(JSON.stringify(initialClubs)),
    members: JSON.parse(JSON.stringify(initialMembers)),
    recruitments: JSON.parse(JSON.stringify(initialRecruitments)),
    events: JSON.parse(JSON.stringify(initialEvents)),
    finances: JSON.parse(JSON.stringify(initialFinances)),
    activities: JSON.parse(JSON.stringify(initialActivities)),
    lastUpdated: new Date().toISOString()
  };
}

export function loadData() {
  try {
    if (typeof localStorage === 'undefined') {
      return getInitialState();
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialState();
      saveData(initial, false);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.clubs || !parsed.members) {
      const initial = getInitialState();
      saveData(initial, false);
      return initial;
    }
    return parsed;
  } catch (e) {
    console.error('Lỗi khi tải dữ liệu từ localStorage:', e);
    return getInitialState();
  }
}

export function saveData(data, notify = true) {
  try {
    data.lastUpdated = new Date().toISOString();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    if (notify) {
      notifyListeners(data);
    }
  } catch (e) {
    console.error('Lỗi khi ghi dữ liệu vào localStorage:', e);
  }
}

export function resetData() {
  const initial = getInitialState();
  saveData(initial, true);
  return initial;
}

export function exportJSON() {
  const data = loadData();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `humg_clubs_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importJSON(jsonStr) {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.clubs || !Array.isArray(parsed.clubs)) {
      throw new Error("File JSON không hợp lệ cấu trúc CLB HUMG!");
    }
    saveData(parsed, true);
    return true;
  } catch (e) {
    console.error('Import thất bại:', e);
    return false;
  }
}

export function subscribe(callback) {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notifyListeners(data) {
  listeners.forEach(fn => {
    try {
      fn(data);
    } catch (e) {
      console.error(e);
    }
  });
}
