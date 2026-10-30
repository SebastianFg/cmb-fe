import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from './use-auth-store';
import { useHydration } from './use-hydration';

describe('useHydration', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns hydrated immediately without subscribing when persistence is ready', () => {
    jest.spyOn(useAuthStore.persist, 'hasHydrated').mockReturnValue(true);
    const onHydrate = jest.spyOn(useAuthStore.persist, 'onHydrate');
    const onFinishHydration = jest.spyOn(
      useAuthStore.persist,
      'onFinishHydration',
    );

    const { result } = renderHook(() => useHydration());

    expect(result.current).toBe(true);
    expect(onHydrate).not.toHaveBeenCalled();
    expect(onFinishHydration).not.toHaveBeenCalled();
  });

  test('tracks hydration transitions and unsubscribes on cleanup', () => {
    let hydrationStarted: Parameters<typeof useAuthStore.persist.onHydrate>[0] =
      () => undefined;
    let hydrationFinished: Parameters<
      typeof useAuthStore.persist.onFinishHydration
    >[0] = () => undefined;
    const unsubscribeHydrate = jest.fn();
    const unsubscribeFinish = jest.fn();

    jest.spyOn(useAuthStore.persist, 'hasHydrated').mockReturnValue(false);
    jest
      .spyOn(useAuthStore.persist, 'onHydrate')
      .mockImplementation((callback) => {
        hydrationStarted = callback;
        return unsubscribeHydrate;
      });
    jest
      .spyOn(useAuthStore.persist, 'onFinishHydration')
      .mockImplementation((callback) => {
        hydrationFinished = callback;
        return unsubscribeFinish;
      });

    const { result, unmount } = renderHook(() => useHydration());
    expect(result.current).toBe(false);

    act(() => hydrationFinished(useAuthStore.getState()));
    expect(result.current).toBe(true);

    act(() => hydrationStarted(useAuthStore.getState()));
    expect(result.current).toBe(false);

    unmount();
    expect(unsubscribeHydrate).toHaveBeenCalledTimes(1);
    expect(unsubscribeFinish).toHaveBeenCalledTimes(1);
  });
});
