import { StepResponse, createStep } from '@medusajs/workflows-sdk';
import { PRODUCT_REVIEW_MODULE } from '../../modules/product-review';
import type ProductReviewService from '../../modules/product-review/service';
import type { CreateProductReviewInput } from '../../modules/product-review/types/mutations';

const DEFAULT_REVIEW_IMAGE_TYPE = 'image';

export const createProductReviewsStepId = 'create-product-review-step';

export const createProductReviewsStep = createStep(
  createProductReviewsStepId,
  async (data: CreateProductReviewInput[], { container }) => {
    const productReviewService = container.resolve<ProductReviewService>(PRODUCT_REVIEW_MODULE);

    const images = data.flatMap((productReview, index) =>
      (productReview.images ?? []).map((i) => ({
        url: i.url,
        type: i.type || DEFAULT_REVIEW_IMAGE_TYPE,
        index,
      })),
    );

    // Omit nested images so Mikro-ORM does not insert them twice (once via cascade,
    // once via createProductReviewImages) and so type is always set on the image rows.
    const createData: any[] = data.map(({ images: _images, ...d }) => ({
      ...d,
      status: d.status ?? productReviewService.defaultReviewStatus,
    }));

    const productReviews = await productReviewService.createProductReviews(createData);

    if (images.length > 0) {
      await productReviewService.createProductReviewImages(
        images.map((i) => ({
          product_review_id: productReviews[i.index].id,
          url: i.url,
          type: i.type,
        })),
      );
    }

    return new StepResponse(productReviews, {
      productReviewIds: productReviews.map((productReview) => productReview.id),
    });
  },
  async (data, { container }) => {
    if (!data) return;

    const { productReviewIds } = data;

    const productReviewService = container.resolve<ProductReviewService>(PRODUCT_REVIEW_MODULE);

    await productReviewService.deleteProductReviews(productReviewIds);

    await productReviewService.refreshProductReviewStats(productReviewIds);
  },
);
