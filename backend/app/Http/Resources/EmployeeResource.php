<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'full_name' => $this->name,
            'job_title' => $this->job_title,
            'personal_email' => $this->personal_email,
            'phone' => $this->phone,

            'department' => [
                'id' => $this->department->id ?? null,
                'name' => $this->department->name ?? 'N/A',
            ],

            'manager' => [
                'id' => $this->manager->id ?? null,
                'name' => $this->manager->name ?? 'None',
            ],

            'user_account' => [
                // الـ ID هنا هو رقم الموظف التسلسلي الذي يُستخدم في جدول Users
                'employee_id' => $this->id,

                // نستخدم العلاقة user() للوصول لحساب الدخول
                'login_email' => $this->user->email ?? 'N/A',
            ],
            
            'hire_date' => $this->hire_date,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}