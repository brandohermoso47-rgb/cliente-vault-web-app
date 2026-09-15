import type { z } from 'zod';

/**
 * CRUD genérico sobre una lista JSON en localStorage, validada con un esquema
 * zod al leer (las entradas corruptas o de un esquema antiguo se descartan en
 * silencio en vez de romper la app) y con try/catch alrededor de localStorage
 * (puede lanzar en modo incógnito o con la cuota agotada).
 */
export function createCollectionStore<T extends { id: string }>(key: string, schema: z.ZodType<T>) {
  function list(): T[] {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const valid: T[] = [];
      for (const item of parsed) {
        const result = schema.safeParse(item);
        if (result.success) valid.push(result.data);
      }
      return valid;
    } catch (err) {
      console.warn(`No se pudo leer ${key} de localStorage`, err);
      return [];
    }
  }

  function persist(items: T[]) {
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch (err) {
      console.warn(`No se pudo guardar ${key} en localStorage`, err);
    }
  }

  function get(id: string): T | undefined {
    return list().find((item) => item.id === id);
  }

  function save(item: T) {
    const items = list();
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.push(item);
    persist(items);
  }

  function remove(id: string) {
    persist(list().filter((item) => item.id !== id));
  }

  return { list, get, save, remove };
}
