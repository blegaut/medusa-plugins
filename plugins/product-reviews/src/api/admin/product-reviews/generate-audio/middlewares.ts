import { type MiddlewareRoute, validateAndTransformBody } from '@medusajs/framework';
import { z } from "@medusajs/framework/zod";

export const batchGenerateReviewAudioSchema = z.object({
  review_ids: z.array(z.string()).min(1),
});

export type BatchGenerateReviewAudioSchema = z.infer<typeof batchGenerateReviewAudioSchema>;

export const adminBatchGenerateReviewAudioRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/admin/product-reviews/generate-audio',
    method: 'POST',
    middlewares: [validateAndTransformBody(batchGenerateReviewAudioSchema)],
  },
];
