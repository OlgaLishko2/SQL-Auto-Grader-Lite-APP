const DB_STORAGE_PREFIX = "sql-auto-grader-lite:";

//Convert Uint8Array bytes to base64 string for storage
function toBase64(uint8Array) {
  let binary = "";
  const bytes = new Uint8Array(uint8Array);
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

//Convert base64 string back to Uint8Array bytes
function fromBase64(base64String) {
  const binary = atob(base64String);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getStorageKey(datasetKey) {
  return `${DB_STORAGE_PREFIX}${datasetKey}`;
}

//Load persisted DB bytes for a dataset
export function loadPersistedDatabase(datasetKey) {
  try {
    const encoded = localStorage.getItem(getStorageKey(datasetKey));
    if (!encoded) return null;
    return fromBase64(encoded);
  } catch (e) {
    console.error("Failed to load persisted DB:", e.message);
    return null;
  }
}


//Persist current DB snapshot. Returns true on success.
export function persistDatabase(datasetKey, db) {
  if (!db) return false;
  try {
    const bytes = db.export();
    localStorage.setItem(getStorageKey(datasetKey), toBase64(bytes));
    return true;
  } catch (e) {
    console.error("Failed to persist DB:", e.message);
    return false;
  }
}

