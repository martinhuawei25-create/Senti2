<?php

use Illuminate\Support\Facades\Mail;

test('contacto sin nombre devuelve 422', function () {
    $response = $this->postJson('/api/v1/contact', [
        'apellidos' => 'Apellido',
        'email' => 'test@example.com',
        'mensaje' => 'Mensaje de prueba',
    ]);
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['nombre']);
});

test('contacto con email inválido devuelve 422', function () {
    $response = $this->postJson('/api/v1/contact', [
        'nombre' => 'Nombre',
        'apellidos' => 'Apellido',
        'email' => 'no-es-email',
        'mensaje' => 'Mensaje',
    ]);
    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['email']);
});

test('contacto con todos los campos válidos envía correo y devuelve 200', function () {
    Mail::fake();

    $response = $this->postJson('/api/v1/contact', [
        'nombre' => 'Nombre',
        'apellidos' => 'Apellidos',
        'email' => 'contacto@example.com',
        'mensaje' => 'Mensaje de contacto para Senti2.',
    ]);

    $response->assertOk();
    $response->assertJsonPath('message', 'Mensaje enviado correctamente. Te responderemos lo antes posible.');
    Mail::assertSent(\App\Mail\ContactFormMail::class);
});
