import { UnitShell } from './unit-shell';

export default function UnitLayout({ children }: LayoutProps<'/unit'>) {
  return <UnitShell>{children}</UnitShell>;
}
