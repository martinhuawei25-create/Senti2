<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    protected SupabaseService $supabaseService;

    public function __construct(SupabaseService $supabaseService)
    {
        $this->supabaseService = $supabaseService;
    }

    public function signUp(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        $result = $this->supabaseService->signUp(
            $validated['email'],
            $validated['password']
        );

        if (!$result['success']) {
            return response()->json([
                'error' => $result['error']['message'] ?? 'Error al registrar usuario'
            ], 400);
        }

        $user = $result['data']['user'] ?? null;
        if ($user) {
            $this->ensureProfile($user['id']);
        }

        return response()->json([
            'message' => 'Registro exitoso. Revisa tu correo para confirmar tu cuenta.',
            'user' => $user,
        ]);
    }

    public function signIn(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $result = $this->supabaseService->signIn(
            $validated['email'],
            $validated['password']
        );

        if (!$result['success']) {
            return response()->json([
                'error' => $result['error']['message'] ?? 'Credenciales inválidas'
            ], 401);
        }

        $data = $result['data'];
        $user = $this->supabaseService->getUser($data['access_token']);

        if ($user) {
            $this->ensureProfile($user['id']);
        }

        return response()->json([
            'access_token' => $data['access_token'],
            'refresh_token' => $data['refresh_token'] ?? null,
            'user' => $user,
        ]);
    }

    public function refresh(Request $request)
    {
        $refreshToken = $request->input('refresh_token');
        if (!$refreshToken) {
            return response()->json(['error' => 'refresh_token requerido'], 400);
        }

        $result = $this->supabaseService->refreshToken($refreshToken);
        if (!$result['success'] || !$result['access_token']) {
            return response()->json(['error' => 'Token de refresco inválido o expirado'], 401);
        }

        $user = $result['user'] ?? $this->supabaseService->getUser($result['access_token']);
        return response()->json([
            'access_token' => $result['access_token'],
            'refresh_token' => $result['refresh_token'],
            'user' => $user,
        ]);
    }

    public function signOut(Request $request)
    {
        $token = $request->bearerToken();
        
        if (!$token) {
            return response()->json(['error' => 'Token no proporcionado'], 401);
        }

        $this->supabaseService->signOut($token);

        return response()->json(['message' => 'Sesión cerrada correctamente']);
    }

    public function getCurrentUser(Request $request)
    {
        $token = $request->bearerToken();
        
        if (!$token) {
            return response()->json(['error' => 'Token no proporcionado'], 401);
        }

        $user = $this->supabaseService->getUser($token);

        if (!$user) {
            return response()->json(['error' => 'Token inválido'], 401);
        }

        return response()->json(['user' => $user]);
    }

    public function getGoogleOAuthUrl(Request $request)
    {
        if (!$this->supabaseService->isConfigured()) {
            return response()->json([
                'error' => 'OAuth no configurado. Comprueba SUPABASE_URL y SUPABASE_KEY en el servidor.',
            ], 503);
        }

        // Supabase envía los tokens en el hash (#) al frontend, no un "code" al backend.
        // El redirect_to debe ser la URL del frontend para que el navegador reciba el hash.
        $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:4200'), '/');
        $redirectUrl = $request->input('redirect_to', $frontendUrl . '/auth/callback');
        $url = $this->supabaseService->getGoogleOAuthUrl($redirectUrl);

        return response()->json(['url' => $url]);
    }

    public function googleCallback(Request $request)
    {
        Log::info('Callback de Google OAuth recibido', [
            'query_params' => $request->all(),
            'has_code' => $request->has('code'),
            'has_error' => $request->has('error')
        ]);

        $code = $request->input('code');
        $error = $request->input('error');
        $errorDescription = $request->input('error_description');
        
        if ($error) {
            Log::error('Error en OAuth de Google', [
                'error' => $error,
                'description' => $errorDescription
            ]);
            $frontendUrl = config('app.frontend_url', 'http://localhost:4200');
            return redirect("{$frontendUrl}/login?error=" . urlencode($errorDescription ?? $error));
        }

        if (!$code) {
            Log::error('No se recibió código de autorización en el callback', [
                'all_params' => $request->all()
            ]);
            $frontendUrl = config('app.frontend_url', 'http://localhost:4200');
            return redirect("{$frontendUrl}/login?error=" . urlencode('No se recibió código de autorización'));
        }

        $redirectUrl = url('/api/v1/auth/google/callback');
        Log::info('Intercambiando código por sesión', [
            'code' => substr($code, 0, 20) . '...',
            'redirect_url' => $redirectUrl
        ]);

        $session = $this->supabaseService->exchangeCodeForSession($code, $redirectUrl);

        if (!$session || !isset($session['access_token'])) {
            Log::error('Error al intercambiar código por sesión', [
                'response' => $session,
                'has_response' => $session !== null
            ]);
            $frontendUrl = config('app.frontend_url', 'http://localhost:4200');
            return redirect("{$frontendUrl}/login?error=" . urlencode('Error al autenticar con Google. Verifica los logs del servidor.'));
        }

        Log::info('Sesión obtenida exitosamente', [
            'has_access_token' => isset($session['access_token']),
            'has_refresh_token' => isset($session['refresh_token'])
        ]);

        $user = $this->supabaseService->getUser($session['access_token']);

        if ($user) {
            $this->ensureProfile($user['id']);
            Log::info('Perfil de usuario asegurado', ['user_id' => $user['id']]);
        }

        $frontendUrl = config('app.frontend_url', 'http://localhost:4200');
        $refreshToken = $session['refresh_token'] ?? '';
        
        return redirect("{$frontendUrl}/auth/callback?token={$session['access_token']}&refresh_token={$refreshToken}");
    }

    public function verifyToken(Request $request)
    {
        $token = $request->bearerToken();
        
        if (!$token) {
            return response()->json(['error' => 'Token no proporcionado'], 401);
        }

        $user = $this->supabaseService->getUser($token);

        if (!$user) {
            return response()->json(['error' => 'Token inválido'], 401);
        }

        return response()->json([
            'user' => $user,
            'authenticated' => true
        ]);
    }

    private function ensureProfile(string $userId): void
    {
        if ($this->supabaseService->getProfile($userId) === null) {
            $this->supabaseService->upsertProfile($userId, [
                'nombre' => '',
                'apellidos' => '',
                'telefono' => '',
                'fecha_nacimiento' => null,
            ]);
        }
    }
}
