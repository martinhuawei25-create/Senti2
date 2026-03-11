<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class VerifySupabaseToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Token no proporcionado'], 401);
        }

        $supabaseUrl = config('services.supabase.url');
        $supabaseKey = config('services.supabase.anon_key') ?? config('services.supabase.key');

        try {
            $response = Http::withHeaders([
                'apikey' => $supabaseKey,
                'Authorization' => 'Bearer ' . $token,
            ])->get("{$supabaseUrl}/auth/v1/user");

            if (!$response->successful()) {
                return response()->json(['error' => 'Token inválido'], 401);
            }

            $user = $response->json();
            $request->merge(['supabase_user' => $user]);

            return $next($request);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al verificar token'], 500);
        }
    }
}
