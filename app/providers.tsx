import { ThemeProvider } from "@/components/theme-provider"
import { UserPreferencesProvider } from "@/lib/context/user-preferences-context"
import { I18nClientProvider } from "@/lib/i18n/client"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <I18nClientProvider>
        <UserPreferencesProvider>
          {children}
        </UserPreferencesProvider>
      </I18nClientProvider>
    </ThemeProvider>
  )
} 