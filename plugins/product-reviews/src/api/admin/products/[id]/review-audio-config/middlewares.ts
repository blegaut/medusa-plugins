import { type MiddlewareRoute, validateAndTransformBody } from '@medusajs/framework';
import { z } from 'zod';

const voiceGenderMapSchema = z.object({
  female: z.string().optional(),
  male: z.string().optional(),
});

export const updateProductReviewAudioConfigSchema = z.object({
  voices: z.record(voiceGenderMapSchema).optional(),
  default_language: z.string().optional(),
});

export type UpdateProductReviewAudioConfigSchema = z.infer<
  typeof updateProductReviewAudioConfigSchema
>;

export const adminProductReviewAudioConfigRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/admin/products/:id/review-audio-config',
    method: 'PUT',
    middlewares: [validateAndTransformBody(updateProductReviewAudioConfigSchema)],
  },
];
