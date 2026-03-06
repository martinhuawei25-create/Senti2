<?php

use App\Http\Middleware\VerifySupabaseToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Config::set('services.supabase.url', 'https://test.supabase.co');
    Config::set('services.supabase.anon_key', 'test-anon-key');
});

test('devuelve 401 cuando no hay Bearer token', function () {
    $request = Request::create('/api/test', 'GET');
    $middleware = new VerifySupabaseToken;
    $next = fn ($req) => response()->json(['ok' => true]);

    $response = $middleware->handle($request, $next);

    expect($response->getStatusCode())->toBe(401);
    expect($response->getData(true))->toHaveKey('error', 'Token no proporcionado');
});

test('devuelve 401 cuando Supabase rechaza el token', function () {
    Http::fake([
        '*/auth/v1/user' => Http::response([], 401),
    ]);
    $request = Request::create('/api/test', 'GET');
    $request->headers->set('Authorization', 'Bearer token-invalido');
    $middleware = new VerifySupabaseToken;
    $next = fn ($req) => response()->json(['ok' => true]);

    $response = $middleware->handle($request, $next);

    expect($response->getStatusCode())->toBe(401);
    expect($response->getData(true))->toHaveKey('error', 'Token inválido');
});

test('adjunta supabase_user y llama next cuando el token es válido', function () {
    $user = ['id' => 'user-uuid', 'email' => 'test@example.com'];
    Http::fake([
        '*/auth/v1/user' => Http::response($user),
    ]);
    $request = Request::create('/api/test', 'GET');
    $request->headers->set('Authorization', 'Bearer token-valido');
    $middleware = new VerifySupabaseToken;
    $next = fn ($req) => response()->json(['ok' => true, 'user' => $req->get('supabase_user')]);

    $response = $middleware->handle($request, $next);

    expect($response->getStatusCode())->toBe(200);
    $data = $response->getData(true);
    expect($data)->toHaveKey('ok', true);
    expect($data['user'])->toBe($user);
});
