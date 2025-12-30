<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewRatingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'competency' => new CompetencyResource($this->whenLoaded('competency')),
            'self_rating' => $this->self_rating,
            'self_rating_comment' => $this->self_rating_comment,
            'manager_rating' => $this->manager_rating,
            'manager_rating_comment' => $this->manager_rating_comment,
            'rating_gap' => $this->getRatingGap(),
        ];
    }
}
