<?php

namespace App\DataTransferObjects;

use App\Http\Requests\ReviewRatingRequest;

class ReviewRatingDTO
{
    public function __construct(
        public readonly int $performanceReviewId,
        public readonly int $competencyId,
        public readonly ?int $selfRating,
        public readonly ?string $selfRatingComment,
        public readonly ?int $managerRating,
        public readonly ?string $managerRatingComment,
    ) {}

    public static function fromRequest(ReviewRatingRequest $request): self
    {
        $reviewRating = $request->route('review_rating');
        $isUpdate = !empty($reviewRating);
        
        // For create, these are required (validation handles this)
        // For update, preserve existing values if not provided
        $performanceReviewId = $isUpdate 
            ? ($request->validated('performance_review_id') ?? $reviewRating->performance_review_id)
            : $request->validated('performance_review_id');
            
        $competencyId = $isUpdate
            ? ($request->validated('competency_id') ?? $reviewRating->competency_id)
            : $request->validated('competency_id');
        
        return new self(
            performanceReviewId: $performanceReviewId,
            competencyId: $competencyId,
            selfRating: $request->validated('self_rating'),
            selfRatingComment: $request->validated('self_rating_comment'),
            managerRating: $request->validated('manager_rating'),
            managerRatingComment: $request->validated('manager_rating_comment'),
        );
    }

    public function toArray(): array
    {
        return [
            'performance_review_id' => $this->performanceReviewId,
            'competency_id' => $this->competencyId,
            'self_rating' => $this->selfRating,
            'self_rating_comment' => $this->selfRatingComment,
            'manager_rating' => $this->managerRating,
            'manager_rating_comment' => $this->managerRatingComment,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Remove performance_review_id and competency_id from updates (shouldn't change)
        unset($data['performance_review_id'], $data['competency_id']);
        // Filter out null values for partial updates
        return array_filter($data, function($value) {
            return $value !== null;
        });
    }
}

