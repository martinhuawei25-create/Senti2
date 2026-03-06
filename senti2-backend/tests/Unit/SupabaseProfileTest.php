<?php

use App\Services\SupabaseService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Config::set('services.supabase.url', 'https://test.supabase.co');
    Config::set('services.supabase.anon_key', 'anon-key-123');
    Config::set('services.supabase.service_role_key', 'service-role-456');
});

test('getProfile devuelve null cuando no hay perfil', function () {
    Http::fake(['*/rest/v1/profiles*' => Http::response([], 200)]);
    $service = new SupabaseService;
    expect($service->getProfile('user-123'))->toBeNull();
});

test('getProfile devuelve el perfil cuando existe', function () {
    $profile = ['id' => 'uuid-1', 'user_id' => 'user-123', 'nombre' => 'Ana', 'apellidos' => 'Lopez', 'telefono' => '612000000', 'fecha_nacimiento' => '1990-01-15'];
    Http::fake(['*/rest/v1/profiles*' => Http::response([$profile], 200)]);
    $service = new SupabaseService;
    expect($service->getProfile('user-123'))->toBe($profile);
});

test('upsertProfile actualiza cuando ya existe perfil', function () {
    $updated = ['id' => 'uuid-1', 'user_id' => 'user-789', 'nombre' => 'Maria', 'apellidos' => 'Garcia', 'telefono' => '699111222', 'fecha_nacimiento' => '1985-05-20'];
    Http::fake(['*/rest/v1/profiles*' => Http::response([$updated], 200)]);
    $service = new SupabaseService;
    $result = $service->upsertProfile('user-789', ['nombre' => 'Maria', 'apellidos' => 'Garcia', 'telefono' => '699111222', 'fecha_nacimiento' => '1985-05-20']);
    expect($result)->toBe($updated);
});
