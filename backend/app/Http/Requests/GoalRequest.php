<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $goalId = $this->route('goal')?->id ?? $this->route('goal');
        $isUpdate = !empty($goalId);

        return [
            'employee_id' => [$isUpdate ? 'sometimes' : 'required', 'exists:employees,id'],
            'evaluation_cycle_id' => ['nullable', 'exists:evaluation_cycles,id'],
            'title' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:255'],
            'description' => [$isUpdate ? 'sometimes' : 'required', 'string'],
            'type' => [$isUpdate ? 'sometimes' : 'required', Rule::in(['individual', 'team', 'departmental', 'company'])],
            'category' => [$isUpdate ? 'sometimes' : 'required', Rule::in(['performance', 'development', 'behavioral'])],
            'success_criteria' => [$isUpdate ? 'sometimes' : 'required', 'array', 'min:1'],
            'success_criteria.*' => ['string', 'max:500'],
            'start_date' => [$isUpdate ? 'sometimes' : 'required', 'date'],
            'target_date' => [$isUpdate ? 'sometimes' : 'required', 'date', 'after:start_date'],
            'weight' => [$isUpdate ? 'sometimes' : 'required', 'integer', 'min:1', 'max:10'],
        ];
    }
}
