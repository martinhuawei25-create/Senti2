export interface TestQuestion {
  id: string;
  text: string;
}

export interface EmotionalTool {
  title: string;
  description: string;
  evidence?: string;
}

export interface InterpretationResult {
  level: string;
  message: string;
  tools: EmotionalTool[];
}

export interface TestDefinition {
  id: string;
  title: string;
  description: string;
  instruction: string;
  duration: string;
  questions: TestQuestion[];
  scaleMin: number;
  scaleMax: number;
  scaleLabels: string[];
  scoreDisplay?: 'raw' | 'percentage';
  getInterpretation: (score: number) => InterpretationResult;
}

const ESCALA_ANSIEDAD = ['Nada', 'Varios días', 'Más de la mitad de los días', 'Casi todos los días'];

export const TESTS_EMOCIONALES: Record<string, TestDefinition> = {
  'ansiedad-estres': {
    id: 'ansiedad-estres',
    title: 'Evaluación de ansiedad y estrés',
    description: 'Cuestionario breve para valorar niveles de ansiedad y estrés (basado en GAD-7).',
    instruction: 'Indica con qué frecuencia te has sentido así durante las últimas 2 semanas.',
    duration: '~5 min',
    scaleMin: 0,
    scaleMax: 3,
    scaleLabels: ESCALA_ANSIEDAD,
    questions: [
      { id: 'q1', text: 'Sentirse nervioso/a o muy ansioso/a' },
      { id: 'q2', text: 'No poder dejar de preocuparse o controlar la preocupación' },
      { id: 'q3', text: 'Preocuparse demasiado por diferentes cosas' },
      { id: 'q4', text: 'Dificultad para relajarse' },
      { id: 'q5', text: 'Estar tan inquieto/a que cuesta quedarse sentado/a' },
      { id: 'q6', text: 'Enfadarse o irritarse con facilidad' },
      { id: 'q7', text: 'Sentir miedo como si pudiera pasar algo malo' },
    ],
    getInterpretation(score: number): InterpretationResult {
      const toolsLeve: EmotionalTool[] = [
        { title: 'Respiración diafragmática', description: 'Practica respiración lenta y profunda (abdomen): 4 s inspirar, 6 s espirar, 5–10 min al día. Ayuda a reducir la activación del estrés.', evidence: 'TCC para ansiedad; estudios de actividad autonómica.' },
        { title: 'Actividad física regular', description: 'Objetivo: 150–300 min/semana de actividad moderada (caminar, bici, nadar). La OMS asocia ejercicio con menor ansiedad y mejor sueño.', evidence: 'OMS; revisión Cochrane.' },
        { title: 'Higiene del sueño', description: 'Horario de sueño regular, evitar cafeína y alcohol antes de dormir, reducir pantallas. El sueño estable mejora la regulación emocional.', evidence: 'Revisión empírica higiene del sueño y salud mental.' },
        { title: 'Exposición gradual', description: 'Si evitas situaciones por miedo, planifica acercarte poco a poco (no de golpe). Reducir la evitación suele bajar la ansiedad a medio plazo.', evidence: 'NICE CG113; TCC.' },
      ];
      const toolsModerada: EmotionalTool[] = [
        ...toolsLeve,
        { title: 'Autoayuda guiada o TCC', description: 'La guía NICE recomienda autoayuda basada en TCC o relajación aplicada cuando la ansiedad persiste. Un profesional puede indicarte recursos o derivar.', evidence: 'NICE CG113 (paso 2).' },
        { title: 'Consulta profesional', description: 'Valorar con tu médico o psicólogo. El cribado con GAD-7 no sustituye el diagnóstico; un profesional puede ofrecer tratamiento con evidencia.', evidence: 'NICE; validación GAD-7 en atención primaria.' },
      ];
      if (score <= 4) return { level: 'Mínima', message: 'Tu nivel de ansiedad parece bajo. Si en algún momento notas más estrés o preocupación, puedes repetir el test.', tools: toolsLeve };
      if (score <= 9) return { level: 'Leve', message: 'Puedes estar experimentando algo de ansiedad. Las herramientas siguientes tienen apoyo en guías y pueden ayudarte.', tools: toolsLeve };
      if (score <= 14) return { level: 'Moderada', message: 'La ansiedad puede estar afectando tu día a día. Además de las estrategias de abajo, conviene valorar consulta con un profesional.', tools: toolsModerada };
      return { level: 'Severa', message: 'Es recomendable que consultes con un profesional de salud mental. Las herramientas de abajo son complementos, no sustituyen el tratamiento.', tools: toolsModerada };
    },
  },

  'depresion': {
    id: 'depresion',
    title: 'Test de depresión',
    description: 'Escala de cribado para posibles síntomas depresivos (basado en PHQ-9).',
    instruction: 'Indica con qué frecuencia te ha ocurrido lo siguiente durante las últimas 2 semanas.',
    duration: '~5 min',
    scaleMin: 0,
    scaleMax: 3,
    scaleLabels: ESCALA_ANSIEDAD,
    questions: [
      { id: 'q1', text: 'Poco interés o poco placer en hacer las cosas' },
      { id: 'q2', text: 'Sentirse decaído/a, deprimido/a o sin esperanza' },
      { id: 'q3', text: 'Dificultad para conciliar el sueño, mantenerlo o dormir demasiado' },
      { id: 'q4', text: 'Sentirse cansado/a o con poca energía' },
      { id: 'q5', text: 'Poco apetito o comer en exceso' },
      { id: 'q6', text: 'Sentirse mal consigo mismo/a o que ha fracasado' },
      { id: 'q7', text: 'Dificultad para concentrarse (p. ej. al leer o ver la TV)' },
      { id: 'q8', text: 'Moverse o hablar tan lento que los demás lo notan, o lo contrario: muy inquieto/a' },
      { id: 'q9', text: 'Pensamientos de que estaría mejor muerto/a o de hacerse daño' },
    ],
    getInterpretation(score: number): InterpretationResult {
      const toolsLeve: EmotionalTool[] = [
        { title: 'Activación conductual', description: 'Programa actividades con sentido (contacto social, ejercicio, aficiones). Reengancharse a lo que importa mejora el estado de ánimo.', evidence: 'OMS; Cochrane; eficacia comparable a TCC en estudios.' },
        { title: 'Ejercicio físico', description: '150–300 min/semana de actividad moderada. En depresión leve-moderada el ejercicio tiene efecto como tratamiento con evidencia.', evidence: 'Cochrane; guías CANMAT.' },
        { title: 'Rutina de sueño', description: 'Levantarse y acostarse a horas similares, exponerse a luz natural de día. El sueño regular favorece el ánimo y la energía.', evidence: 'Evidencia en sueño y salud mental.' },
        { title: 'Contacto social', description: 'Mantener o retomar contacto con personas de confianza, aunque sea breve. El apoyo social se asocia a mejor pronóstico.', evidence: 'Evidencia en depresión y apoyo social.' },
      ];
      const toolsModerada: EmotionalTool[] = [
        ...toolsLeve,
        { title: 'Consulta profesional', description: 'Un médico o psicólogo puede confirmar el diagnóstico y ofrecer tratamiento (activación conductual, TCC, valoración farmacológica si procede).', evidence: 'OMS; guías de práctica clínica.' },
      ];
      if (score <= 4) return { level: 'Mínima', message: 'Los síntomas depresivos parecen bajos. Mantener hábitos saludables y apoyo social suele ayudar.', tools: toolsLeve };
      if (score <= 9) return { level: 'Leve', message: 'Puede haber algo de bajo estado de ánimo. Las herramientas siguientes tienen evidencia y pueden ayudarte.', tools: toolsLeve };
      if (score <= 14) return { level: 'Moderada', message: 'Los síntomas pueden estar afectando tu vida. Recomendamos hablar con un profesional y usar las estrategias de abajo como apoyo.', tools: toolsModerada };
      if (score <= 19) return { level: 'Moderadamente severa', message: 'Es importante que busques apoyo profesional. El tratamiento suele mejorar mucho el pronóstico; las herramientas complementan.', tools: toolsModerada };
      return { level: 'Severa', message: 'Te recomendamos consultar con un profesional de salud mental lo antes posible. Pedir ayuda es el primer paso.', tools: toolsModerada };
    },
  },

  'bienestar': {
    id: 'bienestar',
    title: 'Índice de bienestar (WHO-5)',
    description: 'Cuestionario breve de bienestar psicológico de la OMS (WHO-5). Puntuación 0-100.',
    instruction: 'Responde a cada ítem según cómo te has sentido durante las últimas 2 semanas.',
    duration: '~2 min',
    scaleMin: 0,
    scaleMax: 5,
    scaleLabels: ['En ningún momento', 'Algo del tiempo', 'Menos de la mitad', 'Más de la mitad', 'La mayor parte', 'Todo el tiempo'],
    scoreDisplay: 'percentage',
    questions: [
      { id: 'q1', text: 'Me he sentido alegre y de buen ánimo' },
      { id: 'q2', text: 'Me he sentido tranquilo/a y relajado/a' },
      { id: 'q3', text: 'Me he sentido activo/a y vigoroso/a' },
      { id: 'q4', text: 'Me he despertado sintiéndome fresco/a y descansado/a' },
      { id: 'q5', text: 'Mi vida diaria ha estado llena de cosas que me interesan' },
    ],
    getInterpretation(score: number): InterpretationResult {
      const pct = (score / 25) * 100;
      const toolsBienestar: EmotionalTool[] = [
        { title: 'Activación conductual', description: 'Incluye en tu día actividades que te den sentido o placer (sociales, ejercicio, aficiones). Ayuda a prevenir y mejorar bajo ánimo.', evidence: 'OMS; meta-análisis intervenciones preventivas.' },
        { title: 'Actividad física', description: '150–300 min/semana de actividad moderada. La OMS vincula la actividad regular con mejor bienestar y menor riesgo de depresión.', evidence: 'OMS; Cochrane.' },
        { title: 'Conexión social', description: 'Dedica tiempo a relaciones que te apoyen. El contacto social regular protege el bienestar emocional.', evidence: 'Evidencia en bienestar y apoyo social.' },
      ];
      const toolsBajo: EmotionalTool[] = [
        ...toolsBienestar,
        { title: 'Valoración profesional', description: 'Puntuación ≤50 se usa como corte de cribado de posible depresión. Consultar con un profesional permite valoración y orientación.', evidence: 'Topp et al. Psychother Psychosom 2015; WHO-5.' },
      ];
      if (pct >= 76) return { level: 'Muy alto', message: 'Tu bienestar percibido es alto. La puntuación no indica riesgo de depresión en cribado.', tools: toolsBienestar };
      if (pct >= 52) return { level: 'Alto', message: 'Tu nivel de bienestar es bueno. Por encima del punto de corte habitual de cribado (≤50).', tools: toolsBienestar };
      if (pct >= 28) return { level: 'Bajo', message: 'Bienestar por debajo del óptimo. Las herramientas de abajo pueden ayudar; valorar consulta si persiste.', tools: toolsBajo };
      return { level: 'Muy bajo', message: 'Puntuación por debajo del punto de corte de cribado (≤50). Se recomienda consultar con un profesional de salud para valoración.', tools: toolsBajo };
    },
  },
};

export function getTestById(id: string): TestDefinition | null {
  return TESTS_EMOCIONALES[id] ?? null;
}

export function getAllTestIds(): string[] {
  return Object.keys(TESTS_EMOCIONALES);
}
