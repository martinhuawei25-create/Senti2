<?php

test('la aplicación responde en la ruta raíz', function () {
    $response = $this->get('/');
    $response->assertStatus(200);
});

test('el API de contacto valida campos requeridos', function () {
    $response = $this->postJson('/api/v1/contact', []);
    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['nombre', 'apellidos', 'email', 'mensaje']);
});

test('auth signin con body vacío devuelve 422', function () {
    $response = $this->postJson('/api/v1/auth/signin', []);
    $response->assertStatus(422);
});
