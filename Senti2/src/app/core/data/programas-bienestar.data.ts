export interface SemanaPrograma {
  week: number;
  title: string;
  objectives: string[];
  activities: string[];
}

export interface ProgramaBienestar {
  id: string;
  title: string;
  duration: string;
  description: string;
  evidence?: string;
  weeks: SemanaPrograma[];
}

export const PROGRAMAS_BIENESTAR: ProgramaBienestar[] = [
  {
    id: 'estres',
    title: 'Manejo del estrés',
    duration: '6 semanas',
    description: 'Aprende técnicas de relajación, priorización y gestión del tiempo para reducir el estrés en tu día a día. Basado en TCC y entrenamiento en afrontamiento.',
    evidence: 'Programas con relajación, reestructuración cognitiva y manejo del tiempo muestran mejoras en ansiedad y cortisol (literatura en atención primaria y laboral).',
    weeks: [
      { week: 1, title: 'Qué es el estrés y cómo me afecta', objectives: ['Identificar tus fuentes de estrés', 'Reconocer señales físicas y emocionales'], activities: ['Registro diario de situaciones estresantes y nivel (1–10)', 'Lectura breve: estrés y salud'] },
      { week: 2, title: 'Respiración y relajación', objectives: ['Aprender respiración diafragmática', 'Practicar 5–10 min al día'], activities: ['Audio o guía de respiración (ver Recursos Educativos)', 'Registro de práctica'] },
      { week: 3, title: 'Priorización y tiempo', objectives: ['Diferenciar urgente e importante', 'Planificar la semana'], activities: ['Lista de tareas y clasificación', 'Bloques de tiempo para lo importante'] },
      { week: 4, title: 'Pensamientos y reestructuración', objectives: ['Detectar pensamientos que aumentan el estrés', 'Cuestionar alternativas más realistas'], activities: ['Registro de pensamiento–emoción–conducta', 'Ejercicio de reestructuración'] },
      { week: 5, title: 'Límites y comunicación', objectives: ['Decir no cuando sea necesario', 'Pedir ayuda'], activities: ['Identificar situaciones donde cuesta poner límites', 'Frases asertivas (ver artículo Comunicación asertiva)'] },
      { week: 6, title: 'Mantenimiento', objectives: ['Integrar lo que te ha funcionado', 'Prevenir recaídas'], activities: ['Plan semanal de prácticas', 'Revisión del programa y siguientes pasos'] }
    ]
  },
  {
    id: 'sueño',
    title: 'Sueño y descanso',
    duration: '4 semanas',
    description: 'Mejora la higiene del sueño y establece rutinas que te ayuden a dormir mejor y a tener más energía. Basado en recomendaciones de higiene del sueño y TCC-I.',
    evidence: 'Higiene del sueño y TCC-I tienen evidencia en insomnio y mejoras en estado de ánimo.',
    weeks: [
      { week: 1, title: 'Conocer tu sueño', objectives: ['Registro de horarios y calidad', 'Identificar factores que lo alteran'], activities: ['Diario de sueño: hora acostarte/levantarte, despertares, sensación al despertar', 'Evitar cafeína después de mediodía'] },
      { week: 2, title: 'Rutina y ambiente', objectives: ['Horario regular de acostarte y levantarte', 'Ambiente oscuro, fresco y silencioso'], activities: ['Misma hora de despertar cada día', 'Reducir pantallas 1–2 h antes de dormir'] },
      { week: 3, title: 'Relación cama–sueño', objectives: ['Usar la cama solo para dormir', 'Salir de la cama si no duermes'], activities: ['No trabajar ni ver series en la cama', 'Si no concilias en 20 min, levantarte y hacer algo tranquilo'] },
      { week: 4, title: 'Consolidación', objectives: ['Mantener los cambios', 'Ajustar si es necesario'], activities: ['Revisar diario de sueño', 'Plan de mantenimiento a largo plazo'] }
    ]
  },
  {
    id: 'regulacion',
    title: 'Regulación emocional',
    duration: '8 semanas',
    description: 'Trabaja la identificación de emociones, la tolerancia al malestar y las estrategias de afrontamiento. Inspirado en componentes de TCC y DBT (dialéctica).',
    evidence: 'TCC y entrenamiento en regulación emocional tienen evidencia en depresión y ansiedad.',
    weeks: [
      { week: 1, title: 'Identificar emociones', objectives: ['Reconocer emociones básicas', 'Conectar emoción–pensamiento–conducta'], activities: ['Diario emocional (ver sección Diario)', 'Etiquetar emociones varias veces al día'] },
      { week: 2, title: 'Validación y aceptación', objectives: ['Validar tus emociones sin juzgarlas', 'Reducir la lucha contra lo que sientes'], activities: ['Frases de validación ("Es normal sentir…")', 'Práctica de no rechazar la emoción'] },
      { week: 3, title: 'Tolerancia al malestar', objectives: ['No actuar por impulso', 'Técnicas de anclaje'], activities: ['Respiración y anclaje sensorial (5 sentidos)', 'Retrasar la conducta impulsiva 10 min'] },
      { week: 4, title: 'Pensamientos y emociones', objectives: ['Ver la relación pensamiento–emoción', 'Cuestionar pensamientos extremos'], activities: ['Registro de pensamientos automáticos', 'Alternativas más equilibradas'] },
      { week: 5, title: 'Actividades que ayudan', objectives: ['Aumentar actividades placenteras y con sentido', 'Activación conductual'], activities: ['Lista de actividades y programación semanal', 'Una actividad agradable al día'] },
      { week: 6, title: 'Comunicación y relaciones', objectives: ['Expresar necesidades de forma asertiva', 'Pedir apoyo'], activities: ['Revisar artículo Comunicación asertiva', 'Practicar una petición o límite'] },
      { week: 7, title: 'Prevención de recaídas', objectives: ['Señales de alarma', 'Plan de acción'], activities: ['Lista de señales tempranas', 'Pasos concretos si empeoras'] },
      { week: 8, title: 'Cierre y mantenimiento', objectives: ['Resumir lo aprendido', 'Plan de práctica continua'], activities: ['Resumen por escrito de herramientas', 'Compromiso de práctica semanal'] }
    ]
  }
];
