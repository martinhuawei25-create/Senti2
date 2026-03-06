<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SupabaseService
{
    private string $url;
    private string $anonKey;
    private string $serviceRoleKey;

    public function __construct()
    {
        $this->url = (string) (config('services.supabase.url') ?? '');
        $this->anonKey = (string) (config('services.supabase.anon_key') ?? config('services.supabase.key') ?? '');
        $this->serviceRoleKey = (string) (config('services.supabase.service_role_key') ?? config('services.supabase.key') ?? '');
    }

    public function isConfigured(): bool
    {
        return $this->url !== '' && $this->anonKey !== '';
    }

    public function signUp(string $email, string $password): array
    {
        try {
            $response = Http::withHeaders([
                'apikey' => $this->anonKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->url}/auth/v1/signup", [
                'email' => $email,
                'password' => $password,
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                    'error' => null,
                ];
            }

            return [
                'success' => false,
                'data' => null,
                'error' => $response->json(),
            ];
        } catch (\Exception $e) {
            Log::error('Error en signUp: ' . $e->getMessage());
            return [
                'success' => false,
                'data' => null,
                'error' => ['message' => 'Error al registrar usuario'],
            ];
        }
    }

    public function signIn(string $email, string $password): array
    {
        try {
            $response = Http::withHeaders([
                'apikey' => $this->anonKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->url}/auth/v1/token?grant_type=password", [
                'email' => $email,
                'password' => $password,
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                    'error' => null,
                ];
            }

            return [
                'success' => false,
                'data' => null,
                'error' => $response->json(),
            ];
        } catch (\Exception $e) {
            Log::error('Error en signIn: ' . $e->getMessage());
            return [
                'success' => false,
                'data' => null,
                'error' => ['message' => 'Error al iniciar sesión'],
            ];
        }
    }

    public function getUser(string $token): ?array
    {
        try {
            $response = Http::withHeaders([
                'apikey' => $this->anonKey,
                'Authorization' => 'Bearer ' . $token,
            ])->get("{$this->url}/auth/v1/user");

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (\Exception $e) {
            Log::error('Error obteniendo usuario: ' . $e->getMessage());
            return null;
        }
    }

    public function signOut(string $token): bool
    {
        try {
            $response = Http::withHeaders([
                'apikey' => $this->anonKey,
                'Authorization' => 'Bearer ' . $token,
            ])->post("{$this->url}/auth/v1/logout");

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Error en signOut: ' . $e->getMessage());
            return false;
        }
    }

    public function refreshToken(string $refreshToken): array
    {
        try {
            $response = Http::withHeaders([
                'apikey' => $this->anonKey,
                'Content-Type' => 'application/json',
            ])->post("{$this->url}/auth/v1/token?grant_type=refresh_token", [
                'refresh_token' => $refreshToken,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'access_token' => $data['access_token'] ?? null,
                    'refresh_token' => $data['refresh_token'] ?? $refreshToken,
                    'user' => $data['user'] ?? null,
                ];
            }

            return ['success' => false, 'access_token' => null, 'refresh_token' => null, 'user' => null];
        } catch (\Exception $e) {
            Log::error('Error en refreshToken: ' . $e->getMessage());
            return ['success' => false, 'access_token' => null, 'refresh_token' => null, 'user' => null];
        }
    }

    public function getGoogleOAuthUrl(string $redirectUrl): string
    {
        $redirectUri = urlencode($redirectUrl);
        $url = "{$this->url}/auth/v1/authorize?provider=google&redirect_to={$redirectUri}&response_type=code";
        return $url;
    }

    public function exchangeCodeForSession(string $code, string $redirectUrl): ?array
    {
        try {
            $response = Http::asForm()->withHeaders([
                'apikey' => $this->anonKey,
                'Content-Type' => 'application/x-www-form-urlencoded',
            ])->post("{$this->url}/auth/v1/token?grant_type=authorization_code", [
                'code' => $code,
                'redirect_to' => $redirectUrl,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data;
            }

            $errorBody = $response->body();
            Log::error('Error al intercambiar código', [
                'status' => $response->status(),
                'body' => $errorBody,
                'code' => $code,
                'redirect_url' => $redirectUrl
            ]);
            return null;
        } catch (\Exception $e) {
            Log::error('Error intercambiando código: ' . $e->getMessage(), [
                'code' => $code,
                'redirect_url' => $redirectUrl,
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    private function restUrl(string $table): string
    {
        return rtrim($this->url, '/') . '/rest/v1/' . $table;
    }

    private function restHeaders(): array
    {
        return [
            'apikey' => $this->serviceRoleKey,
            'Authorization' => 'Bearer ' . $this->serviceRoleKey,
            'Content-Type' => 'application/json',
        ];
    }

    public function insertTestResult(string $userId, array $data): ?array
    {
        try {
            if ($this->serviceRoleKey === '') {
                Log::error('Supabase service_role_key no configurada (SUPABASE_SERVICE_ROLE_KEY)');
                return null;
            }
            $body = [
                'user_id' => $userId,
                'test_id' => $data['test_id'],
                'test_title' => $data['test_title'],
                'score' => (int) $data['score'],
                'display_score' => (int) $data['display_score'],
                'display_max' => (int) $data['display_max'],
                'level' => $data['level'],
            ];
            $response = Http::withHeaders($this->restHeaders())
                ->withHeaders(['Prefer' => 'return=representation'])
                ->post($this->restUrl('test_results'), $body);

            if ($response->successful()) {
                $json = $response->json();
                return is_array($json) && isset($json[0]) ? $json[0] : $json;
            }
            Log::error('Supabase insertTestResult failed', ['status' => $response->status(), 'body' => $response->body()]);
            return null;
        } catch (\Exception $e) {
            Log::error('Supabase insertTestResult: ' . $e->getMessage());
            return null;
        }
    }

    public function getTestResults(string $userId): array
    {
        try {
            if ($this->serviceRoleKey === '') {
                Log::error('Supabase service_role_key no configurada (SUPABASE_SERVICE_ROLE_KEY)');
                return [];
            }
            $url = $this->restUrl('test_results') . '?user_id=eq.' . $userId . '&order=created_at.desc';
            $response = Http::withHeaders($this->restHeaders())->get($url);
            if ($response->successful()) {
                $list = $response->json();
                return is_array($list) ? $list : [];
            }
            return [];
        } catch (\Exception $e) {
            Log::error('Supabase getTestResults: ' . $e->getMessage());
            return [];
        }
    }

    public function insertDiaryEntry(string $userId, array $data): ?array
    {
        try {
            if ($this->serviceRoleKey === '') {
                Log::error('Supabase service_role_key no configurada (SUPABASE_SERVICE_ROLE_KEY)');
                return null;
            }
            $body = [
                'user_id' => $userId,
                'date' => $data['date'],
                'mood' => (int) $data['mood'],
                'emotions' => $data['emotions'] ?? [],
                'note' => $data['note'] ?? '',
            ];
            $response = Http::withHeaders($this->restHeaders())
                ->withHeaders(['Prefer' => 'return=representation'])
                ->post($this->restUrl('diary_entries'), $body);

            if ($response->successful()) {
                $json = $response->json();
                return is_array($json) && isset($json[0]) ? $json[0] : $json;
            }
            Log::error('Supabase insertDiaryEntry failed', ['status' => $response->status(), 'body' => $response->body()]);
            return null;
        } catch (\Exception $e) {
            Log::error('Supabase insertDiaryEntry: ' . $e->getMessage());
            return null;
        }
    }

    public function getDiaryEntries(string $userId): array
    {
        try {
            if ($this->serviceRoleKey === '') {
                Log::error('Supabase service_role_key no configurada (SUPABASE_SERVICE_ROLE_KEY)');
                return [];
            }
            $url = $this->restUrl('diary_entries') . '?user_id=eq.' . $userId . '&order=date.desc';
            $response = Http::withHeaders($this->restHeaders())->get($url);
            if ($response->successful()) {
                $list = $response->json();
                return is_array($list) ? $list : [];
            }
            return [];
        } catch (\Exception $e) {
            Log::error('Supabase getDiaryEntries: ' . $e->getMessage());
            return [];
        }
    }

    public function getProfile(string $userId): ?array
    {
        try {
            if ($this->serviceRoleKey === '') {
                Log::error('Supabase service_role_key no configurada (SUPABASE_SERVICE_ROLE_KEY)');
                return null;
            }
            $url = $this->restUrl('profiles') . '?user_id=eq.' . $userId . '&limit=1';
            $response = Http::withHeaders($this->restHeaders())->get($url);
            if ($response->successful()) {
                $list = $response->json();
                if (is_array($list) && isset($list[0])) {
                    return $list[0];
                }
                return null;
            }
            return null;
        } catch (\Exception $e) {
            Log::error('Supabase getProfile: ' . $e->getMessage());
            return null;
        }
    }

    public function upsertProfile(string $userId, array $data): ?array
    {
        try {
            if ($this->serviceRoleKey === '') {
                Log::error('Supabase service_role_key no configurada (SUPABASE_SERVICE_ROLE_KEY)');
                return null;
            }
            $existing = $this->getProfile($userId);
            $payload = array_merge([
                'nombre' => $data['nombre'] ?? '',
                'apellidos' => $data['apellidos'] ?? '',
                'telefono' => $data['telefono'] ?? '',
                'fecha_nacimiento' => $data['fecha_nacimiento'] ?? null,
            ], ['user_id' => $userId]);

            if ($existing === null) {
                $response = Http::withHeaders($this->restHeaders())
                    ->withHeaders(['Prefer' => 'return=representation'])
                    ->post($this->restUrl('profiles'), $payload);
            } else {
                $response = Http::withHeaders($this->restHeaders())
                    ->withHeaders(['Prefer' => 'return=representation'])
                    ->patch($this->restUrl('profiles') . '?user_id=eq.' . $userId, $payload);
            }

            if ($response->successful()) {
                $json = $response->json();
                return is_array($json) && isset($json[0]) ? $json[0] : $json;
            }
            Log::error('Supabase upsertProfile failed', ['status' => $response->status(), 'body' => $response->body()]);
            return null;
        } catch (\Exception $e) {
            Log::error('Supabase upsertProfile: ' . $e->getMessage());
            return null;
        }
    }
}

