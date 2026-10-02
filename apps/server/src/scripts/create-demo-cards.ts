import { build_demo_cards } from '~/scripts/demo-cards';

/*
 * CLI: `npm run demo:cards -w @triar-app/server`.
 * Imprime cinco cartões de demonstração (válidos por 12 h) para colar no painel ou
 * abrir pelo link direto do QR (sessão 09).
 */
async function main() {
  const cards = await build_demo_cards();

  console.log(`Cartões de demonstração (${cards.length}, válidos por 12 h):`);
  console.log('');
  console.log('Nível | Código | Link');
  console.log('------|--------|---------------------------');
  for (const card of cards) {
    console.log(`  ${card.level}   | ${card.code}  | ${card.path}`);
  }

  console.log('');
  console.log('Tokens (para colar no painel):');
  for (const card of cards) {
    console.log(`${card.code} (nível ${card.level}): ${card.token}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
