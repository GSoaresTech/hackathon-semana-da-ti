# Pendências

O que ficou fora do MVP de propósito, com o que já existe para apoiar cada item.

## Painel da unidade (tela 08 · extra)

Ver `Triar-telas.pdf`, página 10. A recepção lê o QR do paciente e vê a pré-triagem antes de ele chegar, ordenada por nível. É o que vende a vertente privada: menos idas desnecessárias ao pronto-socorro e paciente já pré-triado.

**Já pronto:**

- Login da recepção por telefone + senha (`/signin`), cookie httpOnly `token`, e o `proxy.ts` protegendo `/unit`.
- `GET /api/cards/:token` (autenticado): verifica o token do QR e devolve o resumo (`level`, `symptoms`, `description`, `onset`, `intensity`, `age`, `pregnant`, `warning_signs`, `destination`) e o `code` curto (ex.: `#A7F2`).
- Tela `/unit`, que hoje só troca a lotação. É o lugar natural para o painel.

**Falta:**

- [x] Layout de painel (desktop): sidebar com **Pré-triagens**, **Lotação** e **Histórico do dia**. A tela de lotação atual vira um dos itens.
- [ ] **Ler QR code**: leitura pela câmera (lib de scanner, ex.: `@zxing/browser` ou `BarcodeDetector` quando disponível), com alternativa para colar o token ou o link.
- [ ] Tabela de pré-triagens com Nível (UrgencyBadge), Cartão (`code`), Sintomas, Idade e Chegada, ordenada por nível e depois por horário de leitura.
- [ ] Detalhe do cartão: resumo completo, relato entre aspas e o bloco "Alerta orientado" com os `warning_signs`.
- [ ] Ações **Reclassificar** (o profissional ajusta o nível) e **Chamar para triagem**.
- [ ] **LGPD:** a lista de cartões lidos fica só no navegador da recepção (memória ou `sessionStorage`), nunca no banco. O "Histórico do dia" segue a mesma regra, ou passa por uma decisão explícita de produto e jurídico antes de persistir qualquer coisa.
- [ ] "Chegada" estimada: hoje o token não carrega a localização do paciente. Seria preciso incluir no cartão o `travel_minutes` da unidade escolhida.

## Melhorias anotadas

- [x] **Integridade do nível no cartão:** `POST /api/triage` devolve `result_token` (JWT com `audience: triage-result`), e `POST /api/cards` só aceita esse token para montar o resumo. Adulterar o nível pelo DevTools não muda o cartão gerado.
- [ ] **Deep link do QR:** o QR carrega só o token. Apontar para `/unit/cards/<token>` deixaria a câmera do celular da recepção abrir o painel direto.
- [ ] **Unidades reais:** o seed é fictício (Caruaru-PE). Importar do CNES/OpenStreetMap e trocar a estimativa de tempo (linha reta a ~25 km/h) por uma API de rotas.
- [ ] **Multi-idioma** e textos com revisão clínica das regras de sinal grave (`apps/server/src/cases/triage/triage-rules.ts`).
- [ ] **Rate limit** em `POST /api/triage`, a única rota que custa dinheiro (chamada à OpenAI).
