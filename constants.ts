import { WeekModule } from './types';

// --- CONFIGURACIÓN DE DESARROLLADOR ---
// Cambia esto a TRUE para desbloquear todas las semanas automáticamente.
export const IS_DEVELOPER_MODE = true; 
// --------------------------------------

export const APP_NAME = "Sonda Digital";

export const WEEKLY_CONTENT: WeekModule[] = [
  {
    id: 1,
    title: "Semana 1: Mi Entorno y mis Sentidos",
    goal: "Identificar barreras y facilitadores físicos/sensoriales en el campus.",
    isLocked: false,
    activities: [
      {
        id: "1.1",
        title: "El mapa de calor personal",
        description: "La universidad tiene lugares que nos dan energía y lugares que nos la quitan. Sube una foto o describe un lugar del campus donde te sientas seguro/a y otro donde te sientas abrumado/a.",
        scaffoldExample: "Ejemplo: Una foto de una biblioteca vacía (seguro) vs. una foto de la cafetería llena (abrumado).",
        isCompleted: false,
        responses: []
      },
      {
        id: "1.2",
        title: "Cazadores de ruido/luz",
        description: "¿Hay algo en tu entorno de estudio hoy que te distraiga o moleste sensorialmente? Graba un audio corto del ruido o toma una foto de la luz/textura.",
        isCompleted: false,
        responses: []
      }
    ]
  },
  {
    id: 2,
    title: "Semana 2: Navegando la Academia",
    goal: "Explorar funciones ejecutivas y estrategias de gestión.",
    isLocked: true,
    activities: [
      {
        id: "2.1",
        title: "Expectativa vs. Realidad",
        description: "A veces planeamos estudiar, pero la energía no alcanza (teoría de las cucharas). Cuéntanos de un momento esta semana donde tuviste que cambiar tus planes. ¿Qué pasó?",
        scaffoldExample: "Puedes subir una foto de tu agenda tachada o enviarnos un audio explicando.",
        isCompleted: false,
        responses: []
      },
      {
        id: "2.2",
        title: "Mis herramientas secretas",
        description: "¿Usas alguna app, audífonos, o técnica especial para concentrarte? Compártela con nosotros.",
        isCompleted: false,
        responses: []
      }
    ]
  },
  {
    id: 3,
    title: "Semana 3: Lo Social y la Comunicación",
    goal: "Entender las interacciones con pares/docentes.",
    isLocked: true,
    activities: [
      {
        id: "3.1",
        title: "El traductor",
        description: "A veces los profesores o compañeros dicen cosas que son confusas o ambiguas. ¿Recuerdas alguna instrucción o comentario reciente que no fue claro? ¿Cómo lo resolviste?",
        isCompleted: false,
        responses: []
      },
      {
        id: "3.2",
        title: "Modo 'Off'",
        description: "Interactuar cansa. ¿Qué haces para recargar tu batería social después de clases?",
        scaffoldExample: "Ejemplo: escuchar música, dormir, jugar videojuegos.",
        isCompleted: false,
        responses: []
      }
    ]
  },
  {
    id: 4,
    title: "Semana 4: Identidad y Futuro",
    goal: "Autodeterminación y proyección.",
    isLocked: true,
    activities: [
      {
        id: "4.1",
        title: "Manual de Usuario",
        description: "Si pudieras entregarle un 'Manual de Instrucciones' a tus profesores sobre cómo apoyarte mejor, ¿cuáles serían las 3 reglas más importantes?",
        scaffoldExample: "1. No pedirme que hable en público sin avisar. 2. Darme las instrucciones por escrito.",
        isCompleted: false,
        responses: []
      },
      {
        id: "4.2",
        title: "Mensaje al futuro",
        description: "Graba un mensaje corto para ti mismo/a cuando te gradúes. ¿Qué te gustaría recordar de tu esfuerzo actual?",
        isCompleted: false,
        responses: []
      }
    ]
  }
];

export const HELP_CONTENT = {
  title: "¿Necesitas apoyo?",
  body: "Si tienes dudas, ansiedad o quieres retirarte del estudio, contáctanos. Investigadora Responsable: Vanessa Vega (Fondecyt).",
  whatsapp: "+56961407000",
  email: "vanessa.vega@pucv.cl",
  subject: "Envío de Sonda - Proyecto FONDECYT 1251541"
};