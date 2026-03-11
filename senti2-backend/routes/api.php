<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AreaPersonalController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ProfileController;

Route::prefix('v1')->group(function () {
    Route::post('/contact', [ContactController::class, 'store']);

    Route::post('/auth/signup', [AuthController::class, 'signUp']);
    Route::post('/auth/signin', [AuthController::class, 'signIn']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::post('/auth/verify', [AuthController::class, 'verifyToken']);
    Route::get('/auth/google/url', [AuthController::class, 'getGoogleOAuthUrl']);
    Route::get('/auth/google/callback', [AuthController::class, 'googleCallback']);
    
    Route::middleware('verify.supabase')->group(function () {
        Route::post('/auth/signout', [AuthController::class, 'signOut']);
        Route::get('/auth/user', [AuthController::class, 'getCurrentUser']);
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::patch('/profile', [ProfileController::class, 'update']);

        Route::post('/area-personal/test-results', [AreaPersonalController::class, 'storeTestResult']);
        Route::get('/area-personal/test-results', [AreaPersonalController::class, 'getTestResults']);
        Route::post('/area-personal/diary-entries', [AreaPersonalController::class, 'storeDiaryEntry']);
        Route::get('/area-personal/diary-entries', [AreaPersonalController::class, 'getDiaryEntries']);
    });
});

