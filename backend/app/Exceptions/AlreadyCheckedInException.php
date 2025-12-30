<?php

namespace App\Exceptions;

use Exception;

class AlreadyCheckedInException extends Exception
{
    public function __construct(string $message = 'You already checked in today.')
    {
        parent::__construct($message, 409);
    }
}

