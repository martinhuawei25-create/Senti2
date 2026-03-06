<?php

use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config([
        'services.supabase.url' => 'https://fake.supabase.co',
        'services.supabase.anon_key' => 'test-key',
        'services.supabase.service_role_key' => 'test-service-key',
    ]);
});

test('signin sin email devuelve 422', function () {
    $response = $this->postJson('/api/v1/auth/signin', [
        'password' => 'password123',
    ]);
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['email']);
});

test('signin sin password devuelve 422', function () {
    $response = $this->postJson('/api/v1/auth/signin', [
        'email' => 'user@example.com',
    ]);
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['password']);
});

test('signin con credenciales inválidas devuelve 401', function () {
    Http::fake([
        '*/auth/v1/token*' => Http::response(['error' => 'Invalid login credentials'], 401),
    ]);

    $response = $this->postJson('/api/v1/auth/signin', [
        'email' => 'user@example.com',
        'password' => 'wrong',
    ]);

    $response->assertStatus(401);
    $response->assertJsonPath('error', 'Credenciales inválidas');
});

test('signin correcto devuelve access_token y user', function () {
    $fakeUser = ['id' => 'user-uuid-123', 'email' => 'user@example.com', 'user_metadata' => []];
    Http::fake([
        '*/auth/v1/token*' => Http::response([
            'access_token' => 'fake-access-token',
            'refresh_token' => 'fake-refresh-token',
        ], 200),
        '*/auth/v1/user' => Http::response($fakeUser, 200),
    ]);

    $response = $this->postJson('/api/v1/auth/signin', [
        'email' => 'user@example.com',
        'password' => 'validpassword',
    ]);

    $response->assertOk();
    $response->assertJsonPath('access_token', 'fake-access-token');
    $response->assertJsonPath('user.id', 'user-uuid-123');
    $response->assertJsonPath('user.email', 'user@example.com');
});

test('signup sin email devuelve 422', function () {
    $response = $this->postJson('/api/v1/auth/signup', [
        'password' => 'password123',
    ]);
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['email']);
});

test('signup con password menor a 6 caracteres devuelve 422', function () {
    $response = $this->postJson('/api/v1/auth/signup', [
        'email' => 'new@example.com',
        'password' => '12345',
    ]);
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['password']);
});

test('refresh sin refresh_token devuelve 400', function () {
    $response = $this->postJson('/api/v1/auth/refresh', []);
    $response->assertStatus(400);
    $response->assertJsonPath('error', 'refresh_token requerido');
});

test('refresh con token inválido devuelve 401', function () {
    Http::fake([
        '*/auth/v1/token*' => Http::response(['error' => 'invalid_grant'], 400),
    ]);

    $response = $this->postJson('/api/v1/auth/refresh', [
        'refresh_token' => 'invalid-refresh',
    ]);

    $response->assertStatus(401);
});

test('ruta protegida sin token devuelve 401', function () {
    $response = $this->getJson('/api/v1/auth/user');
    $response->assertStatus(401);
    $response->assertJsonPath('error', 'Token no proporcionado');
});

test('ruta protegida con token inválido devuelve 401', function () {
    Http::fake([
        '*/auth/v1/user' => Http::response([], 401),
    ]);

    $response = $this->getJson('/api/v1/auth/user', [
        'Authorization' => 'Bearer invalid-token',
    ]);

    $response->assertStatus(401);
});
