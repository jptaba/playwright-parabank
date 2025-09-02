import fs from 'fs';
import path from 'path';

const registryPath = path.resolve(__dirname, './selectorRegistry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));

export function resolve(elementRef: string) {
  // elementRef like "login.usernameInput" or a direct selector
  if (!elementRef) return null;
  if (elementRef.includes('.')) {
    const [page, key] = elementRef.split('.');
    const pageDef = registry[page];
    if (pageDef && pageDef[key]) return pageDef[key];
  }
  // fallback: treat as direct selector
  return { selectors: [elementRef] };
}

export function resolvePage(pageJsonPath: string) {
  const pageJson = JSON.parse(fs.readFileSync(pageJsonPath, 'utf-8'));
  const elements: any = {};
  for (const [k, v] of Object.entries(pageJson.elements || {})) {
    const entry = v as any;
    let resolved: any = null;
    if (entry && entry.fromRegistry) {
      resolved = resolve(entry.fromRegistry);
    } else if (entry && entry.selector) {
      resolved = resolve(entry.selector);
    } else if (entry && entry.selectors) {
      resolved = { selectors: entry.selectors };
    }
    // normalize to ensure selectors array exists
    if (resolved && resolved.selectors) {
      elements[k] = {
        selectors: Array.isArray(resolved.selectors)
          ? resolved.selectors
          : [resolved.selectors],
      };
    } else if (resolved && resolved.selector) {
      elements[k] = { selectors: [resolved.selector] };
    } else if (entry) {
      // entry exists but resolution returned nothing (placeholder). Create empty selectors array for healing
      elements[k] = { selectors: [] };
    } else {
      elements[k] = null;
    }
  }
  return { ...pageJson, elements };
}
