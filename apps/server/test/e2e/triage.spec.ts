import type { FastifyInstance } from 'fastify';
import supertest from 'supertest';

import { create_app } from '~/app';
import { generate_json } from '~/libs/ai';
import { connection } from '~/libs/connection';
import { ServiceUnavailableError } from '~/libs/errors/app-errors';

// Nenhum teste fala com a OpenAI de verdade.
vi.mock('~/libs/ai', () => ({ generate_json: vi.fn() }));

const generate_json_mock = vi.mocked(generate_json);

const AI_RESULT = {
  level: 3,
  title: 'Procure uma UPA hoje',
  explanation: 'Febre alta com dor de cabeça há dois dias pede avaliação no mesmo dia.',
  instructions: ['Beba água em pequenos goles.', 'Leve documentos e o cartão de triagem.'],
  warning_signs: ['Manchas roxas na pele', 'Rigidez no pescoço'],
};

const ANSWERS = { onset: '1-2-days', intensity: 7, age: 34, pregnant: 'no' };

describe('POST /api/triage (e2e)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await create_app();
    await app.ready();
  });

  afterEach(() => {
    generate_json_mock.mockReset();
  });

  afterAll(async () => {
    await app.close();
    await connection.destroy();
  });

  it('detecta sinal grave pelas regras sem chamar a IA', async () => {
    const response = await supertest(app.server)
      .post('/api/triage')
      .send({ network: 'public', symptoms: ['chest_pain', 'shortness_of_breath'] });

    expect(response.status).toBe(200);
    expect(response.body.emergency).toBe(true);
    expect(response.body.reason).toContain('Dor no peito');
    expect(response.body.instructions.length).toBeGreaterThan(0);
    expect(generate_json_mock).not.toHaveBeenCalled();
  });

  it('detecta sinal grave no relato livre', async () => {
    const response = await supertest(app.server).post('/api/triage').send({
      network: 'private',
      symptoms: [],
      description: 'Meu pai DESMAIOU agora há pouco',
    });

    expect(response.status).toBe(200);
    expect(response.body.emergency).toBe(true);
    expect(generate_json_mock).not.toHaveBeenCalled();
  });

  it('sem respostas e sem sinal grave, só confirma que não é emergência', async () => {
    const response = await supertest(app.server)
      .post('/api/triage')
      .send({ network: 'public', symptoms: ['pain', 'fever'] });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ emergency: false });
    expect(generate_json_mock).not.toHaveBeenCalled();
  });

  it('com respostas, classifica pela IA', async () => {
    generate_json_mock.mockResolvedValueOnce(AI_RESULT);

    const response = await supertest(app.server)
      .post('/api/triage')
      .send({
        network: 'public',
        symptoms: ['pain', 'fever'],
        description: 'Dor de cabeça forte desde ontem e febre de 39 graus.',
        answers: ANSWERS,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ emergency: false, ...AI_RESULT });
    expect(generate_json_mock).toHaveBeenCalledOnce();
    expect(generate_json_mock.mock.calls[0][0].input).toContain('Febre');
  });

  it('responde 503 quando a IA falha', async () => {
    generate_json_mock.mockRejectedValueOnce(new ServiceUnavailableError());

    const response = await supertest(app.server)
      .post('/api/triage')
      .send({ network: 'public', symptoms: ['cough'], answers: ANSWERS });

    expect(response.status).toBe(503);
    expect(response.body.error).toBeTypeOf('string');
  });

  it('rejeita corpo inválido', async () => {
    const response = await supertest(app.server)
      .post('/api/triage')
      .send({ network: 'sus', symptoms: ['unknown'] });

    expect(response.status).toBe(400);
  });

  it('rejeita triagem sem sintoma e sem relato', async () => {
    const response = await supertest(app.server)
      .post('/api/triage')
      .send({ network: 'public', symptoms: [] });

    expect(response.status).toBe(400);
  });
});
