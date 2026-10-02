# Triar — Telas do sistema

O Triar é um app de pré-triagem. A pessoa conta o que está sentindo e o app classifica a urgência de 1 a 5, seguindo o Protocolo de Manchester. Em seguida, indica para onde ir, no SUS ou no plano de saúde, levando em conta a distância e a lotação das unidades. No fim, gera um cartão com QR code para a pessoa mostrar na recepção.

O sistema tem duas áreas:

- **Telas externas:** usadas pelo paciente, no celular, sem login.
- **Telas internas:** usadas pela recepção da unidade de saúde, com login.

## Regras que valem para todas as telas

- **Emergência a um toque.** O botão "Emergência 192" aparece em todas as telas do paciente e liga direto para o SAMU, inclusive para quem tem plano.
- **Cor nunca sozinha.** O nível de urgência aparece sempre com cor, número e palavra (ex.: "3 Urgente"). Assim, quem é daltônico também entende.
- **Não é diagnóstico.** O app orienta e encaminha. O texto diz "seus sintomas indicam…", nunca "você tem…".
- **Privacidade (LGPD).** Nenhum dado de saúde é salvo em banco de dados. Ele fica só no celular do paciente, enquanto a aba está aberta, e dentro do QR code do cartão.

## Caminho do paciente

1. Início
2. Sintomas
3. Perguntas, ou a tela de Emergência se aparecer um sinal grave
4. Resultado
5. Unidades
6. Cartão de triagem
7. A recepção da unidade lê o cartão

---

# Parte 1 — Telas externas (paciente)

## 01 · Início

**Para que serve:** apresentar o app e fazer as duas escolhas que valem para o resto do fluxo.

**O que a pessoa vê e faz:**

- A saudação "Olá! Vamos descobrir para onde você deve ir."
- O aviso fixo "O Triar não substitui atendimento médico. Ele orienta para onde ir. Em caso de dúvida, ligue 192."
- A pergunta **"Onde você quer ser atendido?"**, com duas opções:
  - **SUS:** SAMU, UPA e UBS, gratuito.
  - **Tenho plano/particular:** rede credenciada, pronto-socorro ou teleconsulta.
- O botão **"Usar minha localização"**, para mostrar as unidades mais próximas. Sem a permissão, o app usa o centro de Caruaru como ponto de partida.
- O botão **"Começar"**.

## 02 · Sintomas (passo 1 de 3)

**Para que serve:** registrar o que a pessoa está sentindo.

**O que a pessoa vê e faz:**

- Marca um ou mais sintomas em botões de toque:
  - Dor
  - Febre
  - Sangramento
  - Falta de ar
  - Dor no peito
  - Tontura
  - Vômito
  - Tosse
  - Desmaio
  - Manchas na pele
  - Diarreia
  - Machucado
  - Coceira
  - Formigamento
- Se quiser, descreve o caso com as próprias palavras (ex.: "dor de cabeça forte desde ontem e febre").
- O botão **"Continuar"** só libera depois que ela marca um sintoma ou escreve algo.

**Por trás:** ao continuar, o app já verifica se há sinal grave. Se houver, a pessoa vai direto para a tela de Emergência, sem responder mais nada.

## 03 · Perguntas (passo 2 de 3)

**Para que serve:** completar as informações que mudam a classificação.

**O que a pessoa vê e faz:**

- **Há quanto tempo começou?** Horas, 1–2 dias, 3–7 dias ou +1 semana.
- **Qual a intensidade da dor?** Escala de 0 a 10. Só aparece quando a pessoa marcou Dor, Dor no peito ou Machucado.
- **Idade.**
- **Está gestante?** Sim, Não ou Não se aplica.
- O botão **"Ver resultado"**.

**Por trás:**

1. O app verifica de novo os sinais graves, agora considerando idade, gestação e intensidade.
2. Se não houver sinal grave, uma inteligência artificial classifica a urgência de 1 a 5.

## 04 · Emergência

**Para que serve:** agir rápido quando aparece um sinal grave.

**O que a pessoa vê e faz:**

- Uma tela inteira em vermelho com o selo "Sinal grave detectado".
- O título **"Ligue 192 agora"** e o motivo em linguagem simples (ex.: "Desmaio pode ser sinal de algo grave.").
- O botão **"Ligar 192"**, que já faz a ligação.
- O bloco "Enquanto a ajuda chega", com orientações.
- O link **"Já liguei · ver emergência mais próxima"**, que leva às unidades de emergência.

**Quando aparece:** em casos como estes.

- Dor no peito com falta de ar.
- Desmaio.
- Sangramento na gravidez.
- Falta de ar depois dos 65 anos.
- Dor forte no peito (8 ou mais).
- Palavras de alerta no relato.

Quem decide são regras fixas, que rodam antes da IA e não dependem dela.

## 05 · Resultado

**Para que serve:** dizer o nível de urgência e o que fazer.

**O que a pessoa vê:**

- O selo do nível:
  - 1 Emergência
  - 2 Muito urgente
  - 3 Urgente
  - 4 Pouco urgente
  - 5 Não urgente
- Uma frase de ação em destaque (ex.: "Procure uma UPA agora").
- Uma explicação simples (ex.: "Seus sintomas indicam febre alta e dor de cabeça forte, que podem precisar de avaliação médica imediata.").
- **"O que fazer agora"**, com orientações práticas.
- **"Ligue 192 se aparecer"**, com os sinais que fariam o caso piorar.
- O aviso "O Triar não substitui atendimento médico."
- Os botões **"Ver unidades indicadas"** e **"Gerar cartão de triagem"**.

## 06 · Unidades

**Para que serve:** indicar onde ser atendido.

**O que a pessoa vê e faz:**

- Um mapa com as unidades e, abaixo, a lista **"Unidades indicadas"**, com o nível da pessoa ao lado.
- Pode trocar entre **SUS** e **Plano**.
- O nível decide o tipo de unidade indicada:

  | Nível | SUS | Plano |
  |---|---|---|
  | 1 e 2 | UPA ou hospital | Pronto-socorro ou hospital |
  | 3 | UPA | Pronto-socorro ou teleconsulta |
  | 4 e 5 | UBS | Teleconsulta ou clínica |

- A lista vem ordenada pela **lotação** (mais tranquila primeiro) e pela **distância**.
- Cada unidade mostra:
  - Nome
  - Etiqueta SUS ou Plano
  - Lotação (● Tranquila, ● Moderada ou ● Lotada)
  - Distância e tempo de carro
  - Horário de funcionamento
- Ao tocar numa unidade, aparecem o endereço, o telefone e os botões **"Como chegar"** (abre o mapa com a rota) e **"Ligar"**. Na teleconsulta, o botão é "Ligar para a teleconsulta".
- Quando a unidade mais próxima está lotada, aparece um aviso como "A UPA X lotou. Mostramos primeiro uma opção mais tranquila."
- A lista se atualiza sozinha a cada 10 segundos. Se a recepção muda a lotação, o paciente vê na hora.

**Por trás:** a unidade escolhida em "Como chegar" vira o destino do cartão de triagem.

## 07 · Cartão de triagem (passo 3 de 3)

**Para que serve:** levar a pré-triagem até a recepção.

**O que a pessoa vê e faz:**

- O título "Mostre na recepção".
- Um cartão com:
  - O QR code.
  - O destino e o tempo de carro.
  - O nível de urgência.
  - Um código curto (ex.: #A7F2).
  - O horário em que foi gerado e a validade de 12 horas.
  - O resumo do caso: sintomas, início, intensidade e idade.
- Os botões **"Salvar imagem"** e **"Compartilhar"**.
- O aviso "Seus dados ficam só neste QR code. Nada é salvo em servidor."

**Segurança:** o nível vem assinado pelo servidor. Quem tentar mudar o nível no próprio celular não consegue alterar o cartão.

---

# Parte 2 — Telas internas (recepção da unidade)

## 08 · Login da recepção ("Área da unidade")

**Para que serve:** dar acesso ao painel só para a recepção.

**O que a pessoa vê e faz:**

- Digita o telefone e a senha da recepção e toca em **"Entrar"**.
- Quem chegou ali procurando atendimento encontra o link "Procurando atendimento? Comece a triagem".

Todas as telas internas exigem login. Sem login, o sistema volta para esta tela.

## Estrutura do painel

O painel tem um menu fixo:

- No computador, é uma barra lateral.
- No celular, são abas no topo.

O menu traz:

- As três seções: **Pré-triagens**, **Lotação** e **Histórico do dia**.
- O nome da unidade e da pessoa logada.
- O botão 192.
- **Sair**.

## 09 · Pré-triagens

**Para que serve:** ver os pacientes que estão a caminho já com a pré-triagem, do mais urgente para o menos urgente.

**O que a recepção vê e faz:**

- O nome da unidade e o subtítulo "Recepção · pacientes a caminho com pré-triagem".
- O campo **"Cole o link do cartão"** e o botão **"Ler cartão"**. Nesta versão, a recepção cola o link ou o código lido do QR.
- Uma tabela com os cartões lidos, ordenada pelo nível de urgência e, no mesmo nível, por ordem de leitura. As colunas são:

  | Coluna | O que mostra |
  |---|---|
  | Nível | Selo de urgência |
  | Cartão | Código curto |
  | Sintomas | Sintomas marcados |
  | Idade | Idade do paciente |
  | Chegada | Tempo estimado até a unidade, ou "Na recepção" |

- Ao lado da tabela, o detalhe do cartão selecionado:
  - Código e horário da leitura.
  - Nível.
  - Sintomas e o relato do paciente entre aspas.
  - Início, intensidade, idade e gestação.
  - Destino.
  - O bloco **"Alerta orientado"**, com os sinais de alerta.
  - O botão **"Chamar para triagem"**, que tira o paciente da fila e o leva para o Histórico do dia.

**Privacidade:** a lista fica só no navegador da recepção e some ao fechar a aba. Nada vai para o banco de dados.

## 10 · Lotação

**Para que serve:** informar quão cheia a unidade está agora.

**O que a recepção vê e faz:** responde "Como está a lotação agora?" escolhendo uma das três opções.

- **Tranquila:** atendimento sem fila.
- **Moderada:** alguma espera.
- **Lotada:** fila longa. O app passa a indicar outra opção aos pacientes.

**Efeito:** os pacientes veem a mudança na tela de Unidades em até 10 segundos.

## 11 · Histórico do dia

**Para que serve:** registrar quem já foi chamado para a triagem.

**O que a recepção vê:** a lista de pacientes chamados, do mais recente para o mais antigo. Cada linha mostra o nível, o código do cartão, os sintomas e o horário em que o paciente foi chamado.

**Privacidade:** a lista segue a mesma regra das Pré-triagens. Fica só no navegador e some ao fechar a aba.

## Sair

Encerra a sessão da recepção e volta para o login.

---

## Próximos passos

- Ler o QR pela câmera, sem precisar colar o link.
- Botão "Reclassificar", para o profissional ajustar o nível na recepção.
- Base real de unidades (CNES) e tempo de deslocamento calculado por rota.
