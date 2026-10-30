import { useEffect, useState } from 'react';

/**
 * Valor que se actualiza recién cuando deja de cambiar por `delay`
 * milisegundos. Lo usan las búsquedas que llaman a la API mientras se
 * escribe, para no disparar un pedido por tecla.
 */
export const useDebouncedValue = <T>(value: T, delay = 300): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};
