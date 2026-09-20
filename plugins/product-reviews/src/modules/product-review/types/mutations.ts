import type { ProductReview } from './common';

export type ProductReviewImageInput = {
  url: string;
  type?: string;
};

export type CreateProductReviewInput = Partial<
  Omit<ProductReview, 'id' | 'created_at' | 'updated_at' | 'images'>
> & {
  images?: ProductReviewImageInput[];
};

export type UpdateProductReviewInput = Partial<
  Omit<ProductReview, 'id' | 'created_at' | 'updated_at' | 'images'>
> & {
  id: string;
  images?: ProductReviewImageInput[];
};

export type CreateProductReviewsWorkflowInput = {
  productReviews: CreateProductReviewInput[];
};

export type UpdateProductReviewsWorkflowInput = {
  productReviews: UpdateProductReviewInput[];
};

export type DeleteProductReviewResponsesWorkflowInput = {
  ids: string[];
};

export type CreateProductReviewResponseWorkflowInput = {
  responses: CreateProductReviewResponseInput[];
};

export type UpdateProductReviewResponsesWorkflowInput = {
  responses: UpdateProductReviewResponseInput[];
};

export type CreateProductReviewResponseInput = {
  product_review_id: string;
  content: string;
};

export type UpdateProductReviewResponseInput = {
  id: string;
  content: string;
};
