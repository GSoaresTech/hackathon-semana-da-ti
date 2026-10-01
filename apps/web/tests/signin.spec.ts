import { expect, test } from '@playwright/test';

/*
 * Os testes rodam sem backend.
 *
 * A primeira rota ABORTA tudo que for para `**\/api/**`. Sem isso, qualquer
 * chamada não mockada ficaria pendurada até o timeout — e, pior, o interceptor
 * do axios trataria a falha como sessão expirada e redirecionaria no meio do
 * teste. Depois do bloqueio geral, liberamos só os endpoints que interessam.
 *
 * A ordem importa: no Playwright a rota registrada por último vence.
 */
test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', (route) => route.abort());
});

test.describe('Autenticação', () => {
  test('redireciona visitante anônimo para o login', async ({ page }) => {
    await page.goto('/users');

    await expect(page).toHaveURL(/\/signin/);
    await expect(page.getByRole('heading', { name: 'Entrar na plataforma' })).toBeVisible();
  });

  test('preserva o destino original em ?redirect=', async ({ page }) => {
    await page.goto('/users/new');

    await expect(page).toHaveURL(/redirect=%2Fusers%2Fnew/);
  });

  test('valida o CPF antes de chamar a API', async ({ page }) => {
    await page.goto('/signin');

    await page.getByLabel('CPF').fill('11111111111');
    await page.getByLabel('Senha', { exact: true }).fill('senha123');
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByText('CPF inválido')).toBeVisible();
  });

  test('exige senha com no mínimo 6 caracteres', async ({ page }) => {
    await page.goto('/signin');

    await page.getByLabel('CPF').fill('52998224725');
    await page.getByLabel('Senha', { exact: true }).fill('123');
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByText('No mínimo 6 caracteres')).toBeVisible();
  });

  test('avança para a escolha de perfil com credenciais válidas', async ({ page }) => {
    await page.route('**/api/sessions/authenticate', (route) =>
      route.fulfill({ status: 201, json: { message: 'Credentials authenticated' } }),
    );
    await page.route('**/api/users/me/profiles', (route) =>
      route.fulfill({
        status: 200,
        json: {
          profiles: [{ id: 'p1', role: 3, situation: 1, company_id: 'c1', company_name: 'Acme' }],
        },
      }),
    );

    await page.goto('/signin');

    await page.getByLabel('CPF').fill('52998224725');
    await page.getByLabel('Senha', { exact: true }).fill('senha123');
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByRole('heading', { name: 'Escolha o perfil' })).toBeVisible();

    // Confirma a conversão snake_case → camelCase feita pelo interceptor:
    // o backend mandou `company_name`, a interface leu `companyName`.
    await expect(page.getByText('Acme')).toBeVisible();
    await expect(page.getByText('Recursos Humanos')).toBeVisible();
  });
});
