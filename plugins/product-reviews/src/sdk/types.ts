import type { HttpTypes } from '@medusajs/framework/types';

export interface AdminProductReview {
  id: string;
  product_id: string;
  variant_id?: string | null;
  customer_id?: string | null;
  order_id?: string | null;
  order_line_item_id?: string | null;
  rating: number;
  title?: string | null;
  content?: string | null;
  name?: string | null;
  approved_by?: string | null;
  status: 'pending' | 'approved' | 'flagged';
  verified: boolean;
  audio_url?: string | null;
  audio_status?: 'pending' | 'ready' | 'failed' | null;
  featured_for_audio?: boolean;
  audio_generated_at?: Date | string | null;
  language?: string | null;
  voice_gender?: 'female' | 'male';
  created_at: Date | string;
  updated_at: Date | string;
  deleted_at?: Date | string | null;

  product?: HttpTypes.AdminProduct;
  customer?: HttpTypes.AdminCustomer;
  order?: HttpTypes.AdminOrder;
  images?: AdminProductReviewImage[];
  response?: AdminProductReviewResponse | null;
}

export interface AdminProductReviewImage {
  id: string;
  url: string;
  type: string;
  product_review_id: string;
  created_at: Date | string;
  updated_at: Date | string;
  deleted_at?: Date | string | null;
}

export interface AdminProductReviewResponse {
  id: string;
  product_review_id: string;
  content: string;
  responded_by?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  deleted_at?: Date | string | null;
}

export interface AdminListProductReviewsQuery {
  product_id?: string | string[];
  customer_id?: string | string[];
  order_id?: string | string[];
  rating?: number | number[];
  status?: string | string[];
  limit?: number;
  offset?: number;
  order?: string;
  fields?: string;
}

export interface AdminListProductReviewsResponse {
  product_reviews: AdminProductReview[];
  count: number;
  offset: number;
  limit: number;
}

export interface AdminUpdateProductReviewRequest {
  status?: 'pending' | 'approved' | 'flagged';
  response?: {
    content: string;
  };
}

export interface AdminCreateProductReviewResponseDTO {
  content: string;
}

export interface AdminUpdateProductReviewResponseDTO {
  content: string;
}

// SDK interface
export interface ProductReviewSDK {
  admin: {
    productReviews: {
      list(query?: AdminListProductReviewsQuery): Promise<AdminListProductReviewsResponse>;
      retrieve(id: string): Promise<{ product_review: AdminProductReview }>;
      update(id: string, data: AdminUpdateProductReviewRequest): Promise<{ product_review: AdminProductReview }>;
      updateStatus(id: string, status: string): Promise<{ product_review: AdminProductReview }>;
      updateVerified(id: string, verified: boolean): Promise<{ product_review: AdminProductReview }>;
      updateFeaturedForAudio(id: string, featured: boolean): Promise<{ product_review: AdminProductReview }>;
      updateLanguage(id: string, language: string): Promise<{ product_review: AdminProductReview }>;
      updateVoiceGender(id: string, voice_gender: 'female' | 'male'): Promise<{ product_review: AdminProductReview }>;
      generateAudio(id: string): Promise<{ product_review: AdminProductReview }>;
      generateAudioBatch(reviewIds: string[]): Promise<{ results: Array<{ review_id: string; status: string; error?: string }> }>;
      delete(id: string): Promise<void>;
      createResponse(reviewId: string, body: AdminCreateProductReviewResponseDTO): Promise<{ product_review_response: AdminProductReviewResponse }>;
      updateResponse(reviewId: string, body: AdminUpdateProductReviewResponseDTO): Promise<{ product_review_response: AdminProductReviewResponse }>;
      deleteResponse(reviewId: string): Promise<{ product_review: AdminProductReview }>;
    };
    productReviewStats: {
      refresh(body?: { product_ids?: string[] }): Promise<{ message: string; refreshed: number; product_ids: string[] }>;
    };
    products: {
      updateReviewAudioConfig(
        productId: string,
        body: { voices?: Record<string, { female?: string; male?: string }>; default_language?: string },
      ): Promise<{ product: unknown }>;
    };
  };
}

// Global SDK declaration
declare global {
  const sdk: ProductReviewSDK & {
    admin: {
      productReviews: ProductReviewSDK['admin']['productReviews'];
    };
  };
}