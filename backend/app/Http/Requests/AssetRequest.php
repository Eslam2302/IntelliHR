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
        // Authorization is handled by middleware
        // This ensures user is authenticated
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $asset = $this->route('asset');
        $assetId = $asset?->id ?? ($this->asset ? $this->asset->id : null);
        $isUpdate = !empty($asset);

        return [
            'name' => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'max:255'
            ],
            'serial_number' => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'max:100',
                Rule::unique('assets', 'serial_number')->ignore($assetId)
            ],
            'condition' => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'max:50'
            ],
            'status' => [
                $isUpdate ? 'sometimes' : 'required',
                'in:available,assigned,maintenance,retired'
            ],
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