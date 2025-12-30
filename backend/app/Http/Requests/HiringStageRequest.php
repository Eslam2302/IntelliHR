<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class HiringStageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
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
        $hiringStageId = $this->route('hiringStage')?->id;
        $isUpdate = !empty($hiringStageId);

        return [
            'job_id'     => [
                $isUpdate ? 'sometimes' : 'required',
                'integer',
                'exists:job_posts,id'
            ],
            'stage_name' => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'max:255'
            ],
            'order'      => [
                $isUpdate ? 'sometimes' : 'required',
                'integer',
                'min:1',
                Rule::unique('hiring_stages')->where(function ($query) {
                    return $query->where('job_id', $this->input('job_id') ?? $this->route('hiringStage')?->job_id);
                })->ignore($hiringStageId),
            ],
        ];
    }
}
