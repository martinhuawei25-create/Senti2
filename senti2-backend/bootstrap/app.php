<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        $middleware->alias([
            'verify.supabase' => \App\Http\Middleware\VerifySupabaseToken::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $e, Request $request): ?Response {
            if (!$request->is('api/*')) {
                return null;
            }
            $allowedOrigins = array_values(array_filter(
                config('cors.allowed_origins', ['http://localhost:4200'])
            ));
            $origin = $request->header('Origin');
            $allowOrigin = in_array($origin, $allowedOrigins) ? $origin : ($allowedOrigins[0] ?? '*');
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $e->errors(),
                ], 422)
                    ->withHeaders(['Access-Control-Allow-Origin' => $allowOrigin]);
            }
            $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
            $message = config('app.debug') ? $e->getMessage() : 'Error interno del servidor';
            return response()->json(['message' => $message, 'error' => $message], $status)
                ->withHeaders([
                    'Access-Control-Allow-Origin' => $allowOrigin,
                    'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers' => 'Content-Type, Authorization, Accept, X-Requested-With',
                    'Access-Control-Allow-Credentials' => 'true',
                ]);
        });
    })->create();
