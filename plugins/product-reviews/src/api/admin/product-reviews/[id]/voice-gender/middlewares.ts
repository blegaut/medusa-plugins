import { type MiddlewareRoute, validateAndTransformBody } from '@medusajs/framework';
import { z } from 'zod';

export const updateProductReviewVoiceGenderSchema = z.object({
  voice_gender: z.enum(['female', 'male']),
});

export type UpdateProductReviewVoiceGenderSchema = z.infer<
  typeof updateProductReviewVoiceGenderSchema
>;

export const adminProductReviewVoiceGenderRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/admin/product-reviews/:id/voice-gender',
    method: 'PUT',
    middlewares: [validateAndTransformBody(updateProductReviewVoiceGenderSchema)],
  },
];
