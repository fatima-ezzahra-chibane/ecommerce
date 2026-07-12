<?php

namespace App\Services\Ai;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAiClient
{
    public function isConfigured(): bool
    {
        return ! empty(config('services.openai.key'));
    }

    public function chat(array $messages): ?string
    {
        if (! $this->isConfigured()) {
            return null;
        }

        try {
            $response = Http::timeout(45)
                ->withToken(config('services.openai.key'))
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => config('services.openai.model', 'gpt-4o-mini'),
                    'messages' => $messages,
                    'max_tokens' => 600,
                    'temperature' => 0.6,
                ]);

            if (! $response->successful()) {
                Log::warning('OpenAI chat error', ['body' => $response->body()]);

                return null;
            }

            return $response->json('choices.0.message.content');
        } catch (\Throwable $e) {
            Log::warning('OpenAI chat exception', ['message' => $e->getMessage()]);

            return null;
        }
    }
}
