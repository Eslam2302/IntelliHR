<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TrainingCertificate;

class TrainingCertificateSeeder extends Seeder
{
    public function run()
    {
        TrainingCertificate::create([
            'employee_training_id' => 1,
            'issued_at' => '2025-01-06',
            'certificate_path' => 'certificates/leadership_emp1.pdf'
        ]);
    }
}