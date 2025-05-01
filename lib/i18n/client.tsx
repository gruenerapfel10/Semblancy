'use client';

import { createContext, useContext, ReactNode, useState } from 'react';

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
});

export function I18nClientProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState('en');

  return (
    <I18nContext.Provider value={{ locale, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}