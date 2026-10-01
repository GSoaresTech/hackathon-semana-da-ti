# Estado com Zustand

## A divisão que importa

| Tipo de estado | Onde mora | Exemplos |
|---|---|---|
| Dado que o servidor pode devolver de novo | **TanStack Query** | catálogo de sintomas, lista de unidades, `getMe` |
| Estado do fluxo / de interface | **Zustand** | rede escolhida, sintomas marcados, respostas, resultado da triagem |
| Estado de um componente só | `useState` | card de unidade selecionado, exportando imagem |

**Nunca copie resposta de query para dentro de uma store.** Duas fontes de
verdade divergem: uma mutação atualiza o cache do Query e a store fica com o
valor velho, sem nada avisando.

O resultado de `POST /api/triage` é a exceção que confirma a regra: ele não é
um dado que dê para buscar de novo (é a resposta a *estas* respostas, e a IA
pode variar), então é estado do fluxo e mora no store.

## O store da triagem

[`app/(triage)/triage-store.ts`](<../src/app/(triage)/triage-store.ts>) é o
único store do app. Ele carrega o caso de uma tela para a outra:

```ts
const useTriage = create<TriageState>()(
  persist(
    (set) => ({
      ...defaultStore,

      setNetwork: (network) => set({ network }),
      // Mudar a entrada invalida o que foi calculado a partir dela.
      toggleSymptom: (id) =>
        set((state) => ({
          symptoms: state.symptoms.includes(id)
            ? state.symptoms.filter((symptom) => symptom !== id)
            : [...state.symptoms, id],
          emergency: null,
          result: null,
        })),
      // ...
      // Mantém rede e localização: são escolhas da pessoa, não do caso.
      reset: () =>
        set((state) => ({ ...defaultStore, network: state.network, coords: state.coords })),
    }),
    {
      name: 'triar:triage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ /* só os dados, sem as funções */ }),
    },
  ),
);
```

Detalhes que não são acidentais:

1. **`defaultStore` separado.** O `reset()` reaproveita o objeto em vez de
   repetir os valores — campo novo já nasce resetado junto.
2. **Mudar a entrada zera o que dependia dela.** Marcar outro sintoma apaga
   `emergency` e `result`; sem isso, a tela Resultado mostraria a avaliação de
   sintomas que a pessoa já desmarcou.
3. **`null` para "ainda não tem".** `undefined` some do objeto ao serializar e
   atrapalha comparar.
4. **`create<T>()(...)`** — com middleware são **duas** chamadas; é assim que o
   TypeScript infere os tipos corretamente.

### Por que `sessionStorage`

- Sobrevive a um recarregamento (a pessoa não perde o que respondeu).
- **Some ao fechar a aba e nunca sai do aparelho.** É dado de saúde: LGPD. Não
  troque por `localStorage` e não mande o store para o backend.

## Hidratação: `useTriageHydrated`

No servidor não existe `sessionStorage`, então o HTML sai com o estado padrão;
o estado salvo só entra depois, no cliente. Ler o store antes disso faz a
hidratação do React divergir do HTML — e uma tela recarregada redirecionaria
para o início por engano.

O sinal de "já carreguei" é lido com `useSyncExternalStore`, não com
`useState` + `useEffect` (proibido pelo React Compiler):

```ts
function useTriageHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useTriage.persist.onFinishHydration(onChange),
    () => useTriage.persist.hasHydrated(),
    () => false, // servidor
  );
}
```

Use-o para desabilitar botões e mostrar skeleton até o store estar pronto —
veja o `disabled={!hydrated}` em
[`start-form.tsx`](<../src/app/(triage)/start-form.tsx>).

## Guarda de etapa: `useTriageGuard`

[`use-triage-guard.ts`](<../src/app/(triage)/use-triage-guard.ts>) impede abrir
uma etapa sem ter passado pela anterior (ex.: `/result` direto pela URL):

```ts
const ready = useTriageGuard((state) => state.result !== null);

if (!ready || !result) return <Screen />;
```

- Recebe um seletor que diz se a tela pode renderizar e, opcionalmente, para
  onde voltar (padrão `/`).
- Antes da hidratação devolve `false` **sem redirecionar**.
- O `router.replace` fica num `useEffect`: navegar é efeito colateral (sistema
  externo), não estado do React.

Isso é UX do fluxo, não segurança — não há nada a proteger, é tudo do próprio
aparelho.

## Consumindo

Selecione **um campo por chamada**:

```tsx
const network = useTriage((state) => state.network);
const setNetwork = useTriage((state) => state.setNetwork);
```

Assim o componente só re-renderiza quando aquele campo muda. Desestruturar a
store inteira (`const { network } = useTriage()`) re-renderiza a cada mudança
de qualquer campo — e o store da triagem muda a cada tecla no relato.

Para pegar vários campos de uma vez, use `useShallow`:

```tsx
import { useShallow } from 'zustand/react/shallow';

const { symptoms, description } = useTriage(
  useShallow((state) => ({ symptoms: state.symptoms, description: state.description })),
);
```

## Store nova

Antes de criar, pergunte se não é `useState` (só um componente usa) ou query
(o servidor devolve de novo). Se for mesmo estado compartilhado entre telas,
coloque a store na pasta do grupo de rota que a usa, como `triage-store.ts`,
siga o mesmo formato (`defaultStore`, ações que invalidam o que dependia da
entrada) e só use `persist` se o estado precisar sobreviver a um recarregamento
— lembrando que, com dado de saúde, o storage é `sessionStorage`.
