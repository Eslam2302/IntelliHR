<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class LeaveRequestResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'          => $this->id,
            'employee'    => [
                'id'        => $this->employee->id,
                'name'      => $this->employee->first_name . ' ' . $this->employee->last_name,
                'email'     => $this->employee->personal_email,
                'phone'     => $this->employee->phone,
            ],
            'leave_type'  => [
                'id'   => $this->type->id,
                'name' => $this->type->name,
                'code' => $this->type->code,
            ],
            'start_date'  => $this->start_date,
            'end_date'    => $this->end_date,
            'days'        => $this->days,
            'reason'      => $this->reason,
            'attachment'  => $this->attachment ? asset('storage/'.$this->attachment) : null,
            'status'      => $this->status,
            'manager'     => $this->manager ? [
                'id'   => $this->manager->id,
                'name' => $this->manager->first_name . ' ' . $this->manager->last_name,
            ] : null,
            'hr'          => $this->hr ? [
                'id'   => $this->hr->id,
                'name' => $this->hr->first_name . ' ' . $this->hr->last_name,
            ] : null,
            'created_at'  => $this->created_at->toDateTimeString(),
        ];
    }
}
