<?php

use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use App\Models\JobPosition;
use App\Services\ActivityLoggerService;
use function Pest\Laravel\postJson;
use function Pest\Laravel\putJson;
use function Pest\Laravel\deleteJson;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertSoftDeleted;

beforeEach(function () {
    // تجاهل الـ Middleware والـ Permissions تماماً
    $this->withoutMiddleware();

    $this->mock(ActivityLoggerService::class, function ($mock) {
        $mock->shouldReceive('log')->zeroOrMoreTimes();
    });

    $this->department = Department::factory()->create();
    $this->job = JobPosition::factory()->create(['department_id' => $this->department->id]);

    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('can store a new employee and its associated user via api', function () {
    $payload = [
        'first_name'            => 'Eslam',
        'last_name'             => 'Anwar',
        'work_email'            => 'eslam' . rand(1, 999) . '@company.com',
        'personal_email'        => 'private' . rand(1, 999) . '@gmail.com',
        'phone'                 => '01012345678',
        'gender'                => 'male',
        'national_id'           => (string) rand(10000000000000, 99999999999999),
        'birth_date'            => '1999-01-01',
        'address'               => 'Cairo, Egypt',
        'employee_status'       => 'probation',
        'department_id'         => $this->department->id,
        'job_id'                => $this->job->id,
        'hire_date'             => '2024-03-26',
        'password'              => 'TestPassword123!',
        'password_confirmation' => 'TestPassword123!',
    ];

    $response = postJson(route('employees.store'), $payload);
    $response->assertStatus(201);
});

it('can update an existing employee details', function () {
    $employee = Employee::factory()->create(['department_id' => $this->department->id]);
    User::factory()->create(['employee_id' => $employee->id]);

    $updatePayload = [
        'first_name'            => 'UpdatedName',
        'last_name'             => 'Anwar',
        'work_email'            => 'upd' . rand(1, 999) . '@company.com',
        'phone'                 => '01111111111',
        'gender'                => 'male',
        'national_id'           => $employee->national_id, // Immutable
        'birth_date'            => '1999-01-01',
        'address'               => 'New Cairo',
        'employee_status'       => 'active',
        'department_id'         => $this->department->id,
        'job_id'                => $this->job->id,
        'hire_date'             => $employee->hire_date,
        'personal_email'        => 'new' . rand(1, 999) . '@gmail.com',
        'password'              => 'NewPass123!',
        'password_confirmation' => 'NewPass123!',
    ];

    // استخدام route() بيضمن إن الـ ID يروح للمكان الصح في الـ Request
    $response = putJson(route('employees.update', $employee), $updatePayload);

    $response->assertStatus(200);
});

it('can delete an employee and its linked user account', function () {
    $employee = Employee::factory()->create();
    User::factory()->create(['employee_id' => $employee->id]);

    $response = deleteJson(route('employees.destroy', $employee));

    $response->assertStatus(200);
    assertSoftDeleted('employees', ['id' => $employee->id]);
});
