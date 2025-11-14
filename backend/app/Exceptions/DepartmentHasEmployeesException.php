<?php

namespace App\Exceptions;

use Exception;

class DepartmentHasEmployeesException extends Exception
{
    protected $code = 409; // Conflict HTTP status code

    public function __construct(string $message = "Cannot delete department. Employees are still assigned.")
    {
        parent::__construct($message, $this->code);
    }

    /**
     * Render the exception as an HTTP response
     */
    public function render()
    {
        return response()->json([
            'status' => 'error',
            'message' => $this->getMessage(),
            'code' => $this->getCode(),
        ], $this->getCode());
    }
}
