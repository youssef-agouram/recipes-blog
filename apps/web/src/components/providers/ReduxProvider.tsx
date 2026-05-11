'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { hydrateFromStorage } from '@/store/slices/authSlice';

function StorageHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Hydrate auth from localStorage on mount
    dispatch(hydrateFromStorage());
  }, [dispatch]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <StorageHydrator>{children}</StorageHydrator>
    </Provider>
  );
}
