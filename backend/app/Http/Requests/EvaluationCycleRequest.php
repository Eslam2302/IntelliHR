<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EvaluationCycleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Handled by middleware/policies
    }

    public function rules(): array
    {
        $cycleId = $this->route('evaluation_cycle')?->id ?? $this->route('evaluation_cycle');
        $isUpdate = !empty($cycleId);

        return [
            'name' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:255'],
            'type' => [$isUpdate ? 'sometimes' : 'required', Rule::in(['annual', 'semi_annual', 'quarterly', 'probation'])],
            'year' => [$isUpdate ? 'sometimes' : 'required', 'integer', 'min:2020', 'max:2100'],
            'period' => ['nullable', Rule::in(['H1', 'H2', 'Q1', 'Q2', 'Q3', 'Q4', 'full_year'])],

            'start_date' => [$isUpdate ? 'sometimes' : 'required', 'date'],
            'end_date' => [$isUpdate ? 'sometimes' : 'required', 'date', 'after:start_date'],
            'self_assessment_deadline' => [$isUpdate ? 'sometimes' : 'required', 'date', 'after:start_date', 'before:end_date'],
            'manager_review_deadline' => [$isUpdate ? 'sometimes' : 'required', 'date', 'after:self_assessment_deadline', 'before:end_date'],
            'calibration_deadline' => ['nullable', 'date', 'after:manager_review_deadline', 'before:end_date'],
            'final_review_deadline' => [$isUpdate ? 'sometimes' : 'required', 'date', 'after:manager_review_deadline', 'before_or_equal:end_date'],

            'status' => ['nullable', Rule::in(['draft', 'published', 'self_assessment_open', 'manager_review_open', 'calibration', 'completed', 'cancelled'])],
            'rating_scale' => ['nullable', 'array'],
            'rating_scale.*.min' => ['required_with:rating_scale', 'numeric', 'min:0'],
            'rating_scale.*.max' => ['required_with:rating_scale', 'numeric', 'max:5'],
            'rating_scale.*.label' => ['required_with:rating_scale', 'string'],

            'include_self_assessment' => ['boolean'],
            'include_goals' => ['boolean'],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'end_date.after' => 'End date must be after start date.',
            'self_assessment_deadline.after' => 'Self assessment deadline must be after start date.',
            'manager_review_deadline.after' => 'Manager review deadline must be after self assessment deadline.',
        ];
    }
}
