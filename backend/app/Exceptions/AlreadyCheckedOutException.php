<?php

namespace App\Exceptions;

use Exception;

class AlreadyCheckedOutException extends Exception
{
    public function __construct(string $message = 'You already checked out today.')
    {
        parent::__construct($message, 409);
    }
}

