<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DocumentRequest extends FormRequest
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
        $isUpdate = $this->method() === 'PUT' || $this->method() === 'PATCH';

        return [
            'employee_id' => [
                $isUpdate ? 'sometimes' : 'required',
                'exists:employees,id'
            ],

            'doc_type' => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'max:255'
            ],

            // Attachment is required ONLY on create
            'attachment' => [
                $isUpdate ? 'sometimes' : 'required',
                'file',
                'max:5120'
            ],

        ];
    }

    public function messages(): array
    {
        return [
            'employee_id.required' => 'Employee is required.',
            'employee_id.exists'   => 'Employee not found.',

            'doc_type.required' => 'Document type is required.',

            'attachment.required' => 'Attachment file is required.',
            'attachment.file'     => 'Attachment must be a file.',
            'attachment.max'      => 'Maximum allowed size is 5MB.',
        ];
    }
}
