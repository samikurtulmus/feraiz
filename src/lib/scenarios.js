// Kayıtlı senaryolar — localStorage üzerinde, urlState codec'i ile serileştirilir
import { encodeState, decodeState } from "./urlState.js";

const KEY = "feraiz.scenarios.v1";

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // storage dolu/kapalı — sessizce geç (kaydetme opsiyonel bir kolaylık)
  }
}

export function listScenarios() {
  return readAll().map(({ id, name, savedAt }) => ({ id, name, savedAt }));
}

export function saveScenario(name, state) {
  const list = readAll();
  const item = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: (name || "").trim() || `Senaryo ${list.length + 1}`,
    savedAt: new Date().toISOString(),
    qs: encodeState(state),
  };
  list.unshift(item);
  writeAll(list.slice(0, 50));
  return item;
}

export function loadScenario(id) {
  const item = readAll().find((x) => x.id === id);
  return item ? decodeState(item.qs) : null;
}

export function deleteScenario(id) {
  writeAll(readAll().filter((x) => x.id !== id));
}
