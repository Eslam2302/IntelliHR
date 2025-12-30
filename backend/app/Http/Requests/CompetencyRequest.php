<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CompetencyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $competencyId = $this->route('competency')?->id ?? $this->route('competency');
        $isUpdate = !empty($competencyId);

        return [
            'name' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:255'],
            'description' => [$isUpdate ? 'sometimes' : 'required', 'string'],
            'category' => [$isUpdate ? 'sometimes' : 'required', Rule::in(['technical', 'behavioral', 'leadership', 'core_values'])],
            'applicable_to' => [$isUpdate ? 'sometimes' : 'required', Rule::in(['all', 'individual_contributor', 'manager', 'senior_manager', 'executive'])],
            'rating_descriptors' => [$isUpdate ? 'sometimes' : 'required', 'array', 'min:5', 'max:5'],
            'rating_descriptors.1' => ['required_with:rating_descriptors', 'string'],
            'rating_descriptors.2' => ['required_with:rating_descriptors', 'string'],
            'rating_descriptors.3' => ['required_with:rating_descriptors', 'string'],
            'rating_descriptors.4' => ['required_with:rating_descriptors', 'string'],
            'rating_descriptors.5' => ['required_with:rating_descriptors', 'string'],
            'weight' => [$isUpdate ? 'sometimes' : 'required', 'integer', 'min:1', 'max:10'],
            'is_active' => ['boolean'],
            'display_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
