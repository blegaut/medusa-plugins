import { Button, Drawer, Select, Text, toast } from '@medusajs/ui';
import { DateTime } from 'luxon';
import ReactPlayer from "react-player";
import { Link } from 'react-router-dom';
import type { AdminProductReview } from '../../../sdk/types';
import { ReviewStars } from '../atoms/review-stars';
import { SectionRow } from '../atoms/section-row';
import {
  useAdminGenerateReviewAudioMutation,
  useAdminUpdateProductReviewLanguageMutation,
  useAdminUpdateProductReviewVoiceGenderMutation,
} from '../../hooks/product-review';

export const ProductReviewDetailsDrawer = ({
  review,
  open,
  setOpen,
  onReviewUpdated,
}: {
  review: AdminProductReview | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  onReviewUpdated?: (review: AdminProductReview) => void;
}) => {
  const { mutateSingle: generateAudio, isPending: isGenerating } = useAdminGenerateReviewAudioMutation();
  const { mutate: updateLanguage } = useAdminUpdateProductReviewLanguageMutation();
  const { mutate: updateVoiceGender } = useAdminUpdateProductReviewVoiceGenderMutation();

  if (!review) return null;

  const ProductValue = () => (
    <div className="flex items-center gap-4">
      {review.product && (
        <>
          {review.product.thumbnail ? (
        <img
          className="h-12 w-12 flex-shrink-0 rounded-md"
          src={review.product.thumbnail}
          alt={review.product.title}
        />
      ) : (
        <div className="h-12 w-12 flex-shrink-0 rounded-md bg-ui-bg-subtle" />
      )}
      <Link to={`/products/${review.product.id}`}>
        <Text className="hover:underline">{review.product.title}</Text>
      </Link>
        </>
      )}
    </div>
  );

  const OrderValue = () => {
    if (!review.order) {
      return <Text className="text-ui-fg-subtle text-sm">No order</Text>;
    }
    
    return (
      <Link to={`/orders/${review.order.id}`}>
        <Text className="hover:underline">#{review.order.display_id}</Text>
      </Link>
    );
  };

  const StatusValue = () => (
    <Text className="text-ui-fg-subtle text-sm">{review.status}</Text>
  );

  const CreatedAtValue = () => (
    <Text className="text-ui-fg-subtle text-sm">
      {DateTime.fromISO(review.created_at).toFormat('LLL dd yyyy hh:mm a')}
    </Text>
  );

  const CustomerValue = () => (
    <div className="flex flex-col gap-1">
      <Text>{review.name}</Text>
    </div>
  );

  const TitleValue = () => (
    <Text className="whitespace-pre-wrap">
      {review.title?.trim() || '—'}
    </Text>
  );

  const ReviewContent = () => (
    <div className="flex flex-col gap-2">
      <Text className="whitespace-pre-wrap">{review.content}</Text>
    </div>
  );

  const ImagesValue = () => (
    <div className="grid grid-cols-3 gap-2 w-full">
      {review.images && review.images.map((media, index) => (
        <div
        key={media.id}
        className="relative flex h-40 items-center justify-center rounded-md bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4 focus:ring-papapogreen-light-1"
      >

        <>
          <span className="absolute inset-0 overflow-hidden rounded-md">
            {media.type.startsWith('image') && (<img
              src={media.url}
              alt=""
              className="h-full w-full object-cover object-center"
              sizes="(max-width: 768px) 25vw, (max-width: 1200px) 15w, 15vw"
            />)}
            {media.type.startsWith('video') && (<ReactPlayer
              src={media.url}
              controls={true}
              width={'100%'}
              height={'100%'}

            />)}
          </span>
        </>
      </div>
      ))}
    </div>
  );

  const ResponseValue = () => (
    <div className="flex flex-col gap-1">
      <Text className="whitespace-pre-wrap">{review.response?.content}</Text>
    </div>
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content className="flex max-h-[96vh] flex-col">
        <Drawer.Header className="shrink-0">
          <Drawer.Title className="font-medium">Review Details</Drawer.Title>
        </Drawer.Header>

        <Drawer.Body className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col divide-y">
          <SectionRow title="Customer" value={<CustomerValue />} />
          <SectionRow title="Status" value={<StatusValue />} />
          <SectionRow title="Created At" value={<CreatedAtValue />} />
          <SectionRow title="Product" value={<ProductValue />} />
          <SectionRow title="Order" value={<OrderValue />} />
          <SectionRow
            title="Rating"
            value={<ReviewStars rating={review.rating} />}
          />
          <SectionRow title="Title" value={<TitleValue />} />
          <SectionRow title="Review" value={<ReviewContent />} />
          <SectionRow
            title="Audio language"
            value={
              <Select
                value={review.language || 'es'}
                onValueChange={async (language) => {
                  const result = await updateLanguage(review.id, language);
                  onReviewUpdated?.(result.product_review);
                  toast.success('Language updated');
                }}
              >
                <Select.Trigger><Select.Value /></Select.Trigger>
                <Select.Content>
                  <Select.Item value="es">ES</Select.Item>
                  <Select.Item value="en">EN</Select.Item>
                </Select.Content>
              </Select>
            }
          />
          <SectionRow
            title="Voice gender"
            value={
              <Select
                value={review.voice_gender || 'female'}
                onValueChange={async (voice_gender) => {
                  const result = await updateVoiceGender(review.id, voice_gender as 'female' | 'male');
                  onReviewUpdated?.(result.product_review);
                  toast.success('Voice gender updated');
                }}
              >
                <Select.Trigger><Select.Value /></Select.Trigger>
                <Select.Content>
                  <Select.Item value="female">Female</Select.Item>
                  <Select.Item value="male">Male</Select.Item>
                </Select.Content>
              </Select>
            }
          />
          {review.audio_url && review.audio_status === 'ready' && (
            <SectionRow
              title="Audio preview"
              value={<audio controls src={review.audio_url} className="w-full" />}
            />
          )}
          <SectionRow
            title="Generate audio"
            value={
              <Button
                size="small"
                isLoading={isGenerating}
                onClick={async () => {
                  const result = await generateAudio(review.id);
                  onReviewUpdated?.(result.product_review);
                  toast.success('Audio generated');
                }}
              >
                Generate MP3
              </Button>
            }
          />
          {(review.images?.length || 0) > 0 && (
            <SectionRow title="Images" value={<ImagesValue />} />
          )}

          <SectionRow
            title="Response"
            value={
              review.response ? <ResponseValue /> : <Text>No response</Text>
            }
          />
          {!!review.response?.created_at && (
            <SectionRow
              title="Responded At"
              value={
                <Text>
                  {DateTime.fromISO(review.response.created_at).toFormat(
                    'LLL dd yyyy hh:mm a'
                  )}
                </Text>
              }
            />
          )}
          </div>
        </Drawer.Body>

        <Drawer.Footer className="shrink-0 border-t border-ui-border-base">
          <Drawer.Close asChild>
            <Button variant="secondary">Close</Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
