import { ChatBubble, Eye, CheckCircle, XCircle, Clock } from '@medusajs/icons';
import { Button, Table, Badge, Input } from '@medusajs/ui';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import { useAdminListProductReviews, useAdminUpdateProductReviewStatusMutation, useAdminUpdateProductReviewVerifiedMutation, useAdminUpdateProductReviewFeaturedForAudioMutation, useAdminGenerateReviewAudioMutation } from '../../hooks/product-review';
import { ProductReviewResponseDrawer } from './ProductReviewResponseDrawer';
import { ProductReviewDetailsDrawer } from './ProductReviewDetailsDrawer';
import { Link } from 'react-router-dom';
import { ReviewStars } from '../atoms/review-stars';
import { AdminListProductReviewsQuery, AdminProductReview } from '../../../sdk/types';

interface EnhancedProductReviewDataTableProps {
  query: AdminListProductReviewsQuery;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  showColumns?: string[];
}

export const EnhancedProductReviewDataTable = ({
  query,
  currentPage,
  onPageChange,
  pageSize,
  showColumns = ['select', 'product', 'rating', 'audio', 'status', 'created_at', 'customer', 'review', 'images', 'response', 'verified', 'actions']
}: EnhancedProductReviewDataTableProps) => {
  const [selectedReview, setSelectedReview] = useState<AdminProductReview | null>(null);
  const [selectedReviewForDetails, setSelectedReviewForDetails] = useState<AdminProductReview | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageInput, setPageInput] = useState<string>(currentPage.toString());
  const [triggerRefresh, setTriggerRefresh] = useState(0);

  const { mutate: updateStatus } = useAdminUpdateProductReviewStatusMutation();
  const { mutate: updateVerified } = useAdminUpdateProductReviewVerifiedMutation();
  const { mutate: updateFeaturedForAudio } = useAdminUpdateProductReviewFeaturedForAudioMutation();
  const { mutateSingle: generateAudio, mutateBatch: generateAudioBatch, isPending: isGeneratingAudio } = useAdminGenerateReviewAudioMutation();

  const listQuery = {
    ...query,
    offset: query.offset ?? (currentPage - 1) * pageSize,
  };

  const { data, isLoading, error } = useAdminListProductReviews(listQuery, triggerRefresh);

  const toggleSelected = (reviewId: string) => {
    setSelectedIds((prev) =>
      prev.includes(reviewId) ? prev.filter((id) => id !== reviewId) : [...prev, reviewId],
    );
  };

  const handleBulkGenerate = async () => {
    if (!selectedIds.length) return;
    await generateAudioBatch(selectedIds);
    setTriggerRefresh((value) => value + 1);
  };

  const getAudioBadge = (review: AdminProductReview) => {
    const lang = (review.language || 'es').toUpperCase();
    const gender = review.voice_gender === 'male' ? 'M' : 'F';
    const status = review.audio_status || 'none';
    return `${lang} · ${gender} · ${status}`;
  };

  const reviews = data?.product_reviews ?? [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPageInput(value);
    }
  };

  const handlePageInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNumber = parseInt(pageInput);
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        onPageChange(pageNumber);
      } else {
        setPageInput(currentPage.toString());
      }
    }
  };

  const handlePageInputBlur = () => {
    const pageNumber = parseInt(pageInput);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  // Update page input when current page changes externally
  React.useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'flagged':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getNextStatus = (currentStatus: string): string => {
    const statusCycle = {
      approved: 'pending',
      pending: 'flagged',
      flagged: 'approved'
    };
    return statusCycle[currentStatus as keyof typeof statusCycle] || 'pending';
  };

  const getStatusBadge = (review: AdminProductReview) => {
    const colors = {
      approved: 'green',
      pending: 'orange',
      flagged: 'red'
    };
    const Icon = getStatusIcon(review.status);

    return (
      <Button
        variant="transparent"
        size="small"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const nextStatus = getNextStatus(review.status);

          updateStatus({ reviewId: review.id, status: nextStatus as 'pending' | 'approved' | 'flagged' }, {
            onSuccess: () => {
              setTriggerRefresh((value) => value + 1);
            },
          });
        }}
        className="flex items-center gap-1 hover:bg-ui-bg-subtle rounded px-2 py-1"
      >
        <Icon className="h-4 w-4" />
        <Badge color={colors[review.status as keyof typeof colors] || 'grey'} size="small">
          {review.status}
        </Badge>
      </Button>
    );
  };


  const getVerifiedIcon = (verified: boolean) => {
    switch (verified) {
      case true:
        return CheckCircle;
      case false:
        return XCircle;
      default:
        return XCircle;
    }
  };

  const getNextVerified = (verified: boolean): boolean => {
    return !verified;
  };
  const getVerifiedBadge = (review: AdminProductReview) => {
    const colors = {
      true: 'green',
      false: 'red',
    };
    const Icon = getVerifiedIcon(review.verified);

    return (
      <Button
        variant="transparent"
        size="small"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const nextVerified = getNextVerified(review.verified);

          updateVerified({ reviewId: review.id, verified: nextVerified }, {
            onSuccess: () => {
              setTriggerRefresh((value) => value + 1);
            },
          });
        }}
        className="flex items-center gap-1 hover:bg-ui-bg-subtle rounded px-2 py-1"
      >
        <Icon className="h-4 w-4" />
        <Badge color={colors[review.verified as unknown as keyof typeof colors] || 'grey'} size="small">
          {review.verified ? 'Verified' : 'Unverified'}
        </Badge>
      </Button>
    );
  };

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <Button size="small" variant="secondary" onClick={handleBulkGenerate} isLoading={isGeneratingAudio}>
            Generate audio ({selectedIds.length})
          </Button>
          <Button
            size="small"
            variant="transparent"
            onClick={() => {
              selectedIds.forEach((id) => {
                updateFeaturedForAudio({ reviewId: id, featured: true });
              });
            }}
          >
            Mark for listen
          </Button>
        </div>
      )}
      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <Table className="min-w-[1200px] w-full">
          <Table.Header>
            <Table.Row>
              {showColumns.includes('select') && <Table.HeaderCell className="w-10" />}
              {showColumns.includes('product') && <Table.HeaderCell className="min-w-[180px]">Product</Table.HeaderCell>}
              {showColumns.includes('rating') && <Table.HeaderCell className="w-28">Rating</Table.HeaderCell>}
              {showColumns.includes('audio') && <Table.HeaderCell className="min-w-[9.5rem]">Audio</Table.HeaderCell>}
              {showColumns.includes('status') && <Table.HeaderCell className="min-w-[7rem]">Status</Table.HeaderCell>}
              {showColumns.includes('created_at') && <Table.HeaderCell className="min-w-[7rem] whitespace-nowrap">Created At</Table.HeaderCell>}
              {showColumns.includes('customer') && <Table.HeaderCell className="min-w-[6rem]">Customer</Table.HeaderCell>}
              {showColumns.includes('review') && <Table.HeaderCell className="min-w-[12rem]">Review</Table.HeaderCell>}
              {showColumns.includes('images') && <Table.HeaderCell className="w-16">Images</Table.HeaderCell>}
              {showColumns.includes('response') && <Table.HeaderCell className="min-w-[6rem]">Response</Table.HeaderCell>}
              {showColumns.includes('verified') && <Table.HeaderCell className="min-w-[6.5rem]">Verified</Table.HeaderCell>}
              {showColumns.includes('actions') && <Table.HeaderCell className="min-w-[8rem] whitespace-nowrap">Actions</Table.HeaderCell>}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {error ? (
              <Table.Row>
                <Table.Cell colSpan={showColumns.length} className="text-center py-8 text-ui-fg-error">
                  Failed to load reviews: {error.message}
                </Table.Cell>
              </Table.Row>
            ) : isLoading ? (
              <Table.Row>
                <Table.Cell colSpan={showColumns.length} className="text-center py-8">
                  Loading...
                </Table.Cell>
              </Table.Row>
            ) : reviews.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={showColumns.length} className="text-center py-8 text-ui-fg-muted">
                  No reviews found
                </Table.Cell>
              </Table.Row>
            ) : (
              reviews.map((review) => (
                <Table.Row key={review.id}>
                  {showColumns.includes('select') && (
                    <Table.Cell>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(review.id)}
                        onChange={() => toggleSelected(review.id)}
                      />
                    </Table.Cell>
                  )}
                  {showColumns.includes('product') && (
                    <Table.Cell>
                      {review.product ? (
                        <div className="flex items-center gap-3">
                          {review.product.thumbnail ? (
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={review.product.thumbnail}
                              alt={review.product.title}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-ui-bg-subtle" />
                          )}
                          <div className="min-w-0 flex-1">
                            <Link to={`/products/${review.product.id}`} className="hover:underline">
                              <p className="text-sm font-medium truncate">
                                {review.product.title}
                              </p>
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <span className="text-ui-fg-muted">N/A</span>
                      )}
                    </Table.Cell>
                  )}

                  {showColumns.includes('rating') && (
                    <Table.Cell>
                      <ReviewStars rating={review.rating} />
                    </Table.Cell>
                  )}

                  {showColumns.includes('audio') && (
                    <Table.Cell className="min-w-[9.5rem] align-top">
                      <div className="flex min-w-[9rem] flex-col gap-1.5">
                        <Badge size="small" className="w-fit whitespace-nowrap">
                          {getAudioBadge(review)}
                        </Badge>
                        <label className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={!!review.featured_for_audio}
                            onChange={(e) => {
                              updateFeaturedForAudio(
                                { reviewId: review.id, featured: e.target.checked },
                                {
                                  onSuccess: () => {
                                    setTriggerRefresh((value) => value + 1);
                                  },
                                },
                              );
                            }}
                          />
                          Listen
                        </label>
                      </div>
                    </Table.Cell>
                  )}

                  {showColumns.includes('status') && (
                    <Table.Cell>
                      {getStatusBadge(review)}
                    </Table.Cell>
                  )}

                  {showColumns.includes('created_at') && (
                    <Table.Cell className="text-sm text-ui-fg-subtle">
                      {DateTime.fromISO(review.created_at).toFormat('LLL dd yyyy')}
                    </Table.Cell>
                  )}

                  {showColumns.includes('customer') && (
                    <Table.Cell className="text-sm">
                      {review.name}
                    </Table.Cell>
                  )}

                  {showColumns.includes('review') && (
                    <Table.Cell>
                      <div className="max-w-xs">
                        {review.title?.trim() && (
                          <p className="text-sm font-medium line-clamp-1">{review.title}</p>
                        )}
                        <p className="text-sm line-clamp-2 text-ui-fg-subtle">{review.content}</p>
                      </div>
                    </Table.Cell>
                  )}

                  {showColumns.includes('images') && (
                    <Table.Cell className="text-sm text-ui-fg-subtle">
                      {(review.images || []).length}
                    </Table.Cell>
                  )}

                  {showColumns.includes('response') && (
                    <Table.Cell>
                      {review.response?.content ? (
                        <span className="text-sm text-ui-tag-green-text">Responded</span>
                      ) : (
                        <span className="text-sm text-ui-fg-muted">No response</span>
                      )}
                    </Table.Cell>
                  )}
                  {showColumns.includes('verified') && (
                    <Table.Cell>
                      {getVerifiedBadge(review)}
                    </Table.Cell>
                  )}

                  {showColumns.includes('actions') && (
                    <Table.Cell className="min-w-[8rem] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="transparent"
                          size="small"
                          onClick={() => setSelectedReviewForDetails(review)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="transparent"
                          size="small"
                          onClick={async () => {
                            await generateAudio(review.id);
                            setTriggerRefresh((value) => value + 1);
                          }}
                          title="Generate audio"
                        >
                          Audio
                        </Button>
                        <Button
                          variant="transparent"
                          size="small"
                          onClick={() => setSelectedReview(review)}
                          title="Add response"
                        >
                          <ChatBubble className="h-4 w-4" />
                        </Button>
                      </div>
                    </Table.Cell>
                  )}
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>

      {/* Enhanced Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-ui-fg-subtle">
          Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)} to{' '}
          {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="small"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            {/* Page Number Display with Input */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Page</span>
              <Input
                type="text"
                value={pageInput}
                onChange={handlePageInputChange}
                onKeyDown={handlePageInputSubmit}
                onBlur={handlePageInputBlur}
                className="w-16 px-2 py-1 text-center text-sm"
              />
              <span className="text-sm">of {totalPages}</span>
            </div>

            <Button
              variant="secondary"
              size="small"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>

          {/* Quick Jump to Page */}
          <div className="flex items-center gap-2">
            {totalPages > 10 && (
              <>
                {currentPage > 3 && (
                  <>
                    <Button
                      variant="transparent"
                      size="small"
                      onClick={() => onPageChange(1)}
                    >
                      1
                    </Button>
                    {currentPage > 4 && <span className="text-ui-fg-muted">...</span>}
                  </>
                )}

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4)) +
                               (currentPage <= 3 ? i : currentPage >= totalPages - 2 ? 4 - (totalPages - currentPage) : 2);
                  if (page > 0 && page <= totalPages && Math.abs(page - currentPage) <= 2) {
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'primary' : 'transparent'}
                        size="small"
                        onClick={() => onPageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  }
                  return null;
                }).filter(Boolean)}

                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && <span className="text-ui-fg-muted">...</span>}
                    <Button
                      variant="transparent"
                      size="small"
                      onClick={() => onPageChange(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {selectedReview && (
        <ProductReviewResponseDrawer
          review={selectedReview}
          open={selectedReview !== null}
          setOpen={(open) => setSelectedReview(open ? selectedReview : null)}
        />
      )}

      {selectedReviewForDetails && (
        <ProductReviewDetailsDrawer
          review={selectedReviewForDetails}
          open={selectedReviewForDetails !== null}
          setOpen={(open) => setSelectedReviewForDetails(open ? selectedReviewForDetails : null)}
          onReviewUpdated={() => {
            setTriggerRefresh((value) => value + 1);
          }}
        />
      )}
    </>
  );
};