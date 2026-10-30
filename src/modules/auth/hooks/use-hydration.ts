import { useEffect, useState } from 'react';
import { useAuthStore } from './use-auth-store';

export const useHydration = () => {
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated());

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    const unsubOnHydrate = useAuthStore.persist.onHydrate(() => {
      setHydrated(false);
    });

    const unsubOnFinish = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    return () => {
      unsubOnHydrate();
      unsubOnFinish();
    };
  }, []);

  return hydrated;
};
