'use client';

import { EmergencyScreen } from '~/components/emergency-screen';

import { useTriage } from '../triage-store';
import { useTriageGuard } from '../use-triage-guard';

/** Tela 04 · Emergência: disparada pelas regras de sinal grave, sem IA. */
const EmergencyView: React.FC = () => {
  const ready = useTriageGuard((state) => state.emergency !== null);
  const emergency = useTriage((state) => state.emergency);

  if (!ready || !emergency) return <main className="min-h-dvh bg-urg-red" />;

  return <EmergencyScreen reason={emergency.reason} instructions={emergency.instructions} />;
};

export { EmergencyView };
