<?php

namespace App\Services\OpenAI;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser;

class ResumeTextExtractorService
{
    protected Parser $parser;

    public function __construct()
    {
        $this->parser = new Parser();
    }

    /**
     * Extract text from PDF resume
     *
     * @param string $filePath
     * @return string
     * @throws \Exception
     */
    public function extractFromPdf(string $filePath): string
    {
        try {
            // Get full path from storage
            $fullPath = Storage::disk('public')->path($filePath);

            if (!file_exists($fullPath)) {
                throw new \Exception("Resume file not found: {$filePath}");
            }

            // Parse PDF
            $pdf = $this->parser->parseFile($fullPath);
            $text = $pdf->getText();

            if (empty(trim($text))) {
                throw new \Exception("Could not extract text from PDF. The file might be corrupted or image-based.");
            }

            // Clean up the text
            $text = $this->cleanText($text);

            return $text;
        } catch (\Exception $e) {
            Log::error('PDF Text Extraction Error: ' . $e->getMessage(), [
                'file_path' => $filePath,
            ]);
            throw new \Exception('Failed to extract text from PDF: ' . $e->getMessage());
        }
    }

    /**
     * Clean and format extracted text
     *
     * @param string $text
     * @return string
     */
    protected function cleanText(string $text): string
    {
        // Remove excessive whitespace
        $text = preg_replace('/\s+/', ' ', $text);
        
        // Remove special characters that might interfere
        $text = preg_replace('/[^\w\s\-\.\,\:\;\(\)\/\@]/u', ' ', $text);
        
        // Trim
        $text = trim($text);

        return $text;
    }
}

