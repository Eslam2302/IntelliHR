<?php

use App\Models\Employee;
use App\Repositories\EmployeeRepository;
use function Pest\Laravel\assertDatabaseHas;


beforeEach(function () {
    $this->repository = new EmployeeRepository(new Employee());
});

it('correctly persists a new employee to the database', function () {
    $employeeData = [
        'first_name'      => 'Eslam',
        'last_name'       => 'Anwar',
        'work_email'      => 'eslam.dev@example.com',
        'phone'           => '01012345678',
        'gender'          => 'male',
        'national_id'     => '29901011234567',
        'birth_date'      => '1999-01-01',
        'hire_date'       => '2024-03-26',
        'employee_status' => 'active',
    ];

    
    $result = $this->repository->create($employeeData);


    expect($result)->toBeInstanceOf(Employee::class)
        ->and($result->exists)->toBeTrue()
        ->and($result->id)->not->toBeNull();

    assertDatabaseHas('employees', [
        'work_email'  => 'eslam.dev@example.com',
        'national_id' => '29901011234567',
        'first_name'  => 'Eslam',
    ]);
});

it('can find the created employee by id', function () {
    $employee = Employee::create([
        'first_name'      => 'Ahmed',
        'last_name'       => 'Ali',
        'gender'          => 'male',
        'national_id'     => '11122233344455',
        'birth_date'      => '1990-05-05',
        'hire_date'       => '2020-01-01',
    ]);

    $found = $this->repository->findById($employee->id);

    expect($found)->not->toBeNull()
        ->and($found->id)->toBe($employee->id)
        ->and($found->first_name)->toBe('Ahmed');
});
