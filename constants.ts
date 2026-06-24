import { Moment, ResponseMode } from './types';

export const APP_NAME = "Sonda Digital";

export const HELP_CONTENT = {
  title: "¿Necesitas apoyo?",
  body: "Si tienes dudas, ansiedad o quieres retirarte del estudio, contáctanos.",
  whatsapp: "+56961407000",
  email: "vanessa.vega@pucv.cl",
  subject: "Envío de Sonda - Proyecto FONDECYT 1251541"
};

// 12 momentos, 13 actividades en total.
// Momento 1 (Entrada) tiene 2 actividades; el resto, 1.
// Momento 12 (Cierre) siempre visible y opcional.
export const STUDY_CONTENT: Moment[] = [
  {
    id: 1,
    title: "Mi entorno y mis sentidos",
    goal: "Establecer una base de autoconocimiento sensorial sobre la cual se apoyan la autorregulación y el autoconcepto.",
    isLocked: false,
    alwaysVisible: false,
    activities: [
      {
        id: "1.A",
        title: "Mapa de lugares",
        description: "La universidad tiene lugares que nos dan seguridad y lugares que nos la quitan. Sube una foto o describe un lugar del campus donde te sientas seguro o segura, y otro donde te sientas abrumado o abrumada.",
        scaffoldExample: "Ejemplo: una foto de una biblioteca vacía (seguro) y una foto de la cafetería llena (abrumado).",
        allowedModes: [ResponseMode.PHOTO, ResponseMode.TEXT, ResponseMode.AUDIO],
        tacDimension: null,
        tacSubdimension: null,
        isCompleted: false,
        responses: []
      },
      {
        id: "1.B",
        title: "Cazadores de ruido y luz",
        description: "¿Hay algo en el lugar donde estás estudiando hoy (un ruido, una luz o una textura) que te distraiga o te resulte incómodo? Toma una foto de la luz o textura, graba un audio corto del ruido, o escribe una breve descripción de lo que te molesta. Si quieres, cuéntanos también cómo afecta esto a tu estudio y si haces algo para que te moleste menos. Si hoy no hay nada que te incomode, también puedes decirlo.",
        allowedModes: [ResponseMode.AUDIO, ResponseMode.PHOTO, ResponseMode.TEXT],
        tacDimension: null,
        tacSubdimension: null,
        isCompleted: false,
        responses: []
      }
    ]
  },
  {
    id: 2,
    title: "Autonomía",
    goal: "Actuar de manera independiente en los distintos contextos, según los intereses y preferencias personales.",
    isLocked: true,
    alwaysVisible: false,
    activities: [
      {
        id: "2.1",
        title: "Mi manera de hacer las cosas",
        description: "Cada persona tiene su propia manera de estudiar. Piensa en una tarea de estudio que hiciste hace poco y que decidiste hacer a tu manera: dónde, cuándo o cómo. Cuéntanos qué elegiste y por qué esa manera te funciona a ti. Si esta vez seguiste la manera de otra persona, también puedes contarlo.",
        scaffoldExample: "Ejemplo: \"Preferí estudiar de noche con audífonos en mi pieza, porque de día hay mucho ruido en la casa.\"",
        allowedModes: [ResponseMode.TEXT, ResponseMode.AUDIO, ResponseMode.PHOTO],
        tacDimension: "Volitiva",
        tacSubdimension: "Autonomía",
        isCompleted: false,
        responses: []
      }
    ]
  },
  {
    id: 3,
    title: "Autoiniciación",
    goal: "Iniciar voluntariamente actividades y hacer elecciones conscientes basadas en preferencias e intereses.",
    isLocked: true,
    alwaysVisible: false,
    activities: [
      {
        id: "3.1",
        title: "Empezar por cuenta propia",
        description: "Piensa en estos últimos días. ¿Hubo algo relacionado con tus estudios que empezaste por tu cuenta, sin que nadie te lo pidiera? Por ejemplo: repasar un tema, escribirle a un compañero, ordenar tu material o buscar información. Si ocurrió, cuéntanos qué fue y qué te llevó a empezarlo. Si no ocurrió, también puedes decirlo.",
        scaffoldExample: "Ejemplo: \"Decidí adelantar la lectura de la próxima clase porque me daba curiosidad el tema.\"",
        allowedModes: [ResponseMode.TEXT, ResponseMode.AUDIO],
        tacDimension: "Volitiva",
        tacSubdimension: "Autoiniciación",
        isCompleted: false,
        responses: []
      }
    ]
  },
  {
    id: 4,
    title: "Control inhibitorio",
    goal: "Detener una respuesta automática o resistir una distracción o un impulso para sostener la acción dirigida a una meta.",
    isLocked: true,
    alwaysVisible: false,
    activities: [
      {
        id: "4.1",
        title: "Sostener la tarea",
        description: "A veces, mientras estudiamos, aparece algo que nos da ganas de parar o de hacer otra cosa: el teléfono, un ruido, ganas de levantarse. Piensa en un momento reciente en que sentiste esas ganas de interrumpir lo que hacías, pero decidiste seguir. ¿Qué hiciste para mantenerte en la tarea? Si en cambio dejaste la tarea, también puedes contarlo, no hay respuesta correcta.",
        scaffoldExample: "Ejemplo: \"Quería revisar el celular, así que lo dejé en otra pieza hasta terminar.\"",
        allowedModes: [ResponseMode.TEXT, ResponseMode.AUDIO],
        tacDimension: "Volitiva",
        tacSubdimension: "Control inhibitorio",
        isCompleted: false,
        responses: []
      }
    ]
  },
  {
    id: 5,
    title: "Autodirección",
    goal: "Usar estrategias para dirigir las acciones hacia un resultado y actuar al servicio de objetivos libremente escogidos.",
    isLocked: true,
    alwaysVisible: false,
    activities: [
      {
        id: "5.1",
        title: "Mi meta y mis pasos",
        description: "Piensa en lo que querías lograr hoy (o en tu sesión de estudio más reciente). ¿Qué te propusiste hacer y qué pasos diste para acercarte a eso? Cuéntanos tu meta y lo que hiciste. Si hoy no te propusiste nada en particular, también puedes decirlo.",
        scaffoldExample: "Ejemplo: \"Mi meta era terminar dos ejercicios; partí por el más fácil para tomar impulso.\"",
        allowedModes: [ResponseMode.TEXT, ResponseMode.AUDIO, ResponseMode.PHOTO],
        tacDimension: "Agencial",
        tacSubdimension: "Autodirección",
        isCompleted: false,
        responses: []
      }
    ]
  },
  {
    id: 6,
    title: "Autorregulación",
    goal: "Identificar el camino hacia una meta y ajustar la dirección cuando surgen retos.",
    isLocked: true,
    alwaysVisible: false,
    activities: [
      {
        id: "6.1",
        title: "Cambiar de plan",
        description: "Piensa en estos días. ¿Hubo algún momento en que tuviste que cambiar tus planes de estudio o dejar algo para después? Si ocurrió, cuéntanos qué pasó y cómo te sentiste con ese cambio. Si no ocurrió, también puedes decirlo.",
        scaffoldExample: "Puedes subir una foto de tu agenda con cambios, o grabar un audio explicando.",
        allowedModes: [ResponseMode.PHOTO, ResponseMode.AUDIO, ResponseMode.TEXT],
        tacDimension: "Agencial",
        tacSubdimension: "Autorregulación",
        isCompleted: false,
        responses: []
      }
    ]
  },
  {
    id: 7,
    title: "Pensar en alternativas",
    goal: "Pensar en diferentes opciones de acción para superar obstáculos.",
    isLocked: true,
    alwaysVisible: false,
    activities: [
      {
        id: "7.1",
        title: "Plan B",
        description: "Cuando algo no resulta como esperabas (una instrucción confusa, una tarea más difícil de lo previsto, un material que no encuentras), a veces hay que pensar en otra forma de resolverlo. Piensa en una situación reciente así. ¿Qué otras opciones se te ocurrieron? Cuéntanos qué alternativas pensaste, aunque al final no las hayas usado. Si no recuerdas una situación así, también puedes decirlo.",
        scaffoldExample: "Ejemplo: \"No entendía la consigna, así que pensé en preguntarle al profesor, revisar el apunte de un compañero o buscarlo en internet.\"",
        allowedModes: [ResponseMode.TEXT, ResponseMode.AUDIO],
        tacDimension: "Agencial",
        tacSubdimension: "Pensar en alternativas",
        isCompleted: false,
        responses: []
      }
    ]
  },
  {
    id: 8,
    title: "Flexibilidad cognitiva",
    goal: "Adaptarse a cambios inesperados y cambiar de enfoque cuando la situación lo requiere.",
    isLocked: true,
    alwaysVisible: false,
    activities: [
      {
        id: "8.1",
        title: "Cuando algo cambia",
        description: "A veces las cosas cambian de un momento a otro: se mueve una fecha de entrega, cambian la sala, un profesor pide algo distinto a lo anunciado. Piensa en un cambio inesperado que hayas vivido hace poco en la universidad. ¿Cómo te adaptaste a ese cambio? Si te costó adaptarte, también puedes contarlo: nos sirve igual.",
        scaffoldExample: "Ejemplo: \"Cambiaron la prueba de día y tuve que reorganizar todo mi estudio de la semana.\"",
        allowedModes: [ResponseMode.TEXT, ResponseMode.AUDIO],
        tacDimension: "Agencial",
        tacSubdimension: "Flexibilidad cognitiva",
        isCompleted: false,
        responses: []
      }
    ]
  },
  {
    id: 9,
    title: "Empoderamiento",
    goal: "Sentirse capaz de defenderse, expresar los propios derechos, intereses u opiniones.",
    isLocked: true,
    alwaysVisible: false,
    activities: [
      {
        id: "9.1",
        title: "Formas de apoyo",
        description: "Piensa en las cosas que más te ayudan o te ayudarían en tus clases. Si pudieras pedirle a tus profesores algunas formas concretas de apoyarte mejor, ¿cuáles serían? Pueden ser una, dos o las que necesites.",
        scaffoldExample: "Ejemplo: \"Avisarme antes de pedirme hablar en público\" o \"darme las instrucciones por escrito\".",
        allowedModes: [ResponseMode.TEXT, ResponseMode.AUDIO],
        tacDimension: "Creencias de control-acción",
        tacSubdimension: "Empoderamiento",
        isCompleted: false,
        responses: []
      }
    ]
  },
  {
    id: 10,
    title: "Autorrealización",
    goal: "Conocer las propias capacidades, necesidades y apoyos necesarios para alcanzar una meta.",
    isLocked: true,
    alwaysVisible: false,
    activities: [
      {
        id: "10.1",
        title: "Lo que sé de mí",
        description: "Todos tenemos cosas que hacemos bien y cosas en las que necesitamos más apoyo. Pensando en ti como estudiante, cuéntanos una cosa que se te da bien cuando estudias y una cosa en la que necesitas más ayuda. No hay respuestas mejores ni peores.",
        scaffoldExample: "Ejemplo: \"Se me da bien organizar mis apuntes con colores; me cuesta más concentrarme cuando hay mucha gente alrededor.\"",
        allowedModes: [ResponseMode.TEXT, ResponseMode.AUDIO],
        tacDimension: "Creencias de control-acción",
        tacSubdimension: "Autorrealización / Autoconcepto",
        isCompleted: false,
        responses: []
      }
    ]
  },
  {
    id: 11,
    title: "Control de las expectativas",
    goal: "Creencias sobre la conexión entre la propia persona (y sus acciones) y los resultados que obtiene.",
    isLocked: true,
    alwaysVisible: false,
    activities: [
      {
        id: "11.1",
        title: "Esfuerzo y resultado",
        description: "Piensa en algo que lograste en tus estudios este mes, aunque sea pequeño (entender un tema, entregar a tiempo, animarte a preguntar). ¿Qué hiciste tú que ayudó a que saliera bien? Cuéntanos qué parte de ese resultado tuvo que ver con algo que tú hiciste. Si sientes que no dependió de ti, también puedes contarlo.",
        scaffoldExample: "Ejemplo: \"Entregué a tiempo porque me hice un calendario y empecé antes de lo habitual.\"",
        allowedModes: [ResponseMode.TEXT, ResponseMode.AUDIO, ResponseMode.VIDEO],
        tacDimension: "Creencias de control-acción",
        tacSubdimension: "Control de las expectativas",
        isCompleted: false,
        responses: []
      }
    ]
  },
  {
    id: 12,
    title: "Mensaje al futuro",
    goal: "Conectar el esfuerzo presente con la proyección personal.",
    isLocked: false,
    alwaysVisible: true, // Siempre visible, siempre al final
    activities: [
      {
        id: "12.1",
        title: "Mensaje al yo futuro",
        description: "Imagina que te estás graduando y puedes dejarte un mensaje para recordar este momento de tu vida. Pensando en tus rutinas y tareas de estos días, ¿qué cosas concretas te gustaría recordar sobre cómo lograste avanzar en tus estudios? Graba un audio o un video corto, o escribe un texto contándonos qué te dirías.",
        allowedModes: [ResponseMode.AUDIO, ResponseMode.VIDEO, ResponseMode.TEXT],
        tacDimension: null,
        tacSubdimension: null,
        isCompleted: false,
        responses: []
      }
    ]
  }
];
