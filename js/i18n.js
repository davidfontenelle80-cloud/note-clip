/**
 * i18n.js — QuickNotes bilingual support (English / Spanish)
 * Pattern: KHub.I18n.t('key'), data-i18n="key" on elements.
 */
(function () {
  'use strict';

  const STRINGS = {
    en: {
      // App
      'app.name': 'QuickNotes',

      // Tabs
      'tab.dashboard':     'Dashboard',
      'tab.categories':    'Categories',
      'tab.lists':         'Lists',
      'tab.shared':        'Shared',
      'tab.communication': 'Communication',
      'tab.settings':      'Settings',

      // Greeting
      'greeting.morning':   'Good morning',
      'greeting.afternoon': 'Good afternoon',
      'greeting.evening':   'Good evening',
      'greeting.night':     'Good night',

      // Onboarding
      'onboard.title':   'Welcome!',
      'onboard.sub':     "Let's personalize your experience. What should we call you?",
      'onboard.ph':      'Your name',
      'onboard.btn':     'Get Started',

      // Dashboard
      'dash.quickNote':  'Quick Note',
      'dash.qn.sub':     'Capture it before it slips away',
      'dash.today':      "Today's Tasks",
      'dash.upcoming':   'Upcoming',
      'dash.noToday':    'No tasks today — you\'re clear!',
      'dash.noUpcoming': 'No upcoming reminders',
      'dash.seeAll':     'See all',

      // Notes
      'note.new':         'New Note',
      'note.edit':        'Edit Note',
      'note.title':       'Title',
      'note.body':        'Note',
      'note.title.ph':    "What's on your mind?",
      'note.body.ph':     'Add details...',
      'note.save':        'Save Note',
      'note.next':        'Next →',
      'note.complete':    'Complete',
      'note.archive':     'Archive',
      'note.restore':     'Restore',
      'note.delete':      'Delete',
      'note.edit.btn':    'Edit',
      'note.detail':      'Note Details',

      // Categorization
      'cat.title':     'Categorize',
      'cat.status':    'Status',
      'cat.priority':  'Priority',
      'cat.category':  'Category',
      'cat.dueDate':   'Due Date',
      'cat.dueTime':   'Due Time',
      'cat.reminder':  'Reminder',
      'cat.location':  'Location Name',
      'cat.address':   'Address',
      'cat.save':      'Save',

      // Status
      'status.active':           'Active',
      'status.awaitingResponse': 'Awaiting Response',
      'status.followUp':         'Follow-Up',
      'status.hold':             'Hold',
      'status.toRead':           'To Read',
      'status.completed':        'Completed',
      'status.archived':         'Archived',

      // Priority
      'priority.critical': 'Critical',
      'priority.high':     'High',
      'priority.medium':   'Medium',
      'priority.low':      'Low',
      'priority.optional': 'Optional',

      // Reminder options
      'remind.dayBefore':     'Day Before',
      'remind.hoursBefore':   '2 hrs before',
      'remind.30min':         '30 min before',
      'remind.atTime':        'At Due Time',
      'remind.custom':        'Custom',
      'remind.leaveReminder': 'Leave-Time Reminder',
      'remind.leaveAt':       'Leave At',
      'remind.appointmentAt': 'Appointment At',

      // Categories tab
      'cats.title':   'Categories',
      'cats.new':     'New Category',
      'cats.edit':    'Edit Category',
      'cats.name':    'Name',
      'cats.icon':    'Icon',
      'cats.empty':   'No items in this category',
      'cats.delete':  'Delete Category',
      'cats.addNote': 'Add Note',

      // Lists
      'lists.title':        'Lists',
      'lists.new':          'New List',
      'lists.edit':         'Edit List',
      'lists.name':         'List Name',
      'lists.type':         'List Type',
      'lists.type.reusable':'Reusable',
      'lists.type.goal':    'Goal-Based',
      'lists.type.template':'Template',
      'lists.behavior':     'When item is checked:',
      'lists.move':         'Move to Completed',
      'lists.strike':       'Strikethrough in place',
      'lists.addItem':      'Add item...',
      'lists.add.btn':      'Add',
      'lists.resetAll':     'Reset All',
      'lists.completed':    'Completed',
      'lists.empty':        'No items yet',
      'lists.delete':       'Delete List',
      'lists.noLists':      'No lists yet',
      'lists.useTemplate':  'Use Template',

      // Shared
      'shared.title':     'Shared',
      'shared.new':       'Share New',
      'shared.create':    'Create Shared Item',
      'shared.content':   'Content',
      'shared.perm':      'Permission',
      'shared.viewOnly':  'View Only',
      'shared.comment':   'Can Comment',
      'shared.edit':      'Can Edit',
      'shared.copyLink':  'Copy Link',
      'shared.whatsapp':  'WhatsApp',
      'shared.text':      'Text',
      'shared.email':     'Email',
      'shared.empty':     'Nothing shared yet',
      'shared.lastEdit':  'Last edited',

      // Communication
      'comm.title':     'Communication',
      'comm.new':       'New Message',
      'comm.subject':   'Subject',
      'comm.body':      'Message Body',
      'comm.format':    'Send As',
      'comm.copy':      'Copy Text',
      'comm.send':      'Send',
      'comm.fromNote':  'From Note',
      'comm.drafts':    'Drafts',
      'comm.noDrafts':  'No drafts yet',
      'comm.output':    'Output Preview',
      'comm.polish':    'Polish',

      // Settings
      'settings.title':        'Settings',
      'settings.account':      'Account',
      'settings.name':         'Your Name',
      'settings.change':       'Change',
      'settings.appearance':   'Appearance',
      'settings.theme':        'Theme',
      'settings.theme.dark':   'Dark',
      'settings.theme.light':  'Light',
      'settings.theme.system': 'System',
      'settings.language':     'Language',
      'settings.prefs':        'Preferences',
      'settings.reminder':     'Default Reminder',
      'settings.behavior':     'List Completion',
      'settings.move':         'Move to Completed',
      'settings.strike':       'Strikethrough',
      'settings.data':         'Data & Sync',
      'settings.notif':        'Notifications',
      'settings.notifOn':      'Enabled',
      'settings.notifOff':     'Tap to Enable',
      'settings.cloud':        'Cloud Sync',
      'settings.cloudOff':     'Not configured',
      'settings.export':       'Export Data',
      'settings.import':       'Import Data',
      'settings.clear':        'Clear All Data',
      'settings.clearConfirm': 'Delete everything? This cannot be undone.',

      // Address
      'addr.openApple':  'Open in Apple Maps',
      'addr.openGoogle': 'Open in Google Maps',
      'addr.copy':       'Copy Address',

      // Actions
      'action.add':     'Add',
      'action.save':    'Save',
      'action.cancel':  'Cancel',
      'action.delete':  'Delete',
      'action.edit':    'Edit',
      'action.close':   'Close',
      'action.done':    'Done',
      'action.back':    '← Back',
      'action.confirm': 'Confirm',
      'action.create':  'Create',
      'action.copy':    'Copy',
      'action.copied':  'Copied!',
      'action.share':   'Share',
      'action.open':    'Open',

      // Misc
      'misc.today':     'Today',
      'misc.tomorrow':  'Tomorrow',
      'misc.overdue':   'Overdue',
      'misc.noItems':   'Nothing here yet',
      'misc.tapAdd':    'Tap + to add your first item',
      'misc.all':       'All',
      'misc.active':    'Active',
      'misc.done':      'Done',

      // Calendar months
      'cal.months': 'January,February,March,April,May,June,July,August,September,October,November,December',
      'cal.days':   'Su,Mo,Tu,We,Th,Fr,Sa',

      // Date action modal
      'dateAction.title':      'Add to',
      'dateAction.note':       'Note / Task',
      'dateAction.reminder':   'Reminder',
      'dateAction.appt':       'Appointment',

      // Toasts
      'toast.saved':    'Saved',
      'toast.deleted':  'Deleted',
      'toast.copied':   'Copied!',
      'toast.archived': 'Archived',
      'toast.restored': 'Restored',
      'toast.complete': 'Marked complete',
    },

    es: {
      'app.name': 'QuickNotes',

      'tab.dashboard':     'Panel',
      'tab.categories':    'Categorías',
      'tab.lists':         'Listas',
      'tab.shared':        'Compartido',
      'tab.communication': 'Comunicación',
      'tab.settings':      'Ajustes',

      'greeting.morning':   'Buenos días',
      'greeting.afternoon': 'Buenas tardes',
      'greeting.evening':   'Buenas noches',
      'greeting.night':     'Buenas noches',

      'onboard.title': '¡Bienvenido!',
      'onboard.sub':   '¿Cómo quieres que te llamemos?',
      'onboard.ph':    'Tu nombre',
      'onboard.btn':   'Comenzar',

      'dash.quickNote':  'Nota Rápida',
      'dash.qn.sub':     'Captúralo antes de que se te olvide',
      'dash.today':      'Tareas de Hoy',
      'dash.upcoming':   'Próximas',
      'dash.noToday':    '¡Sin tareas hoy, estás libre!',
      'dash.noUpcoming': 'Sin recordatorios próximos',
      'dash.seeAll':     'Ver todo',

      'note.new':         'Nueva Nota',
      'note.edit':        'Editar Nota',
      'note.title':       'Título',
      'note.body':        'Nota',
      'note.title.ph':    '¿Qué tienes en mente?',
      'note.body.ph':     'Agregar detalles...',
      'note.save':        'Guardar Nota',
      'note.next':        'Siguiente →',
      'note.complete':    'Completar',
      'note.archive':     'Archivar',
      'note.restore':     'Restaurar',
      'note.delete':      'Eliminar',
      'note.edit.btn':    'Editar',
      'note.detail':      'Detalles de Nota',

      'cat.title':    'Categorizar',
      'cat.status':   'Estado',
      'cat.priority': 'Prioridad',
      'cat.category': 'Categoría',
      'cat.dueDate':  'Fecha de Vencimiento',
      'cat.dueTime':  'Hora de Vencimiento',
      'cat.reminder': 'Recordatorio',
      'cat.location': 'Nombre del Lugar',
      'cat.address':  'Dirección',
      'cat.save':     'Guardar',

      'status.active':           'Activo',
      'status.awaitingResponse': 'Esperando Respuesta',
      'status.followUp':         'Seguimiento',
      'status.hold':             'En Espera',
      'status.toRead':           'Para Leer',
      'status.completed':        'Completado',
      'status.archived':         'Archivado',

      'priority.critical': 'Crítico',
      'priority.high':     'Alto',
      'priority.medium':   'Medio',
      'priority.low':      'Bajo',
      'priority.optional': 'Opcional',

      'remind.dayBefore':     'Día Anterior',
      'remind.hoursBefore':   '2 hrs antes',
      'remind.30min':         '30 min antes',
      'remind.atTime':        'A la Hora',
      'remind.custom':        'Personalizado',
      'remind.leaveReminder': 'Recordatorio de Salida',
      'remind.leaveAt':       'Salir A',
      'remind.appointmentAt': 'Cita A',

      'cats.title':   'Categorías',
      'cats.new':     'Nueva Categoría',
      'cats.edit':    'Editar Categoría',
      'cats.name':    'Nombre',
      'cats.icon':    'Icono',
      'cats.empty':   'Sin elementos en esta categoría',
      'cats.delete':  'Eliminar Categoría',
      'cats.addNote': 'Agregar Nota',

      'lists.title':         'Listas',
      'lists.new':           'Nueva Lista',
      'lists.edit':          'Editar Lista',
      'lists.name':          'Nombre de la Lista',
      'lists.type':          'Tipo de Lista',
      'lists.type.reusable': 'Reutilizable',
      'lists.type.goal':     'Por Objetivo',
      'lists.type.template': 'Plantilla',
      'lists.behavior':      'Al marcar un elemento:',
      'lists.move':          'Mover a Completados',
      'lists.strike':        'Tachar en su lugar',
      'lists.addItem':       'Agregar elemento...',
      'lists.add.btn':       'Agregar',
      'lists.resetAll':      'Restablecer Todo',
      'lists.completed':     'Completados',
      'lists.empty':         'Sin elementos aún',
      'lists.delete':        'Eliminar Lista',
      'lists.noLists':       'Sin listas aún',
      'lists.useTemplate':   'Usar Plantilla',

      'shared.title':    'Compartido',
      'shared.new':      'Compartir Nuevo',
      'shared.create':   'Crear Elemento Compartido',
      'shared.content':  'Contenido',
      'shared.perm':     'Permiso',
      'shared.viewOnly': 'Solo Ver',
      'shared.comment':  'Puede Comentar',
      'shared.edit':     'Puede Editar',
      'shared.copyLink': 'Copiar Enlace',
      'shared.whatsapp': 'WhatsApp',
      'shared.text':     'Texto',
      'shared.email':    'Correo',
      'shared.empty':    'Nada compartido aún',
      'shared.lastEdit': 'Última edición',

      'comm.title':    'Comunicación',
      'comm.new':      'Nuevo Mensaje',
      'comm.subject':  'Asunto',
      'comm.body':     'Cuerpo del Mensaje',
      'comm.format':   'Enviar Como',
      'comm.copy':     'Copiar Texto',
      'comm.send':     'Enviar',
      'comm.fromNote': 'Desde Nota',
      'comm.drafts':   'Borradores',
      'comm.noDrafts': 'Sin borradores aún',
      'comm.output':   'Vista Previa',
      'comm.polish':   'Pulir',

      'settings.title':        'Ajustes',
      'settings.account':      'Cuenta',
      'settings.name':         'Tu Nombre',
      'settings.change':       'Cambiar',
      'settings.appearance':   'Apariencia',
      'settings.theme':        'Tema',
      'settings.theme.dark':   'Oscuro',
      'settings.theme.light':  'Claro',
      'settings.theme.system': 'Sistema',
      'settings.language':     'Idioma',
      'settings.prefs':        'Preferencias',
      'settings.reminder':     'Recordatorio Predeterminado',
      'settings.behavior':     'Completar Lista',
      'settings.move':         'Mover a Completados',
      'settings.strike':       'Tachar',
      'settings.data':         'Datos y Sync',
      'settings.notif':        'Notificaciones',
      'settings.notifOn':      'Activadas',
      'settings.notifOff':     'Toca para Activar',
      'settings.cloud':        'Sincronización',
      'settings.cloudOff':     'No configurado',
      'settings.export':       'Exportar Datos',
      'settings.import':       'Importar Datos',
      'settings.clear':        'Borrar Todos los Datos',
      'settings.clearConfirm': '¿Eliminar todo? Esto no se puede deshacer.',

      'addr.openApple':  'Abrir en Apple Maps',
      'addr.openGoogle': 'Abrir en Google Maps',
      'addr.copy':       'Copiar Dirección',

      'action.add':     'Agregar',
      'action.save':    'Guardar',
      'action.cancel':  'Cancelar',
      'action.delete':  'Eliminar',
      'action.edit':    'Editar',
      'action.close':   'Cerrar',
      'action.done':    'Listo',
      'action.back':    '← Atrás',
      'action.confirm': 'Confirmar',
      'action.create':  'Crear',
      'action.copy':    'Copiar',
      'action.copied':  '¡Copiado!',
      'action.share':   'Compartir',
      'action.open':    'Abrir',

      'misc.today':    'Hoy',
      'misc.tomorrow': 'Mañana',
      'misc.overdue':  'Vencido',
      'misc.noItems':  'Nada aquí aún',
      'misc.tapAdd':   'Toca + para agregar',
      'misc.all':      'Todos',
      'misc.active':   'Activo',
      'misc.done':     'Hecho',

      'cal.months': 'Enero,Febrero,Marzo,Abril,Mayo,Junio,Julio,Agosto,Septiembre,Octubre,Noviembre,Diciembre',
      'cal.days':   'Do,Lu,Ma,Mi,Ju,Vi,Sá',

      'dateAction.title':    'Agregar a',
      'dateAction.note':     'Nota / Tarea',
      'dateAction.reminder': 'Recordatorio',
      'dateAction.appt':     'Cita',

      'toast.saved':    'Guardado',
      'toast.deleted':  'Eliminado',
      'toast.copied':   '¡Copiado!',
      'toast.archived': 'Archivado',
      'toast.restored': 'Restaurado',
      'toast.complete': 'Marcado como completado',
    }
  };

  let _lang = localStorage.getItem('qn_lang') || navigator.language.startsWith('es') ? 'es' : 'en';
  // Fix: above had short-circuit precedence issue - redo properly
  _lang = localStorage.getItem('qn_lang') || (navigator.language.startsWith('es') ? 'es' : 'en');

  function t(key) {
    return (STRINGS[_lang] && STRINGS[_lang][key]) || STRINGS['en'][key] || key;
  }

  function set(lang) {
    if (!STRINGS[lang]) return;
    _lang = lang;
    localStorage.setItem('qn_lang', lang);
    document.documentElement.lang = lang;
    applyToDOM();
    window.KHub.emit('lang:change', lang);
  }

  function applyToDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (key) el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.dataset.i18nPh;
      if (key) el.placeholder = t(key);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.dataset.i18nAria;
      if (key) el.setAttribute('aria-label', t(key));
    });
  }

  function current() { return _lang; }

  window.KHub = window.KHub || {};
  window.KHub.I18n = { t, set, current, applyToDOM };

  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.lang = _lang;
    applyToDOM();
  });
})();
