const STORAGE_KEY = 'cmb.device-name';
const PREFIX = 'cmb-fe';

/**
 * La API guarda un token vigente por actor y dispositivo, así que el nombre
 * tiene que ser estable en este navegador: si cambiara en cada ingreso, cada
 * login dejaría un token huérfano. Se guarda al primer uso.
 */
export const deviceName = (): string => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;

    const generated = `${PREFIX}-${crypto.randomUUID().slice(0, 8)}`;
    window.localStorage.setItem(STORAGE_KEY, generated);

    return generated;
  } catch {
    // Sin almacenamiento el nombre dura lo que dura la pestaña.
    return PREFIX;
  }
};
