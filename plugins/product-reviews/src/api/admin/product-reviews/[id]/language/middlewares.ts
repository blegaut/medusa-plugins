import { type MiddlewareRoute, validateAndTransformBody } from '@medusajs/framework';
import { z } from 'zod';

export const updateProductReviewLanguageSchema = z.object({
  language: z.string().min(2).max(5),
});

export type UpdateProductReviewLanguageSchema = z.infer<typeof updateProductReviewLanguageSchema>;

export const adminProductReviewLanguageRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/admin/product-reviews/:id/language',
    method: 'PUT',
    middlewares: [validateAndTransformBody(updateProductReviewLanguageSchema)],
  },
];
