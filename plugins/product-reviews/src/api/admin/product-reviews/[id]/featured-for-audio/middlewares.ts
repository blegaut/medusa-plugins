import { type MiddlewareRoute, validateAndTransformBody } from '@medusajs/framework';
import { z } from 'zod';

export const updateProductReviewFeaturedForAudioSchema = z.object({
  featured: z.boolean(),
});

export type UpdateProductReviewFeaturedForAudioSchema = z.infer<
  typeof updateProductReviewFeaturedForAudioSchema
>;

export const adminProductReviewFeaturedForAudioRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/admin/product-reviews/:id/featured-for-audio',
    method: 'PUT',
    middlewares: [validateAndTransformBody(updateProductReviewFeaturedForAudioSchema)],
  },
];
