import type { FastifyInstance } from 'fastify';
import supertest from 'supertest';

import { create_app } from '~/app';
import { generate_json } from '~/libs/ai';
import { connection } from '~/libs/connection';

import { clear_database, create_result_token, create_unit, create_user, login } from '../helpers';

vi.mock('~/libs/ai', () => ({ generate_json: vi.fn() }));
const generate_json_mock = vi.mocked(generate_json);

const PHONE = '81990000301';
const DESTINATION = { id: null, name: 'UPA Boa Vista' };

describe('/api/cards (e2e)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await create_app();
    await app.ready();
    await clear_database();

    const unit_id = await create_unit({ name: 'UPA Cartão', type: 'upa', network: 'public' });
    await create_user(unit_id, PHONE);
  });

  afterAll(async () => {
    await clear_database();
    await app.close();
    await connection.destroy();
  });

  it('gera o cartão a partir do resultado assinado', async () => {
    const result_token = await create_result_token({ level: 3, symptoms: ['fever', 'pain'] });

    const created = await supertest(app.server)
      .post('/api/cards')
      .send({ result_token, destination: DESTINATION });

    expect(created.status).toBe(201);
    expect(created.body.code).toMatch(/^#[0-9A-F]{4}$/);
    expect(created.body.card.level).toBe(3);
    // Os ids chegam resolvidos em rótulos, na ordem do catálogo (pain antes de fever).
    expect(created.body.card.symptoms).toEqual(['Dor', 'Febre']);
    expect(created.body.card.destination).toEqual(DESTINATION);

    const expires_in_hours =
      (Date.parse(created.body.expires_at) - Date.parse(created.body.issued_at)) / 3_600_000;
    expect(expires_in_hours).toBe(12);

    const cookie = await login(app, PHONE);
    const read = await supertest(app.server)
      .get(`/api/cards/${created.body.token}`)
      .set('Cookie', cookie);

    expect(read.status).toBe(200);
    expect(read.body.code).toBe(created.body.code);
    expect(read.body.card).toEqual(created.body.card);
  });

  it('recusa o formato antigo (resumo direto, sem result_token)', async () => {
    const response = await supertest(app.server)
      .post('/api/cards')
      .send({
        level: 1,
        symptoms: ['Febre'],
        destination: DESTINATION,
      });

    expect(response.status).toBe(400);
  });

  it('recusa resultado adulterado', async () => {
    const result_token = await create_result_token();
    // Reescreve a assinatura inteira para garantir que a verificação do jose falhe.
    const [header, payload] = result_token.split('.');
    const tampered = [header, payload, 'YXNzaW5hdHVyYS1pbnZhbGlkYQ'].join('.');

    const response = await supertest(app.server)
      .post('/api/cards')
      .send({ result_token: tampered, destination: DESTINATION });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Refaça a triagem');
  });

  it('não aceita token de cartão como resultado', async () => {
    // Primeiro cria um cartão válido só para pegar o token dele.
    const result_token = await create_result_token();
    const created = await supertest(app.server)
      .post('/api/cards')
      .send({ result_token, destination: DESTINATION });

    // Agora tenta usar o token do cartão como se fosse um resultado da triagem.
    const response = await supertest(app.server)
      .post('/api/cards')
      .send({ result_token: created.body.token, destination: DESTINATION });

    expect(response.status).toBe(400);
  });

  it('não aceita token de resultado como cartão (GET)', async () => {
    const cookie = await login(app, PHONE);
    const result_token = await create_result_token();

    const response = await supertest(app.server)
      .get(`/api/cards/${result_token}`)
      .set('Cookie', cookie);

    expect(response.status).toBe(400);
  });

  it('exige login para ler o cartão', async () => {
    const result_token = await create_result_token();
    const created = await supertest(app.server)
      .post('/api/cards')
      .send({ result_token, destination: DESTINATION });

    const response = await supertest(app.server).get(`/api/cards/${created.body.token}`);

    expect(response.status).toBe(401);
  });

  it('cartão inválido responde 400, não 401 (recepção não é deslogada)', async () => {
    const cookie = await login(app, PHONE);

    const response = await supertest(app.server)
      .get('/api/cards/eyJhbGciOiJIUzI1NiJ9.eyJmb28iOiJiYXIifQ.invalid-signature')
      .set('Cookie', cookie);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Cartão inválido ou expirado');
  });

  it('fluxo completo: POST /api/triage → POST /api/cards → GET devolvem o mesmo nível', async () => {
    generate_json_mock.mockResolvedValueOnce({
      level: 3,
      title: 'Procure uma UPA hoje',
      explanation: 'Febre alta com dor de cabeça há dois dias pede avaliação no mesmo dia.',
      instructions: ['Beba água em pequenos goles.'],
      warning_signs: ['Manchas roxas na pele', 'Rigidez no pescoço'],
    });

    const triage = await supertest(app.server)
      .post('/api/triage')
      .send({
        network: 'public',
        symptoms: ['pain', 'fever'],
        description: 'Dor de cabeça forte desde ontem.',
        answers: { onset: '1-2-days', intensity: 7, age: 34, pregnant: 'no' },
      });

    expect(triage.status).toBe(200);
    expect(triage.body.result_token).toBeTypeOf('string');

    const created = await supertest(app.server)
      .post('/api/cards')
      .send({ result_token: triage.body.result_token, destination: DESTINATION });

    expect(created.status).toBe(201);
    expect(created.body.card.level).toBe(3);

    const cookie = await login(app, PHONE);
    const read = await supertest(app.server)
      .get(`/api/cards/${created.body.token}`)
      .set('Cookie', cookie);

    expect(read.status).toBe(200);
    expect(read.body.card.level).toBe(3);
  });
});
