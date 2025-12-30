<?php

namespace App\Exceptions;

use Exception;

class DuplicateAttendanceException extends Exception
{
    public function __construct(string $message = 'Attendance record already exists for this employee and date.')
    {
        parent::__construct($message, 409);
    }
}

