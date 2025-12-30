<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReviewRatingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $ratingId = $this->route('review_rating')?->id ?? $this->route('review_rating');
        $isUpdate = !empty($ratingId);

        return [
            'performance_review_id' => [$isUpdate ? 'sometimes' : 'required', 'exists:performance_reviews,id'],
            'competency_id' => [$isUpdate ? 'sometimes' : 'required', 'exists:competencies,id'],
            'self_rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'self_rating_comment' => ['nullable', 'string', 'max:1000'],
            'manager_rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'manager_rating_comment' => ['nullable', 'string', 'max:1000'],
        ];
    }
}

