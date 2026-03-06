<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SupabaseService;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(
        private SupabaseService $supabase
    ) {}

    public function show(Request $request)
    {
        $user = $request->get('supabase_user');
        $userId = $user['id'] ?? null;

        if (!$userId) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        $profile = $this->supabase->getProfile($userId);
        if (!$profile) {
            $profile = $this->supabase->upsertProfile($userId, [
                'nombre' => '',
                'apellidos' => '',
                'telefono' => '',
                'fecha_nacimiento' => null,
            ]);
        }

        return response()->json($profile ?? []);
    }

    public function update(Request $request)
    {
        $user = $request->get('supabase_user');
        $userId = $user['id'] ?? null;

        if (!$userId) {
            return response()->json(['error' => 'Usuario no autenticado'], 401);
        }

        $validated = $request->validate([
            'nombre' => 'nullable|string|max:255',
            'apellidos' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'fecha_nacimiento' => 'nullable|date',
        ]);

        $profile = $this->supabase->upsertProfile($userId, $validated);
        if (!$profile) {
            return response()->json(['error' => 'Error al actualizar perfil'], 500);
        }

        return response()->json($profile);
    }
}
