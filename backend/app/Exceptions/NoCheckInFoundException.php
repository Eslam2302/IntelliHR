<?php

namespace App\Exceptions;

use Exception;

class NoCheckInFoundException extends Exception
{
    public function __construct(string $message = 'You must check in first.')
    {
        parent::__construct($message, 404);
    }
}

