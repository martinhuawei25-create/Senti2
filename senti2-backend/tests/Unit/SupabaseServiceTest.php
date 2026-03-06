<?php

use App\Services\SupabaseService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Config::set('services.supabase.url', 'https://test.supabase.co');
    Config::set('services.supabase.anon_key', 'anon-key-123');
    Config::set('services.supabase.service_role_key', 'service-role-456');
});

test('isConfigured devuelve false cuando falta url', function () {
    Config::set('services.supabase.url', '');
    $service = new SupabaseService;
    expect($service->isConfigured())->toBeFalse();
});

test('isConfigured devuelve false cuando falta anon_key', function () {
    Config::set('services.supabase.anon_key', '');
    Config::set('services.supabase.key', null);
    $service = new SupabaseService;
    expect($service->isConfigured())->toBeFalse();
});

test('isConfigured devuelve true cuando url y anon_key están configurados', function () {
    $service = new SupabaseService;
    expect($service->isConfigured())->toBeTrue();
});

test('getGoogleOAuthUrl devuelve la URL de autorización con redirect codificado', function () {
    $service = new SupabaseService;
    $redirect = 'https://app.test/auth/callback';
    $url = $service->getGoogleOAuthUrl($redirect);
    expect($url)
        ->toContain('https://test.supabase.co/auth/v1/authorize')
        ->toContain('provider=google')
        ->toContain('redirect_to=')
        ->toContain('response_type=code');
    expect(rawurldecode($url))->toContain($redirect);
});

test('getProfile devuelve null cuando no hay perfil', function () {
    Http::fake(['*/rest/v1/profiles*' => Http::response([], 200)]);
    $service = new SupabaseService;
    expect($service->getProfile('user-123'))->toBeNull();
});

test('getProfile devuelve el perfil cuando existe', function () {
    $profile = ['id' => 'u1', 'user_id' => 'user-123', 'nombre' => 'Ana', 'apellidos' => 'Lopez', 'telefono' => '612000000', 'fecha_nacimiento' => '1990-01-15'];
    Http::fake(['*/rest/v1/profiles*' => Http::response([$profile], 200)]);
    $service = new SupabaseService;
    expect($service->getProfile('user-123'))->toBe($profile);
});

test('upsertProfile actualiza cuando ya existe perfil', function () {
    $updated = ['id' => 'u1', 'user_id' => 'user-789', 'nombre' => 'Maria', 'apellidos' => 'Garcia', 'telefono' => '699111222', 'fecha_nacimiento' => '1985-05-20'];
    Http::fake(['*/rest/v1/profiles*' => Http::response([$updated], 200)]);
    $service = new SupabaseService;
    $result = $service->upsertProfile('user-789', ['nombre' => 'Maria', 'apellidos' => 'Garcia', 'telefono' => '699111222', 'fecha_nacimiento' => '1985-05-20']);
    expect($result)->toBe($updated);
});
