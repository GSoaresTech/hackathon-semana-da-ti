import { z } from 'zod';

/** Formato público de uma unidade, compartilhado pelos controllers de unidades e sessões. */
const unit_schema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['ubs', 'upa', 'emergency_room', 'hospital', 'clinic', 'telemedicine']),
  network: z.enum(['public', 'private']),
  address: z.string().nullable(),
  neighborhood: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  occupancy: z.enum(['low', 'medium', 'high']),
  opening_hours: z.string(),
  phone: z.string().nullable(),
});

export { unit_schema };
