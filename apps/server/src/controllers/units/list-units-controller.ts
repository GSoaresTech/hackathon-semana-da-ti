import type { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import { z } from 'zod';

import { list_units_case } from '~/cases/units/list-units-case';
import { unit_schema } from '~/controllers/units/units-schemas';

const list_units_query_schema = z
  .object({
    level: z.coerce.number().int().min(1).max(5),
    network: z.enum(['public', 'private']),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
  })
  .refine((query) => (query.lat === undefined) === (query.lng === undefined), {
    error: 'Informe lat e lng juntos',
  });

const list_units_response_schema = z.object({
  units: z.array(
    unit_schema.extend({
      distance_km: z.number().nullable(),
      travel_minutes: z.number().nullable(),
    }),
  ),
  notice: z.string().nullable(),
});

async function list_units_controller(request: FastifyRequest, reply: FastifyReply) {
  const { level, network, lat, lng } = list_units_query_schema.parse(request.query);

  const data = await list_units_case({
    level,
    network,
    coordinates: lat !== undefined && lng !== undefined ? { lat, lng } : null,
  });

  return reply.send(data);
}

export { list_units_controller };

list_units_controller.options = {
  schema: {
    tags: ['units'],
    summary: 'Unidades indicadas para o nível e a rede, por lotação e distância',
    querystring: list_units_query_schema,
    response: {
      200: list_units_response_schema,
    },
  },
} as RouteShorthandOptions;
