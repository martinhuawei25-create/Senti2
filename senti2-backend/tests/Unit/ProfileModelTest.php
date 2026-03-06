<?php

use App\Models\Profile;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('tiene los atributos fillable esperados', function () {
    $profile = new Profile;
    $fillable = $profile->getFillable();
    expect($fillable)->toContain('user_id', 'nombre', 'apellidos', 'telefono', 'fecha_nacimiento');
    expect($fillable)->toHaveCount(5);
});

test('fecha_nacimiento se castea a date', function () {
    $profile = new Profile;
    $profile->user_id = 'user-1';
    $profile->fecha_nacimiento = '1990-05-15';
    $profile->save();

    $loaded = Profile::find($profile->id);
    expect($loaded->fecha_nacimiento)->toBeInstanceOf(\Carbon\Carbon::class);
    expect($loaded->fecha_nacimiento->format('Y-m-d'))->toBe('1990-05-15');
});

test('se puede crear y recuperar un perfil con todos los campos', function () {
    $profile = Profile::create([
        'user_id' => 'user-uuid-123',
        'nombre' => 'María',
        'apellidos' => 'García López',
        'telefono' => '612345678',
        'fecha_nacimiento' => '1985-03-20',
    ]);

    expect($profile->id)->not->toBeNull();
    expect($profile->nombre)->toBe('María');
    expect($profile->apellidos)->toBe('García López');
    expect($profile->telefono)->toBe('612345678');
    expect($profile->fecha_nacimiento->format('Y-m-d'))->toBe('1985-03-20');
});
