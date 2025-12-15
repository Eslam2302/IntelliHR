<?php

namespace App\Services;

use Spatie\Activitylog\Models\Activity;

class ActivityLoggerService
{
    public function log(
        string $logName,
        string $description,
        $subject = null,
        array $properties = []
    ): Activity {
        return activity($logName)
            ->performedOn($subject)
            ->withProperties($properties)
            ->log($description);
    }
}
