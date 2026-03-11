<?php

use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config([
        'services.supabase.url' => 'https://fake.supabase.co',
        'services.supabase.anon_key' => 'test-key',
        'services.supabase.service_role_key' => 'test-service-key',
    ]);
});

test('GET diary-entries sin token devuelve 401', function () {
    $response = $this->getJson('/api/v1/area-personal/diary-entries');
    $response->assertStatus(401);
});

test('POST diary-entries sin token devuelve 401', function () {
    $response = $this->postJson('/api/v1/area-personal/diary-entries', [
        'date' => now()->format('Y-m-d'),
        'mood' => 7,
        'emotions' => ['Calma'],
        'note' => 'Nota',
    ]);
    $response->assertStatus(401);
});

test('GET diary-entries con token válido devuelve lista', function () {
    $userId = 'user-diario-1';
    Http::fake([
        '*/auth/v1/user' => Http::response([
            'id' => $userId,
            'email' => 'user@example.com',
            'user_metadata' => [],
        ], 200),
        '*/rest/v1/diary_entries*' => Http::response([], 200),
    ]);

    $response = $this->getJson('/api/v1/area-personal/diary-entries', [
        'Authorization' => 'Bearer fake-token',
    ]);

    $response->assertOk();
    $response->assertJsonPath('data', []);
});

test('POST diary-entries con token válido crea entrada y devuelve 201', function () {
    $userId = 'user-diario-2';
    Http::fake([
        '*/auth/v1/user' => Http::response([
            'id' => $userId,
            'email' => 'user@example.com',
            'user_metadata' => [],
        ], 200),
        '*/rest/v1/diary_entries*' => Http::response(
            [['id' => 'entry-1', 'created_at' => now()->toIso8601String()]],
            201
        ),
    ]);

    $response = $this->postJson('/api/v1/area-personal/diary-entries', [
        'date' => now()->format('Y-m-d'),
        'mood' => 8,
        'emotions' => ['Alegría', 'Calma'],
        'note' => 'Día bueno.',
    ], [
        'Authorization' => 'Bearer fake-token',
    ]);

    $response->assertStatus(201);
    $response->assertJsonStructure(['id', 'createdAt']);
});

test('POST diary-entries sin date devuelve 422', function () {
    Http::fake([
        '*/auth/v1/user' => Http::response(['id' => 'u1', 'email' => 'a@b.com', 'user_metadata' => []], 200),
    ]);

    $response = $this->postJson('/api/v1/area-personal/diary-entries', [
        'mood' => 5,
    ], [
        'Authorization' => 'Bearer fake-token',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['date']);
});
