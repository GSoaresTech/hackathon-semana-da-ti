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
- [x] **Colar o cartão**: campo no topo de `/unit` que aceita o token do QR ou um link `/unit/cards/<token>` e chama `GET /api/cards/:token`.
- [ ] **Ler QR code pela câmera** (lib de scanner, ex.: `@zxing/browser` ou `BarcodeDetector` quando disponível). Hoje só existe a colagem.
- [x] Tabela de pré-triagens com Nível (UrgencyBadge), Cartão (`code`), Sintomas, Idade e Chegada, ordenada por nível e depois por horário de leitura.
- [x] Detalhe do cartão: resumo completo, relato entre aspas e o bloco "Alerta orientado" com os `warning_signs`.
- [x] **Chamar para triagem**: tira o cartão da fila e manda para o **Histórico do dia**.
- [ ] **Reclassificar** (o profissional ajusta o nível).
- [x] **LGPD:** a lista de cartões lidos e o "Histórico do dia" ficam só no `sessionStorage` da recepção (`app/(unit)/unit/unit-cards-store.ts`), nunca no banco. Persistir qualquer coisa passa antes por uma decisão explícita de produto e jurídico.
- [x] "Chegada" estimada: o cartão carrega o `travel_minutes` da unidade escolhida, e a tabela mostra esse tempo.

## Feedback de profissionais

- [x] **Mais sintomas na segunda etapa:** entraram **Coceira** e **Formigamento** (`apps/server/src/cases/symptoms/symptoms-catalog.ts`).
- Prof. Herycles Fortaleza testou e validou o que já existe: indicar as unidades próximas e quais estão lotadas, e a triagem com sintomas, idade e nível de dor.

## Melhorias anotadas

- [x] **Integridade do nível no cartão:** `POST /api/triage` devolve `result_token` (JWT com `audience: triage-result`), e `POST /api/cards` só aceita esse token para montar o resumo. Adulterar o nível pelo DevTools não muda o cartão gerado.
- [ ] **Deep link do QR:** o QR carrega só o token. Apontar para `/unit/cards/<token>` deixaria a câmera do celular da recepção abrir o painel direto.
- [ ] **Base de unidades:** importar do CNES/OpenStreetMap no lugar do seed (Caruaru-PE) e trocar a estimativa de tempo (linha reta a ~25 km/h) por uma API de rotas.
- [ ] **Multi-idioma** e textos com revisão clínica das regras de sinal grave (`apps/server/src/cases/triage/triage-rules.ts`).
- [ ] **Rate limit** em `POST /api/triage`, a única rota que custa dinheiro (chamada à OpenAI).
