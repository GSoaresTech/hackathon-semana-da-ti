import { redirect } from 'next/navigation';

/**
 * Na prática o `proxy.ts` já intercepta `/` e manda para `/dashboard` ou
 * `/signin` conforme a sessão. Esta página é a rede de segurança para quando o
 * proxy não roda (por exemplo, um `export` estático ou o matcher alterado).
 */
export default function RootPage() {
  redirect('/dashboard');
}
