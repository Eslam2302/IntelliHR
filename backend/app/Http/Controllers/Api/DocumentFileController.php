<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

/**
 * Serves document files via signed URLs. No auth required - the signature validates access.
 */
class DocumentFileController extends Controller
{
    public function __invoke(Document $document): Response|\Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        if (!$document->file_path) {
            abort(404, 'No file attached to this document.');
        }
        $path = Storage::disk('public')->path($document->file_path);
        if (!file_exists($path)) {
            abort(404, 'File not found.');
        }
        $mime = @mime_content_type($path) ?: 'application/octet-stream';
        $name = basename($document->file_path);

        return response()->file($path, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="' . $name . '"',
        ]);
    }
}
