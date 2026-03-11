export interface Articulo {
  id: string;
  title: string;
  shortDesc: string;
  content: string;
}

export interface Ejercicio {
  id: string;
  title: string;
  shortDesc: string;
  duration: string;
  steps: string[];
  evidence?: string;
}

export const ARTICULOS: Articulo[] = [
  {
    id: 'ansiedad',
    title: '¿Qué es la ansiedad y cómo manejarla?',
    shortDesc: 'Introducción a la ansiedad, síntomas habituales y estrategias básicas de afrontamiento.',
    content: `La ansiedad es una respuesta normal del cuerpo ante situaciones de incertidumbre o amenaza. Se convierte en un problema cuando es intensa, frecuente o interfiere con tu día a día.

Síntomas habituales: preocupación excesiva, tensión muscular, inquietud, dificultad para concentrarse, irritabilidad, alteraciones del sueño. En el plano físico pueden aparecer taquicardia, sudoración o sensación de ahogo.

Estrategias con apoyo en guías (NICE, TCC):
• Respiración diafragmática: 4 s inspirar, 6 s espirar, varios minutos al día.
• Actividad física regular (OMS: 150–300 min/semana de intensidad moderada).
• Higiene del sueño: horarios regulares, evitar cafeína y alcohol antes de dormir.
• Exposición gradual: acercarte poco a poco a situaciones que evitas por miedo.
• Si la ansiedad persiste o es intensa, consultar con un profesional (TCC y/o relajación aplicada están recomendadas).`
  },
  {
    id: 'sueño',
    title: 'El sueño y el bienestar emocional',
    shortDesc: 'Cómo dormir mejor influye en tu estado de ánimo y qué hábitos pueden ayudarte.',
    content: `El sueño y el estado de ánimo están muy relacionados: dormir mal aumenta el riesgo de bajo ánimo y ansiedad, y a la inversa, el estrés y la preocupación dificultan el sueño.

Recomendaciones basadas en evidencia:
• Horario regular: acostarte y levantarte a horas similares, también los fines de semana.
• Exposición a luz natural durante el día y reducir pantallas 1–2 h antes de dormir.
• Evitar cafeína después de mediodía y alcohol por la noche (empeora la calidad del sueño).
• Ambiente fresco, oscuro y silencioso; usar la cama solo para dormir (no trabajar ni ver series).
• Si tienes insomnio persistente, la terapia cognitivo-conductual para el insomnio (TCC-I) tiene más evidencia que la medicación a largo plazo. Consulta con tu médico o con un profesional de psicología.`
  },
  {
    id: 'asertividad',
    title: 'Comunicación asertiva',
    shortDesc: 'Aprende a expresar tus necesidades y emociones de forma clara y respetuosa.',
    content: `La comunicación asertiva consiste en expresar lo que piensas, sientes y necesitas de forma clara y respetuosa, sin agredir ni someterte al otro.

Principios básicos (usados en TCC y entrenamiento en habilidades sociales):
• Describe el hecho concreto (qué ha pasado), no etiquetes a la persona.
• Expresa tu emoción o necesidad con "yo": "Yo me siento…", "Yo necesito…".
• Propón una alternativa o pide un cambio concreto.
• Mantén el tono calmado y el contacto visual; escucha la respuesta del otro.

Ejemplo: "Cuando llegamos tarde sin avisar, yo me siento preocupado. Me gustaría que si vas a retrasarte me mandes un mensaje." Esto es más eficaz que "Nunca avisas" o quedarse callado.

Practicar en situaciones de bajo riesgo (con familia, amigos) ayuda a generalizar después a otros contextos. Si te cuesta mucho o genera mucha ansiedad, un profesional puede trabajar contigo técnicas y exposición.`
  }
];

export const EJERCICIOS: Ejercicio[] = [
  {
    id: 'respiración',
    title: 'Respiración consciente (5 min)',
    shortDesc: 'Ejercicio guiado de respiración para calmar la mente y el cuerpo.',
    duration: '5 minutos',
    evidence: 'TCC para ansiedad; estudios de actividad autonómica.',
    steps: [
      'Siéntate o túmbate en un lugar tranquilo. Cierra los ojos si te resulta cómodo.',
      'Coloca una mano en el abdomen. Inspira por la nariz de forma lenta (unos 4 segundos) y nota cómo se hincha el abdomen.',
      'Espira por la boca o la nariz de forma aún más lenta (unos 6 segundos) y nota cómo el abdomen baja.',
      'Repite el ciclo sin forzar. Si te distraes, vuelve suavemente a la respiración.',
      'Continúa 5 minutos. Al terminar, abre los ojos y permanece un momento en calma antes de retomar la actividad.'
    ]
  },
  {
    id: 'body-scan',
    title: 'Body scan (10 min)',
    shortDesc: 'Recorrido por las sensaciones del cuerpo para liberar tensión.',
    duration: '10 minutos',
    evidence: 'Mindfulness basado en evidencia (MBSR/MBCT).',
    steps: [
      'Túmbate boca arriba en un lugar cómodo. Cierra los ojos y respira con normalidad.',
      'Lleva la atención a los pies: nota sensaciones (temperatura, presión, hormigueo) sin intentar cambiarlas.',
      'Sube poco a poco: tobillos, pantorrillas, rodillas, muslos, cadera, abdomen, espalda, pecho, hombros, brazos, manos, cuello, cara, cabeza.',
      'En cada zona, permanece 20–30 segundos. Si aparece tensión, no la fuerces; solo obsérvala.',
      'Al final, toma conciencia de todo el cuerpo como un conjunto durante unas respiraciones. Abre los ojos con calma.'
    ]
  },
  {
    id: 'gratitud',
    title: 'Meditación de gratitud',
    shortDesc: 'Práctica para enfocarte en lo que agradeces y mejorar tu estado de ánimo.',
    duration: '5–10 minutos',
    evidence: 'Estudios en bienestar y regulación emocional.',
    steps: [
      'Siéntate cómodamente y cierra los ojos. Respira con normalidad.',
      'Piensa en una persona, un momento o algo concreto por lo que sientas gratitud hoy. No tiene que ser algo grande.',
      'Mantén la imagen o el recuerdo en la mente 20–30 segundos. Nota las sensaciones en el cuerpo (pecho, rostro).',
      'Repite con 2 o 3 cosas más. Puedes ser tú mismo (un logro, un esfuerzo), alguien cercano o algo del día a día.',
      'Termina con una o dos respiraciones profundas y abre los ojos. Lleva esa sensación unos instantes al siguiente momento del día.'
    ]
  }
];
