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

        return [
            'job_id'     => ['required', 'integer', 'exists:job_posts,id'],
            'stage_name' => ['required', 'string', 'max:255'],
            'order'      => [
                'required',
                'integer',
                'min:1',

                Rule::unique('hiring_stages')->where(function ($query) {
                    return $query->where('job_id', $this->input('job_id'));
                })->ignore($hiringStageId),
            ],
        ];
    }
}
