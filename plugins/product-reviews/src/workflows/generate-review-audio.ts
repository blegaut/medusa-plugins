import { WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk';
import { generateReviewAudioStep } from './steps/generate-review-audio';

export type GenerateReviewAudioWorkflowInput = {
  review_id: string;
};

export const generateReviewAudioWorkflow = createWorkflow(
  'generate-review-audio-workflow',
  (input: GenerateReviewAudioWorkflowInput) => {
    const review = generateReviewAudioStep(input);
    return new WorkflowResponse(review);
  },
);
