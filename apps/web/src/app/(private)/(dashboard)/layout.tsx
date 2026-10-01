import { AppHeader } from '~/components/app-header';
import { AppSidebar } from '~/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar';

/**
 * Shell da área autenticada.
 *
 * É Server Component: não busca dados nem tem estado. O `proxy.ts` já garantiu
 * que só chega aqui quem tem sessão válida — este layout não revalida nada.
 */
export default function DashboardLayout({ children }: LayoutProps<'/'>) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <AppHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
