<?php

namespace App\DataTransferObjects;

use App\Http\Requests\TrainerRequest;

class TrainerDTO
{
    public function __construct(
        public readonly ?string $type,
        public readonly ?int $employee_id,
        public readonly ?string $name,
        public readonly ?string $email,
        public readonly ?string $phone,
        public readonly ?string $company,
    ) {}

    /*
     * Create DTO from request
    */
    public static function fromRequest(TrainerRequest $request): self
    {
        $trainer = $request->route('trainer');
        $isUpdate = !empty($trainer);
        
        return new self(
            type: $isUpdate
                ? ($request->validated('type') ?? $trainer->type)
                : $request->validated('type'),
            employee_id: $request->validated('employee_id') ?? ($isUpdate ? $trainer->employee_id : null),
            name: $request->validated('name') ?? ($isUpdate ? $trainer->name : null),
            email: $request->validated('email') ?? ($isUpdate ? $trainer->email : null),
            phone: $request->validated('phone') ?? ($isUpdate ? $trainer->phone : null),
            company: $request->validated('company') ?? ($isUpdate ? $trainer->company : null),
        );
    }

    /**
     * Convert DTO to array
     */
    public function toArray(): array
    {
        return [
            'type' => $this->type,
            'employee_id' => $this->employee_id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'company' => $this->company
        ];
    }

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Remove type from updates (shouldn't change)
        unset($data['type']);
        // Filter out empty strings and null values for partial updates
        return array_filter($data, function ($value) {
            return $value !== null && $value !== '';
        });
    }
}
