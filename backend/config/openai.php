<?php

return [
    /*
    |--------------------------------------------------------------------------
    | OpenAI API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for OpenAI API integration
    |
    */

    'api_key' => env('OPENAI_API_KEY'),

    'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),

    'max_tokens' => (int) env('OPENAI_MAX_TOKENS', 2000),

    'temperature' => (float) env('OPENAI_TEMPERATURE', 0.7),

    'organization' => env('OPENAI_ORGANIZATION'),

    'timeout' => (int) env('OPENAI_TIMEOUT', 30),

    /*
    |--------------------------------------------------------------------------
    | Feature-Specific Settings
    |--------------------------------------------------------------------------
    */

    'resume_analysis' => [
        'enabled' => env('OPENAI_RESUME_ANALYSIS_ENABLED', true),
        'auto_analyze' => env('OPENAI_AUTO_ANALYZE_RESUMES', true),
    ],

    'chat_assistant' => [
        'enabled' => env('OPENAI_CHAT_ASSISTANT_ENABLED', true),
        'max_history' => (int) env('OPENAI_CHAT_MAX_HISTORY', 10),
    ],

    /*
    |--------------------------------------------------------------------------
    | Caching Configuration
    |--------------------------------------------------------------------------
    */

    'cache' => [
        'enabled' => env('OPENAI_CACHE_ENABLED', true),
        'ttl' => (int) env('OPENAI_CACHE_TTL', 3600), // 1 hour default
        'resume_analysis_ttl' => (int) env('OPENAI_CACHE_RESUME_ANALYSIS_TTL', 86400), // 24 hours
        'chat_response_ttl' => (int) env('OPENAI_CACHE_CHAT_RESPONSE_TTL', 1800), // 30 minutes
    ],

    /*
    |--------------------------------------------------------------------------
    | Cost Tracking Configuration
    |--------------------------------------------------------------------------
    |
    | Token pricing per 1M tokens (as of 2024)
    | Update these prices based on current OpenAI pricing
    |
    */

    'pricing' => [
        'gpt-4o-mini' => [
            'input' => 0.15,  // $0.15 per 1M input tokens
            'output' => 0.60, // $0.60 per 1M output tokens
        ],
        'gpt-4o' => [
            'input' => 2.50,
            'output' => 10.00,
        ],
        'gpt-4' => [
            'input' => 30.00,
            'output' => 60.00,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Analytics Configuration
    |--------------------------------------------------------------------------
    */

    'analytics' => [
        'enabled' => env('OPENAI_ANALYTICS_ENABLED', true),
        'track_costs' => env('OPENAI_TRACK_COSTS', true),
    ],
];

