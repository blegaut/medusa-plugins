import { defineMiddlewares } from '@medusajs/medusa';
import { adminProductReviewRoutesMiddlewares } from './admin/product-reviews/middlewares';
import { adminProductReviewStatRoutesMiddlewares } from './admin/product-review-stats/middlewares';
import { storeProductReviewRoutesMiddlewares } from './store/product-reviews/middlewares';
import { adminProductReviewResponseRouteMiddlewares } from './admin/product-reviews/[id]/response/middlewares';
import { storeProductReviewUploadsMiddlewares } from './store/product-reviews/uploads/middlewares';
import { storeProductReviewStatRoutesMiddlewares } from './store/product-review-stats/middlewares';
import { adminProductReviewStatusRoutesMiddlewares } from './admin/product-reviews/[id]/status/middlewares';
import { adminProductReviewVerifiedRoutesMiddlewares } from './admin/product-reviews/[id]/verified/middlewares';
import { adminProductReviewFeaturedForAudioRoutesMiddlewares } from './admin/product-reviews/[id]/featured-for-audio/middlewares';
import { adminProductReviewLanguageRoutesMiddlewares } from './admin/product-reviews/[id]/language/middlewares';
import { adminProductReviewVoiceGenderRoutesMiddlewares } from './admin/product-reviews/[id]/voice-gender/middlewares';
import { adminBatchGenerateReviewAudioRoutesMiddlewares } from './admin/product-reviews/generate-audio/middlewares';
import { adminProductReviewAudioConfigRoutesMiddlewares } from './admin/products/[id]/review-audio-config/middlewares';

export default defineMiddlewares({
  routes: [
    ...adminProductReviewRoutesMiddlewares,
    ...adminProductReviewStatRoutesMiddlewares,
    ...adminProductReviewResponseRouteMiddlewares,
    ...adminProductReviewStatusRoutesMiddlewares,
    ...adminProductReviewVerifiedRoutesMiddlewares,
    ...adminProductReviewFeaturedForAudioRoutesMiddlewares,
    ...adminProductReviewLanguageRoutesMiddlewares,
    ...adminProductReviewVoiceGenderRoutesMiddlewares,
    ...adminBatchGenerateReviewAudioRoutesMiddlewares,
    ...adminProductReviewAudioConfigRoutesMiddlewares,

    // Store
    ...storeProductReviewUploadsMiddlewares,
    ...storeProductReviewRoutesMiddlewares,
    ...storeProductReviewStatRoutesMiddlewares,
  ],
});
