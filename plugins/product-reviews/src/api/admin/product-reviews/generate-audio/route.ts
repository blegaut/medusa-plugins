import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework';
import type { BatchGenerateReviewAudioSchema } from './middlewares';
import { generateReviewAudioWorkflow } from '../../../../workflows/generate-review-audio';

export const POST = async (
  req: AuthenticatedMedusaRequest<BatchGenerateReviewAudioSchema>,
  res: MedusaResponse,
) => {
  const { review_ids } = req.validatedBody;
  const results: Array<{
    review_id: string;
    status: 'ready' | 'failed';
    product_review?: unknown;
    error?: string;
  }> = [];

  for (const review_id of review_ids) {
    try {
      const { result } = await generateReviewAudioWorkflow(req.scope).run({
        input: { review_id },
      });
      results.push({ review_id, status: 'ready', product_review: result });
    } catch (error) {
      results.push({
        review_id,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  res.status(200).json({ results });
};
