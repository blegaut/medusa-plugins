import { type MiddlewareRoute, validateAndTransformBody } from '@medusajs/framework';
import { z } from "@medusajs/framework/zod";

const voiceGenderMapSchema = z.object({
  female: z.string().optional(),
  male: z.string().optional(),
});

export const updateProductReviewAudioConfigSchema = z.object({
  voices: z.record(z.string(), voiceGenderMapSchema).optional(),
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
