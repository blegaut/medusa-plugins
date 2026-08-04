import { defineWidgetConfig } from '@medusajs/admin-sdk';
import type { AdminProduct, DetailWidgetProps } from '@medusajs/framework/types';
import { Container } from '../components/atoms/container';
import { ProductReviewAudioConfig } from '../components/molecules/ProductReviewAudioConfig';
import { ProductReviewDataTable } from '../components/molecules/ProductReviewDataTable';

const ProductDetailsProductReviewsWidget = ({
  data: product,
}: DetailWidgetProps<AdminProduct>) => {
  return (
    <Container className="mb-2">
      <ProductReviewAudioConfig productId={product.id} metadata={product.metadata} />
      <ProductReviewDataTable defaultQuery={{ product_id: product.id }} />
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: 'product.details.after',
});

export default ProductDetailsProductReviewsWidget;
