<?php

test('flujo completo: inicio, secciones, servicios, login, diario, guardar, estadísticas, perfil y editar', function () {
    $base = rtrim(env('FRONTEND_URL', 'http://localhost:4200'), '/');
    if (@file_get_contents($base.'/', false, stream_context_create(['http' => ['timeout' => 3]])) === false) {
        $this->markTestSkipped("Frontend no responde en {$base}. Ejecutar: pest tests/Browser/UserFlowTest.php --headed");
    }

    $zoom = '0.75';
    $viewport = [
        'viewport' => ['width' => (int) (1280), 'height' => (int) (800)],
        'deviceScaleFactor' => 1,
        'initScript' => "(function(){var z='{$zoom}';if(document.documentElement)document.documentElement.style.zoom=z;if(document.body)document.body.style.zoom=z;document.addEventListener('DOMContentLoaded',function(){var b=document.body;if(b)b.style.zoom=z;});})();",
    ];

    $page = visit($base.'/inicio', $viewport)
        ->wait(2)
        ->assertSee('BIENESTAR EMOCIONAL')
        ->assertSee('¿Qué te ofrecemos?')
        ->assertSee('Tests Emocionales')
        ->assertSee('Chat de Apoyo')
        ->assertSee('Recursos Educativos')
        ->assertSee('Saber Más');

    $page->click('Saber Más');
    $page->wait(2);
    $page->assertSee('En Senti2 ofrecemos');
    $page->assertSee('Diario Emocional');

    $page->click('Diario Emocional');
    $page->wait(1);
    $page->assertSee('Iniciar Sesión');

    $page->fill('email', env('E2E_TEST_EMAIL', 'e2e@senti2.test'))
        ->fill('password', env('E2E_TEST_PASSWORD', 'password'))
        ->click('Iniciar sesión');
    $page->wait(1);
    $page->assertSee('Diario Emocional');
    $page->assertSee('Registro de hoy');

    $page->fill('mood-scale', '7');
    $page->check('Calma');
    $page->fill('note', 'Entrada de prueba E2E.');
    $page->click('Guardar entrada');
    $page->wait(1);
    $page->assertSee('Entrada guardada');

    $page->click('← Volver a Área Personal');
    $page->wait(1);
    $page->click('Estadísticas y Seguimiento');
    $page->wait(1);
    $page->assertSee('Estadísticas');
    $page->assertSee('Tu evolución emocional');

    $page->click('.profile-link');
    $page->wait(1);
    $page->assertSee('Editar Perfil');
    $page->click('Editar Perfil');
    $page->wait(1);
    $page->assertSee('Editar Información Personal');
    $page->assertSee('Teléfono');
    $page->fill('telefono', '600123456');
    $page->click('Guardar Cambios');
    $page->wait(1);
    $page->assertSee('Éxito');
    $page->assertSee('Perfil actualizado correctamente');
    $page->assertSee('600123456');
});
