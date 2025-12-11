<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $assetId = $this->asset ? $this->asset->id : null;

        return [
            'name' => ['required', 'string', 'max:255'],
            'serial_number' => [
                'required',
                'string',
                'max:100',
                Rule::unique('assets', 'serial_number')->ignore($assetId)
            ],
            'condition' => ['required', 'string', 'max:50'],
            'status' => ['required', 'in:available,assigned,maintenance,retired'],
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Asset name is required.',
            'serial_number.required' => 'Serial number is required.',
            'serial_number.unique' => 'Serial number must be unique.',
            'condition.required' => 'Asset condition is required.',
            'status.required' => 'Asset status is required.',
            'status.in' => 'Status must be one of: available, assigned, maintenance, retired.',
        ];
    }
}