<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GoalProgressRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is handled by middleware
        // This ensures user is authenticated
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $progressId = $this->route('goal_progress_update')?->id ?? $this->route('goal_progress_update');
        $isUpdate = !empty($progressId);

        return [
            'update_note' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:1000'],
            'progress_percentage' => [$isUpdate ? 'sometimes' : 'required', 'integer', 'min:0', 'max:100'],
            'status' => [$isUpdate ? 'sometimes' : 'required', Rule::in(['on_track', 'at_risk', 'blocked', 'completed'])],
            'update_date' => ['nullable', 'date'],
        ];
    }
}
