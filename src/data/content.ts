export type TableData = {
  columns: string[];
  rows: string[][];
};

export type TimelineItem = {
  label: string;
  items: string[];
};

export type SectionContent = {
  id: string;
  navLabel: string;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  authors?: string[];
  body?: string;
  definition?: string;
  highlight?: string;
  bullets?: string[];
  cards?: string[];
  blocks?: string[];
  phrases?: string[];
  table?: TableData;
  comparison?: {
    leftTitle: string;
    rightTitle: string;
    rows: [string, string][];
  };
  flow?: string[];
  timeline?: TimelineItem[];
  questions?: string[];
  agreements?: string[];
  searchTags?: string[];
};

export const sections: SectionContent[] = [
  {
    id: "portada",
    navLabel: "Portada",
    eyebrow: "Propuesta para Directorio IME Chile",
    title: "Gobernanza operacional para una nueva escala gremial",
    subtitle:
      "IME Conecta como infraestructura interna para ordenar, profesionalizar y proyectar la gestión de IME Chile.",
    authors: ["Patricio González Cruz", "Director y Tesorero IME Chile"],
    searchTags: ["propuesta", "directorio", "ime conecta", "gobernanza"],
  },
  {
    id: "indice",
    navLabel: "Índice",
    title: "Índice de contenidos",
    body:
      "Una ruta de lectura para revisar el diagnóstico, la solución propuesta, el vínculo con Sercotec, el piloto IME Link 2027 y las materias de deliberación directiva.",
    searchTags: ["indice", "contenidos", "presentacion"],
  },
  {
    id: "punto-partida",
    navLabel: "Punto de partida",
    title: "Punto de partida",
    body:
      "IME Chile entra en una etapa de mayor envergadura gremial. Esto implica más proyectos, más alianzas, más información, más expectativas y mayor responsabilidad institucional.",
    highlight:
      "A mayor envergadura gremial, mayor necesidad de estructura operacional.",
    bullets: [
      "Más proyectos estratégicos.",
      "Más vínculos institucionales.",
      "Mayor necesidad de trazabilidad.",
      "Mayor responsabilidad sobre datos y activos digitales.",
      "Mayor exigencia de coordinación interna.",
    ],
    searchTags: ["escala", "estructura operacional", "responsabilidad"],
  },
  {
    id: "mirada-macro",
    navLabel: "Mirada macro",
    title: "Mirada macro del gremio",
    body:
      "La música electrónica chilena ya no puede entenderse solo como escena o comunidad informal. También requiere representación gremial, datos, institucionalidad, redes, planificación y capacidad de gestión.",
    bullets: [
      "Ecosistema artístico.",
      "Ecosistema técnico.",
      "Ecosistema productivo.",
      "Ecosistema territorial.",
      "Ecosistema digital.",
      "Ecosistema de datos y memoria cultural.",
    ],
    searchTags: ["musica electronica", "ecosistema", "datos", "territorio"],
  },
  {
    id: "problema",
    navLabel: "Problema detectado",
    title: "Problema detectado",
    body:
      "El principal problema no es la falta de ideas ni de voluntad. El problema está en la gestión operacional: como ordenamos socios/as, acuerdos, documentos, comités, proyectos, datos, activos digitales, responsables, plazos y seguimiento.",
    cards: [
      "Información dispersa.",
      "Acuerdos sin seguimiento.",
      "Sobrecarga del directorio.",
      "Datos personales sin política.",
      "Proyectos sin priorización.",
      "Alianzas ambiguas.",
      "Trabajo operativo invisibilizado.",
      "Activos digitales sin inventario.",
    ],
    searchTags: ["problema", "gestion operacional", "seguimiento"],
  },
  {
    id: "analisis",
    navLabel: "Análisis operacional",
    title: "Análisis: el cuello de botella es operacional",
    body:
      "El cuello de botella no está en la creatividad del gremio, sino en su capacidad de gestión operacional.",
    highlight:
      "No se trata solo de hacer más proyectos. Se trata de construir la estructura que permita hacerlos bien.",
    table: {
      columns: ["Problema detectado", "Respuesta propuesta"],
      rows: [
        ["Información dispersa", "IME Conecta"],
        ["Acuerdos sin seguimiento", "Matriz de acuerdos"],
        ["Sobrecarga del directorio", "Separación directiva / operativa"],
        ["Directores sin área clara", "Carteras Directivas Estratégicas"],
        ["Proyectos sin priorización", "Matriz de cartera y semáforo"],
        [
          "Datos personales sin política",
          "Gobernanza de datos y Ley 21.719",
        ],
        ["Alianzas informales", "Protocolo de alianzas externas"],
        [
          "Trabajo operativo invisibilizado",
          "Política de valorización del trabajo",
        ],
      ],
    },
    searchTags: ["cuello de botella", "matriz", "semaforo"],
  },
  {
    id: "concepto",
    navLabel: "Concepto rector",
    title: "Concepto rector",
    body: "Gobernanza operacional para una nueva escala gremial",
    definition:
      "La propuesta plantea que IME Chile necesita una gobernanza operacional que permita sostener su crecimiento gremial, ordenar su base interna y habilitar proyectos estratégicos de mayor escala.",
    phrases: [
      "Ordenar para crecer.",
      "La infraestructura interna también es estrategia.",
      "IME Conecta no compite con IME Link 2027: lo habilita.",
    ],
    searchTags: ["concepto rector", "ordenar para crecer"],
  },
  {
    id: "ime-conecta",
    navLabel: "IME Conecta",
    title: "IME Conecta",
    subtitle: "Infraestructura interna de gestión gremial",
    body:
      "IME Conecta será la plataforma interna y modelo de coordinación gremial orientado a ordenar la base de socios/as, comités de trabajo, acuerdos de directorio, documentos institucionales, proyectos estratégicos, responsables, plazos, activos digitales y avances.",
    highlight:
      "No se presenta como simple software, sino como infraestructura de gestión.",
    blocks: [
      "Socios/as",
      "Comités",
      "Acuerdos",
      "Documentos",
      "Proyectos",
      "Activos digitales",
      "Datos personales",
      "Trazabilidad",
      "Comunicaciones internas",
      "Reportes",
    ],
    searchTags: ["ime conecta", "infraestructura", "trazabilidad"],
  },
  {
    id: "usabilidad-web",
    navLabel: "Usabilidad web",
    title: "Usabilidad de tecnologías web para la gestión operativa",
    subtitle: "Capa Web-Video API",
    body:
      "IME Conecta puede usar capacidades nativas del navegador para resolver tareas operativas simples sin agregar fricción: registrar una foto de avatar, respaldar una rendición de gastos o dejar evidencia visual de una acción administrativa.",
    highlight:
      "Presencia local con trazabilidad visual: la captura ocurre en el navegador, con acción explícita y sin subir imágenes a servidores externos.",
    bullets: [
      "Foto de avatar para ficha de socio/a, comite o responsable operativo.",
      "Foto de boleta para rendición de gastos y respaldo documental.",
      "Captura local descargable para adjuntar luego al flujo interno que corresponda.",
      "Procesamiento visual en Canvas para validar encuadre y origen de la captura.",
    ],
    searchTags: [
      "web video api",
      "cámara",
      "avatar",
      "boleta",
      "rendición",
      "usabilidad",
      "gestión operativa",
    ],
  },
  {
    id: "sercotec",
    navLabel: "Sercotec",
    title: "Oportunidad inmediata: Sercotec Fortalecimiento Gremial",
    body:
      "El fondo Sercotec Fortalecimiento Gremial representa una oportunidad táctica inmediata para financiar una primera etapa de IME Conecta.",
    bullets: [
      "Proyecto principal de corto plazo.",
      "Pertinente con fortalecimiento gremial.",
      "Permite financiar ordenamiento interno.",
      "Puede apoyar catastro, asesorías, plataforma, gobernanza y vinculación.",
      "Cierra pronto, por lo que requiere decisión rápida.",
    ],
    highlight: "Foco de postulación: IME Conecta.",
    searchTags: ["sercotec", "fortalecimiento gremial", "postulacion"],
  },
  {
    id: "ime-link",
    navLabel: "IME Link 2027",
    title: "IME Link 2027 como sujeto de prueba estratégico",
    body:
      "Propongo mantener IME Link 2027 como sujeto de prueba estratégico para IME Conecta.",
    definition:
      "Esto permite que IME Link 2027 no sea tratado como una prioridad aislada, sino como un caso real para probar la nueva infraestructura de gestión gremial: planificación, comités, alianzas, trazabilidad, activos digitales, comunicación, presupuesto y seguimiento.",
    comparison: {
      leftTitle: "IME Conecta",
      rightTitle: "IME Link 2027",
      rows: [
        ["Infraestructura interna", "Caso de prueba estratégico"],
        ["Gestión gremial", "Hito público-cultural"],
        ["Matrices y trazabilidad", "Aplicación real"],
        ["Gobernanza de datos", "Registro y memoria del proyecto"],
        ["Comités y roles", "Producción y articulación validada"],
        ["Orden interno", "Proyección externa"],
      ],
    },
    highlight:
      "IME Link 2027 permite probar si IME Conecta realmente ayuda a sostener proyectos de mayor escala.",
    searchTags: ["ime link 2027", "piloto", "sujeto de prueba"],
  },
  {
    id: "gobernanza",
    navLabel: "Gobernanza",
    title: "Modelo de gobernanza propuesto",
    flow: [
      "Directorio estratégico",
      "Carteras Directivas",
      "Comités ejecutivos",
      "Operación valorizable",
      "IME Conecta registra y da trazabilidad",
    ],
    bullets: [
      "El directorio define estrategia.",
      "Las carteras directivas conducen áreas.",
      "Los comités ejecutan y colaboran.",
      "La operación especializada se valoriza.",
      "IME Conecta registra acuerdos, datos, documentos y avances.",
    ],
    searchTags: ["modelo", "comites", "operacion valorizable"],
  },
  {
    id: "carteras",
    navLabel: "Carteras",
    title: "Carteras Directivas Estratégicas",
    body:
      "El directorio no debe organizarse solo por cargos formales, sino también por carteras estratégicas que permitan distribuir conduccion, responsabilidad y seguimiento por áreas.",
    table: {
      columns: ["Director/a", "Cartera Directiva Estratégica", "Foco"],
      rows: [
        [
          "Teko Pamies",
          "Dirección de Comunidad, Escena y Vinculación Artística",
          "Socios/as, escena, artistas, redes territoriales y participación gremial.",
        ],
        [
          "Josefa Mujica",
          "Dirección de Cultura, Programación y Perspectiva Sectorial",
          "Agenda cultural, contenidos, programación, criterios curatoriales y lectura sectorial.",
        ],
        [
          "Javier González",
          "Dirección de Innovación y Comunicación",
          "Estrategia comunicacional, herramientas digitales, IME Conecta, innovación y canales institucionales.",
        ],
        [
          "Patricio González Cruz",
          "Dirección de Gobernanza Operacional, Finanzas y Datos",
          "Tesorería, matriz de acuerdos, rendiciones, datos, activos digitales, Ley 21.719 e IME Conecta.",
        ],
        [
          "Ignacia",
          "Cartera Directiva Estratégica por definir",
          "Definir área de conduccion, responsabilidades, entregables y seguimiento dentro del modelo de carteras.",
        ],
        [
          "Fran",
          "Cartera Directiva Estratégica por definir",
          "Definir área de conduccion, responsabilidades, entregables y seguimiento dentro del modelo de carteras.",
        ],
        [
          "Max",
          "Cartera Directiva Estratégica por definir",
          "Definir área de conduccion, responsabilidades, entregables y seguimiento dentro del modelo de carteras.",
        ],
      ],
    },
    searchTags: ["directorio", "carteras", "responsabilidad"],
  },
  {
    id: "separacion",
    navLabel: "Separación directiva / operativa",
    title: "Separación directiva / operativa",
    body:
      "IME debe distinguir claramente entre el trabajo directivo-gremial y el trabajo operativo-productivo.",
    table: {
      columns: ["Capa", "Tipo de trabajo", "Ejemplos", "Condición"],
      rows: [
        [
          "Directiva",
          "Estratégico-gremial",
          "Reuniones, planificación, representación, decisiones institucionales",
          "Ad honorem, propio del cargo directivo.",
        ],
        [
          "Técnico-operativa",
          "Ejecución profesional",
          "Producción, diseño, formulación, rendiciones, desarrollo web, comunicaciones",
          "Valorizable y remunerable si existe presupuesto.",
        ],
        [
          "Comités",
          "Mixta",
          "Diagnóstico, propuestas, coordinación inicial, apoyo sectorial",
          "Puede ser voluntaria o remunerada según carga y financiamiento.",
        ],
        [
          "Servicios externos",
          "Especializada",
          "Legal, contabilidad, desarrollo, producción, audiovisual, tecnologia",
          "Presupuestada y contratada.",
        ],
      ],
    },
    highlight:
      "IME no puede profesionalizar al sector precarizando su propia operación interna.",
    searchTags: ["operativo", "directivo", "remunerable", "valorizacion"],
  },
  {
    id: "datos-activos",
    navLabel: "Datos y activos",
    title: "Datos, activos digitales y Ley 21.719",
    body:
      "IME no solo administra socios/as, proyectos y documentos. También administra activos digitales: bases de datos, contenidos, redes, archivos, marcas, dominios, documentos, fotografías, videos, registros históricos, comunicaciones, formularios, credenciales, estadísticas, informes e IME Conecta.",
    definition:
      "Los activos digitales de IME Chile son todos aquellos recursos informacionales, documentales, tecnológicos, comunicacionales y culturales que existen en formato digital y que tienen valor gremial, estratégico, histórico, operativo, reputacional o económico para la organización.",
    bullets: [
      "Base de socios/as.",
      "Actas y documentos.",
      "Redes sociales.",
      "Dominio imechile.org.",
      "Formularios.",
      "IME Conecta.",
      "Archivos culturales.",
      "Registros audiovisuales.",
      "Reportes y catastros.",
      "Credenciales y accesos.",
    ],
    highlight:
      "Con la nueva Ley 21.719 de Protección de Datos Personales, IME debe incorporar criterios de consentimiento, finalidad, proporcionalidad, seguridad, confidencialidad, transparencia y trazabilidad en el tratamiento de datos personales.",
    searchTags: ["ley 21.719", "datos personales", "activos digitales"],
  },
  {
    id: "riesgos",
    navLabel: "Riesgos",
    title: "Riesgos si no se ordena",
    table: {
      columns: ["Riesgo", "Mitigación"],
      rows: [
        [
          "Sobrecarga del directorio",
          "Separar capa directiva y operativa.",
        ],
        [
          "Falta de trazabilidad",
          "IME Conecta + actas + matriz de acuerdos.",
        ],
        [
          "Conflictos de interés",
          "Declaración y abstencion cuando corresponda.",
        ],
        ["Proyectos sin capacidad real", "Matriz de priorización."],
        [
          "Mezcla entre IME y vehículos externos",
          "Separación jurídica y funcional.",
        ],
        ["Desorden documental", "Secretaría Técnica y archivo oficial."],
        ["Baja participación de socios/as", "Comités y comunicación clara."],
        [
          "Dependencia de personas específicas",
          "Roles, procedimientos y archivo compartido.",
        ],
        ["Precarización del trabajo operativo", "Política de valorización."],
        ["Alianzas ambiguas", "Protocolo de alianzas."],
      ],
    },
    searchTags: ["riesgos", "mitigacion", "conflictos"],
  },
  {
    id: "ruta",
    navLabel: "Ruta",
    title: "Ruta de implementación",
    timeline: [
      {
        label: "0 días",
        items: [
          "Confirmar proyecto Sercotec: IME Conecta como foco de postulación.",
          "Definir responsable de formulación, presupuesto y carta Gantt.",
          "Levantar documentos institucionales y antecedentes base.",
          "Alinear objetivos, resultados esperados y compromisos del directorio.",
        ],
      },
      {
        label: "15 días",
        items: [
          "Validar diagnóstico.",
          "Ajustar concepto rector.",
          "Crear matriz de proyectos.",
          "Preparar postulación Sercotec.",
          "Definir mesa de trabajo.",
        ],
      },
      {
        label: "30 días",
        items: [
          "Actualizar base de socios/as.",
          "Diseñar versión inicial de IME Conecta.",
          "Activar comités prioritarios.",
          "Ordenar documentación.",
          "Definir criterios de datos y permisos.",
        ],
      },
      {
        label: "90 días",
        items: [
          "Piloto operativo de IME Conecta.",
          "Matriz de acuerdos funcionando.",
          "Matriz de proyectos activa.",
          "Carteras directivas reportando avances.",
          "IME Link 2027 como caso de prueba estratégico.",
        ],
      },
      {
        label: "2027",
        items: [
          "IME Link 2027 como validación pública de la nueva infraestructura de gestión.",
        ],
      },
    ],
    searchTags: ["implementacion", "0 dias", "sercotec", "15 dias", "90 dias", "2027"],
  },
  {
    id: "discusion",
    navLabel: "Discusión",
    title: "Discusión directiva: validación, ajustes y próximos acuerdos",
    body:
      "Esta propuesta no busca cerrar una decisión de manera automatica, sino abrir una discusión estratégica del directorio sobre la forma en que IME Chile debe organizarse para enfrentar una nueva escala gremial.",
    questions: [
      "¿El directorio comparte el diagnóstico operacional?",
      "¿El concepto \"Gobernanza operacional para una nueva escala gremial\" representa bien el momento de IME?",
      "¿IME Conecta debe ser el foco principal de corto plazo?",
      "¿IME Link 2027 debe operar como sujeto de prueba estratégico?",
      "¿Es necesario reformular objetivos antes de votar?",
      "¿Qué acuerdos mínimos deberían quedar para una próxima sesión o votación?",
    ],
    searchTags: ["discusion", "directorio", "validacion"],
  },
  {
    id: "acuerdos",
    navLabel: "Acuerdos",
    title: "Propuesta de acuerdos para eventual votación",
    body:
      "A partir de la discusión, el directorio podrá reformular objetivos, ajustar prioridades y definir que materias deben ser sometidas a votación en esta sesión o en una próxima reunion.",
    agreements: [
      "Aprobar, rechazar o reformular el concepto rector.",
      "Definir si IME Conecta será priorizado como proyecto principal para Sercotec Fortalecimiento Gremial.",
      "Definir si IME Link 2027 será tratado como sujeto de prueba estratégico de IME Conecta.",
      "Mandatar una mesa de trabajo para ajustar la propuesta y preparar la postulación.",
      "Encargar una versión final del plan para ser revisada y votada por el directorio.",
    ],
    searchTags: ["votacion", "acuerdos", "sesion"],
  },
  {
    id: "cierre",
    navLabel: "Cierre",
    title: "Cierre",
    phrases: [
      "Ordenar para crecer.",
      "La infraestructura interna también es estrategia.",
      "IME Conecta no compite con IME Link 2027: lo habilita.",
      "El objetivo no es burocratizar IME, sino darle una estructura minima para crecer sin depender de la memoria, la buena voluntad o la sobrecarga de sus directores/as.",
    ],
    searchTags: ["cierre", "ordenar", "crecer"],
  },
];

export const executiveSummary = [
  "Gobernanza operacional para una nueva escala gremial propone que IME Chile ordene su gestión interna para sostener una etapa de mayor envergadura institucional.",
  "IME Conecta se plantea como infraestructura interna, no solo como software: debe registrar socios/as, comités, acuerdos, documentos, proyectos, responsables, plazos, datos personales, activos digitales y avances.",
  "La propuesta incorpora capacidades web locales, como una Capa Web-Video API, para capturar avatar, boletas o evidencias operativas sin enviar datos a terceros.",
  "La oportunidad táctica inmediata es Sercotec Fortalecimiento Gremial 2026 - Región Metropolitana, con foco de postulación en IME Conecta.",
  "IME Link 2027 se propone como sujeto de prueba estratégico para validar la infraestructura en un caso real de planificación, alianzas, comités, trazabilidad y proyección pública.",
  "El modelo separa dirección estratégica, carteras directivas, comités ejecutivos y operación valorizable, incorporando gobernanza de datos y criterios de la Ley 21.719.",
].join("\n\n");

export const documentLinks = [
  {
    label: "Informe DOCX",
    path: "/docs/Informe_IME_Conecta_Gobernanza_Operacional_actualizado.docx",
    meta: "Documento editable",
  },
  {
    label: "Informe PDF",
    path: "/docs/Informe_IME_Conecta_Gobernanza_Operacional_actualizado.pdf",
    meta: "Versión de lectura",
  },
  {
    label: "Presentacion PPTX",
    path: "/docs/IME_Conecta_Gobernanza_Operacional_Directorio.pptx",
    meta: "Deck editable",
  },
];
