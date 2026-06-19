/**
 * notes.js — Note Clip PWA
 * Notes + Categories tab. Full CRUD. Pastel cards. Delete visible on card.
 */
(function (App) {
  'use strict';

  let _view = 'categories'; // 'categories' | 'notes' | 'note-list'
  let _filterCatId = null;
  let _filterStatus = 'active';
  let _searchQuery = '';
  let _dateFilter = null;
  let _editingNoteId = null;
  let _editingCatId  = null;

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function _profileName() {
    return (App.Storage.getState().settings.username || '').trim();
  }

  const CATEGORY_ICON_GROUPS = [
    { key: 'notes_paper', label: { en: 'Notes & Paper', es: 'Notas y papel' }, icons: [
      ['ic_cat_note','Note','Nota'], ['ic_cat_sticky','Sticky note','Nota adhesiva'], ['ic_cat_notebook','Notebook','Cuaderno'], ['ic_cat_clipboard','Clipboard','Portapapeles'],
      ['ic_cat_paper_stack','Paper stack','Papeles'], ['ic_cat_bookmark','Bookmark','Marcador'], ['ic_cat_paperclip','Paper clip','Clip'], ['ic_cat_folder','Folder','Carpeta'],
      ['ic_cat_index_card','Index card','Tarjeta'], ['ic_cat_lined_note','Lined note','Nota rayada'], ['ic_cat_daily_note','Daily note','Nota diaria'], ['ic_cat_label_note','Label note','Etiqueta'],
    ] },
    { key: 'work', label: { en: 'Work', es: 'Trabajo' }, icons: [
      ['ic_cat_work_note','Work note','Nota de trabajo'], ['ic_cat_work_folder','Work folder','Carpeta de trabajo'], ['ic_cat_work_clipboard','Work clipboard','Portapapeles'], ['ic_cat_checklist','Checklist','Lista'],
      ['ic_cat_briefcase_note','Briefcase note','Nota laboral'], ['ic_cat_receipt','Receipt','Recibo'], ['ic_cat_task_note','Task note','Nota de tarea'], ['ic_cat_office_note','Office note','Nota de oficina'],
      ['ic_cat_client_note','Client note','Nota de cliente'], ['ic_cat_deadline_note','Deadline note','Fecha limite'],
    ] },
    { key: 'personal', label: { en: 'Personal', es: 'Personal' }, icons: [
      ['ic_cat_personal_card','Personal card','Tarjeta personal'], ['ic_cat_calendar','Calendar','Calendario'], ['ic_cat_reminder_bell','Reminder bell','Recordatorio'], ['ic_cat_star','Star','Estrella'],
      ['ic_cat_checkmark','Checkmark','Marca'], ['ic_cat_goal_note','Goal note','Meta'], ['ic_cat_habit_note','Habit note','Habito'], ['ic_cat_journal_note','Journal note','Diario'],
      ['ic_cat_birthday_note','Birthday note','Cumpleanos'], ['ic_cat_profile_note','Profile note','Perfil'],
    ] },
    { key: 'home', label: { en: 'Home', es: 'Hogar' }, icons: [
      ['ic_cat_home_note','Home note','Nota de hogar'], ['ic_cat_grocery_note','Grocery note','Nota de compras'], ['ic_cat_cleaning_note','Cleaning note','Limpieza'], ['ic_cat_meal_note','Meal note','Comida'],
      ['ic_cat_household_list','Household list','Lista del hogar'], ['ic_cat_repair_note','Repair note','Reparacion'], ['ic_cat_chore_note','Chore note','Tarea de casa'], ['ic_cat_garden_note','Garden note','Jardin'],
      ['ic_cat_utility_note','Utility note','Servicios'], ['ic_cat_recipe_card','Recipe card','Receta'],
    ] },
    { key: 'medical', label: { en: 'Medical', es: 'Salud' }, icons: [
      ['ic_cat_health_note','Health note','Nota de salud'], ['ic_cat_medicine_note','Medicine note','Medicina'], ['ic_cat_walking_note','Walking note','Caminar'], ['ic_cat_sleep_note','Sleep note','Descanso'],
      ['ic_cat_water_note','Water note','Agua'], ['ic_cat_appointment_note','Appointment note','Cita'], ['ic_cat_wellness_log','Wellness log','Registro'], ['ic_cat_care_note','Care note','Cuidado'],
      ['ic_cat_pharmacy_note','Pharmacy note','Farmacia'],
    ] },
    { key: 'finance', label: { en: 'Finance', es: 'Finanzas' }, icons: [
      ['ic_cat_budget_note','Budget note','Presupuesto'], ['ic_cat_bill_note','Bill note','Factura'], ['ic_cat_savings_note','Savings note','Ahorros'], ['ic_cat_invoice_note','Invoice note','Factura'],
      ['ic_cat_tax_folder','Tax folder','Impuestos'], ['ic_cat_expense_list','Expense list','Gastos'], ['ic_cat_payment_note','Payment note','Pago'], ['ic_cat_account_note','Account note','Cuenta'],
      ['ic_cat_price_note','Price note','Precio'], ['ic_cat_finance_receipt','Finance receipt','Recibo'],
    ] },
    { key: 'travel', label: { en: 'Travel', es: 'Viajes' }, icons: [
      ['ic_cat_travel_folder','Travel folder','Carpeta de viaje'], ['ic_cat_itinerary_note','Itinerary note','Itinerario'], ['ic_cat_map_note','Map note','Mapa'], ['ic_cat_packing_list','Packing list','Maleta'],
      ['ic_cat_reservation_note','Reservation note','Reserva'], ['ic_cat_route_note','Route note','Ruta'], ['ic_cat_fuel_receipt','Fuel receipt','Combustible'], ['ic_cat_trip_checklist','Trip checklist','Lista de viaje'],
      ['ic_cat_luggage_tag','Luggage tag','Etiqueta'], ['ic_cat_travel_label','Travel label','Etiqueta viaje'],
    ] },
    { key: 'education', label: { en: 'Education', es: 'Educacion' }, icons: [
      ['ic_cat_study_note','Study note','Estudio'], ['ic_cat_class_notebook','Class notebook','Clase'], ['ic_cat_reading_list','Reading list','Lectura'], ['ic_cat_lesson_note','Lesson note','Leccion'],
      ['ic_cat_assignment_clipboard','Assignment clipboard','Asignacion'], ['ic_cat_school_folder','School folder','Carpeta'], ['ic_cat_vocab_cards','Vocab cards','Vocabulario'], ['ic_cat_research_notes','Research notes','Investigacion'],
      ['ic_cat_course_checklist','Course checklist','Curso'], ['ic_cat_learning_goal','Learning goal','Meta'],
    ] },
    { key: 'shopping', label: { en: 'Shopping', es: 'Compras' }, icons: [
      ['ic_cat_shopping_list','Shopping list','Lista de compras'], ['ic_cat_coupon_note','Coupon note','Cupon'], ['ic_cat_receipt_note','Receipt note','Recibo'], ['ic_cat_order_label','Order label','Pedido'],
      ['ic_cat_returns_note','Returns note','Devolucion'], ['ic_cat_wishlist_note','Wishlist note','Deseos'], ['ic_cat_price_tag_note','Price tag','Precio'], ['ic_cat_pantry_list','Pantry list','Despensa'],
      ['ic_cat_store_note','Store note','Tienda'], ['ic_cat_purchase_plan','Purchase plan','Plan de compra'],
    ] },
    { key: 'meetings', label: { en: 'Meetings', es: 'Reuniones' }, icons: [
      ['ic_cat_agenda_note','Agenda note','Agenda'], ['ic_cat_meeting_notes','Meeting notes','Notas'], ['ic_cat_minutes_note','Minutes note','Minutas'], ['ic_cat_appointment_card','Appointment card','Cita'],
      ['ic_cat_attendee_list','Attendee list','Asistentes'], ['ic_cat_followup_flag','Follow-up flag','Seguimiento'], ['ic_cat_schedule_note','Schedule note','Horario'], ['ic_cat_call_agenda','Call agenda','Llamada'],
      ['ic_cat_planning_meeting','Planning note','Planificacion'],
    ] },
    { key: 'communication', label: { en: 'Communication', es: 'Comunicacion' }, icons: [
      ['ic_cat_message_note','Message note','Mensaje'], ['ic_cat_envelope_note','Envelope note','Correo'], ['ic_cat_contact_card','Contact card','Contacto'], ['ic_cat_announcement_note','Announcement note','Aviso'],
      ['ic_cat_reply_note','Reply note','Respuesta'], ['ic_cat_draft_note','Draft note','Borrador'], ['ic_cat_call_note','Call note','Llamada'], ['ic_cat_text_note','Text note','Texto'],
      ['ic_cat_email_note','Email note','Email'], ['ic_cat_contact_memo','Contact memo','Memo'],
    ] },
    { key: 'ideas', label: { en: 'Ideas', es: 'Ideas' }, icons: [
      ['ic_cat_idea_note','Idea note','Idea'], ['ic_cat_lightbulb_note','Lightbulb note','Idea'], ['ic_cat_pencil_note','Pencil note','Lapiz'], ['ic_cat_sketch_note','Sketch note','Boceto'],
      ['ic_cat_bookmark_note','Bookmark note','Marcador'], ['ic_cat_brainstorm_note','Brainstorm note','Lluvia de ideas'], ['ic_cat_outline_note','Outline note','Bosquejo'], ['ic_cat_concept_card','Concept card','Concepto'],
      ['ic_cat_inspiration_note','Inspiration note','Inspiracion'],
    ] },
    { key: 'projects', label: { en: 'Projects', es: 'Proyectos' }, icons: [
      ['ic_cat_project_folder','Project folder','Proyecto'], ['ic_cat_milestone_note','Milestone note','Hito'], ['ic_cat_task_board','Task board','Tablero'], ['ic_cat_launch_list','Launch list','Lanzamiento'],
      ['ic_cat_planning_note','Planning note','Plan'], ['ic_cat_roadmap_note','Roadmap note','Ruta'], ['ic_cat_review_note','Review note','Revision'], ['ic_cat_blocked_note','Blocked note','Bloqueado'],
      ['ic_cat_project_checklist','Project checklist','Checklist'], ['ic_cat_status_note','Status note','Estado'],
    ] },
    { key: 'archive', label: { en: 'Archive', es: 'Archivo' }, icons: [
      ['ic_cat_archive_box','Archive box','Caja'], ['ic_cat_filed_note','Filed note','Archivado'], ['ic_cat_record_folder','Record folder','Registro'], ['ic_cat_old_notes','Old notes','Notas viejas'],
      ['ic_cat_storage_label','Storage label','Etiqueta'], ['ic_cat_reference_stack','Reference stack','Referencias'], ['ic_cat_completed_file','Completed file','Completado'], ['ic_cat_backup_note','Backup note','Respaldo'],
      ['ic_cat_history_note','History note','Historial'],
    ] },
  ];

  const CAT_ICON_CLASS = {
    ic_cat_work: 'work', ic_cat_medical: 'health', ic_cat_personal: 'personal', ic_cat_home: 'home',
    ic_cat_documents: 'stack', ic_cat_followup: 'flag', ic_cat_orders: 'shipping', ic_cat_ideas: 'idea',
    ic_cat_note: 'note', ic_cat_sticky: 'sticky', ic_cat_notebook: 'notebook', ic_cat_clipboard: 'clipboard',
    ic_cat_paper_stack: 'stack', ic_cat_bookmark: 'bookmark', ic_cat_paperclip: 'paperclip', ic_cat_folder: 'folder',
    ic_cat_work_note: 'work', ic_cat_work_folder: 'folder', ic_cat_work_clipboard: 'clipboard', ic_cat_checklist: 'checklist',
    ic_cat_briefcase_note: 'work', ic_cat_receipt: 'receipt',
    ic_cat_home_note: 'home', ic_cat_grocery_note: 'checklist', ic_cat_cleaning_note: 'sparkle', ic_cat_meal_note: 'meal',
    ic_cat_household_list: 'checklist',
    ic_cat_health_note: 'health', ic_cat_medicine_note: 'medicine', ic_cat_walking_note: 'walking',
    ic_cat_sleep_note: 'sleep', ic_cat_water_note: 'water',
    ic_cat_personal_card: 'personal', ic_cat_calendar: 'calendar', ic_cat_reminder_bell: 'bell',
    ic_cat_star: 'star', ic_cat_checkmark: 'checkmark', ic_cat_goal_note: 'goal',
    ic_cat_idea_note: 'idea', ic_cat_lightbulb_note: 'idea', ic_cat_pencil_note: 'pencil',
    ic_cat_sketch_note: 'sketch', ic_cat_bookmark_note: 'bookmark',
    ic_cat_pinned_note: 'pinned', ic_cat_flag_note: 'flag', ic_cat_reminder_note: 'bell',
    ic_cat_clock_note: 'clock', ic_cat_checklist_note: 'checklist',
    ic_cat_package_note: 'package', ic_cat_shipping_label: 'shipping', ic_cat_order_receipt: 'receipt',
    ic_cat_delivery_note: 'delivery', ic_cat_order_checklist: 'checklist',
  };

  function _safeIconId(icon) {
    return App.Storage.sanitizeCategoryIcon
      ? App.Storage.sanitizeCategoryIcon(icon)
      : 'ic_cat_note';
  }

  function _isCustomEmojiIcon(icon) {
    return App.Storage.isCustomCategoryEmoji
      ? App.Storage.isCustomCategoryEmoji(icon)
      : false;
  }

  function _catClassForIcon(icon) {
    const safeIcon = _safeIconId(icon);
    if (_isCustomEmojiIcon(safeIcon)) return 'emoji';
    if (CAT_ICON_CLASS[safeIcon]) return CAT_ICON_CLASS[safeIcon];
    if (/folder|archive|filed|record|project/.test(safeIcon)) return 'folder';
    if (/stack|notes|cards|reference|old/.test(safeIcon)) return 'stack';
    if (/clipboard|assignment|board/.test(safeIcon)) return 'clipboard';
    if (/checklist|list|task|chore|course|packing|pantry|attendee|launch/.test(safeIcon)) return 'checklist';
    if (/receipt|bill|invoice|tax|expense|payment|budget|savings|price|finance|coupon/.test(safeIcon)) return 'receipt';
    if (/package|shipping|delivery|order|returns|purchase/.test(safeIcon)) return 'shipping';
    if (/travel|itinerary|map|route|reservation|luggage|trip/.test(safeIcon)) return 'delivery';
    if (/study|class|lesson|school|vocab|research|education|reading/.test(safeIcon)) return 'notebook';
    if (/meeting|agenda|minutes|appointment|schedule|call/.test(safeIcon)) return 'calendar';
    if (/message|envelope|reply|draft|email|contact|announcement|memo|text/.test(safeIcon)) return 'personal';
    if (/home|repair|utility|recipe|garden/.test(safeIcon)) return 'home';
    if (/grocery|meal|store|shopping/.test(safeIcon)) return 'meal';
    if (/health|care|wellness|pharmacy|medicine/.test(safeIcon)) return 'health';
    if (/water/.test(safeIcon)) return 'water';
    if (/sleep/.test(safeIcon)) return 'sleep';
    if (/walking/.test(safeIcon)) return 'walking';
    if (/idea|brainstorm|concept|inspiration|lightbulb/.test(safeIcon)) return 'idea';
    if (/pencil|outline/.test(safeIcon)) return 'pencil';
    if (/sketch/.test(safeIcon)) return 'sketch';
    if (/flag|followup|blocked/.test(safeIcon)) return 'flag';
    if (/bell|reminder/.test(safeIcon)) return 'bell';
    if (/clock|deadline|history/.test(safeIcon)) return 'clock';
    if (/goal|milestone|roadmap|status|review/.test(safeIcon)) return 'goal';
    if (/bookmark|label|tag/.test(safeIcon)) return 'bookmark';
    if (/star|birthday|wishlist/.test(safeIcon)) return 'star';
    return 'note';
  }

  function _iconOption(id) {
    if (_isCustomEmojiIcon(id)) return [id, App.I18n.t('cat_custom_emoji'), App.I18n.t('cat_custom_emoji')];
    for (const group of CATEGORY_ICON_GROUPS) {
      const found = group.icons.find(icon => icon[0] === id);
      if (found) return found;
    }
    return CATEGORY_ICON_GROUPS[0].icons[0];
  }

  function _iconLabel(id) {
    if (_isCustomEmojiIcon(id)) return `${App.I18n.t('cat_custom_emoji')}: ${id}`;
    const icon = _iconOption(id);
    return App.I18n.current() === 'es' ? icon[2] : icon[1];
  }

  const DEFAULT_CATEGORY_LABEL_KEYS = {
    cat_work: 'cat_default_work',
    cat_medical: 'cat_default_medical',
    cat_personal: 'cat_default_personal',
    cat_home: 'cat_default_home',
    cat_docs: 'cat_default_docs',
    cat_followup: 'cat_default_followup',
    cat_orders: 'cat_default_orders',
    cat_ideas: 'cat_default_ideas',
  };

  function _categoryDisplayName(cat) {
    const key = cat && DEFAULT_CATEGORY_LABEL_KEYS[cat.id];
    return key ? App.I18n.t(key) : (cat?.name || '');
  }

  // Render category icons as the same paper/stationery family as the nav.
  function _iconHtml(icon, cls) {
    const safeIcon = _safeIconId(icon);
    if (_isCustomEmojiIcon(safeIcon)) {
      return `<span class="cat-emoji-icon${cls === 'chip-icon-img' ? ' cat-emoji-chip' : ''}" aria-hidden="true">${_esc(safeIcon)}</span>`;
    }
    const catClass = _catClassForIcon(safeIcon);
    if (catClass && cls === 'chip-icon-img') {
      return `<span class="cat-chip-stationery cat-${catClass}" aria-hidden="true"></span>`;
    }
    return `<span class="cat-stationery cat-${catClass}" aria-hidden="true"><span class="cat-mark"></span></span>`;
  }

  // ── Status Tabs ───────────────────────────────────────────────────
  function buildStatusTabs() {
    const statuses = ['active','awaiting','followup','hold','toread','completed','archived'];
    return `<div class="status-tabs">
      ${statuses.map(s => `
        <button class="status-tab${_filterStatus === s ? ' active' : ''}"
          onclick="App.Notes._setStatus('${s}')">
          ${App.I18n.t('status_'+s)}
        </button>`).join('')}
    </div>`;
  }

  // ── Category Grid ─────────────────────────────────────────────────
  function buildCategoryGrid(state) {
    if (!state.categories.length) {
      return `<div class="empty-state">
        <div class="empty-state-icon"><span class="empty-stationery empty-notes" aria-hidden="true"><span></span></span></div>
        <div class="empty-state-text">${App.I18n.t('categories')}</div>
        <div class="empty-state-sub">${App.I18n.t('tap_plus')}</div>
      </div>`;
    }
    const cards = state.categories.map(cat => {
      const count = state.notes.filter(n => n.categoryId === cat.id).length;
      const catClass = CAT_ICON_CLASS[_safeIconId(cat.icon)] || 'note';
      return `<div class="category-card category-${catClass}" role="button" tabindex="0"
        onclick="App.Notes._viewCat('${cat.id}')"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();App.Notes._viewCat('${cat.id}')}">
        <div class="category-card-top">
          <div class="category-icon-wrap">${_iconHtml(cat.icon)}</div>
          <div style="display:flex;gap:4px;flex-shrink:0">
            <button class="card-delete-btn"
              onclick="event.stopPropagation();App.Notes._editCat('${cat.id}')" title="Edit">✎</button>
            <button class="card-delete-btn"
              onclick="event.stopPropagation();App.Notes._deleteCat('${cat.id}')" title="Delete">×</button>
          </div>
        </div>
        <div class="category-name">${_esc(_categoryDisplayName(cat))}</div>
        <div class="category-count">${count} ${App.I18n.t('notes')}</div>
      </div>`;
    }).join('');
    return `<div class="category-grid">${cards}</div>`;
  }

  // ── Note Card ─────────────────────────────────────────────────────
  function buildNoteCard(note, state) {
    const cat = state.categories.find(c => c.id === note.categoryId);
    const title = note.title || note.body.slice(0, 50);
    const body  = note.body && note.title ? note.body : '';
    const date  = note.dueDate
      ? new Date(note.dueDate).toLocaleDateString(App.I18n.current() === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' })
      : new Date(note.createdAt).toLocaleDateString(App.I18n.current() === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' });
    const pClass = {
      critical:'priority-urgent', urgent:'priority-urgent',
      high:'priority-high', medium:'priority-medium',
      low:'priority-low', optional:'priority-low'
    }[note.priority] || 'priority-medium';

    return `<div class="note-card" data-color="${_esc(note.color || 'yellow')}" role="button" tabindex="0"
      onclick="App.Notes._editNote('${note.id}')"
      onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();App.Notes._editNote('${note.id}')}">
      <div class="note-card-header">
        <div class="note-card-title">${_esc(title)}</div>
        <button class="card-delete-btn"
          onclick="event.stopPropagation();App.Notes._deleteNote('${note.id}')" title="Delete">×</button>
      </div>
      ${body ? `<div class="note-card-body">${_esc(body.slice(0,120))}${body.length>120?'…':''}</div>` : ''}
      <div class="note-card-footer">
        <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap">
          ${note.priority !== 'medium' ? `<span class="priority-badge ${pClass}">${App.I18n.t('priority_'+note.priority)}</span>` : ''}
          ${cat ? `<span class="chip">${_iconHtml(cat.icon,'chip-icon-img')} ${_esc(_categoryDisplayName(cat))}</span>` : ''}
        </div>
        <div style="display:flex;gap:4px;align-items:center">
          <span class="note-card-date">${date}</span>
          ${note.status !== 'active'
            ? `<span class="chip" style="font-size:0.65rem">${App.I18n.t('status_'+note.status)}</span>`
            : ''}
        </div>
      </div>
      ${note.address ? `<div style="font-size:var(--text-xs);color:rgba(0,0,0,.5);margin-top:4px">${_esc(note.locationName || note.address)}</div>` : ''}
    </div>`;
  }

  // ── Notes Grid View ───────────────────────────────────────────────
  function buildNotesGrid(state) {
    let notes = state.notes;
    if (_filterCatId) notes = notes.filter(n => n.categoryId === _filterCatId);

    // Status filter
    if (_filterStatus === 'archived') {
      notes = notes.filter(n => n.archived);
    } else if (_filterStatus === 'completed') {
      notes = notes.filter(n => n.completed && !n.archived);
    } else {
      notes = notes.filter(n => !n.archived && !n.completed && n.status === _filterStatus);
    }

    // Date filter (from calendar tap)
    if (_dateFilter) {
      notes = notes.filter(n => n.dueDate && n.dueDate.slice(0,10) === _dateFilter);
    }

    // Search filter
    if (_searchQuery) {
      const q = _searchQuery.toLowerCase();
      notes = notes.filter(n =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.body  || '').toLowerCase().includes(q)
      );
    }

    // Sort: overdue → today → future (date asc) → no-date; then priority, then newest
    const today = new Date().toISOString().slice(0, 10);
    const _priOrder = { critical:0, urgent:0, high:1, medium:2, low:3, optional:4 };
    notes = [...notes].sort((a, b) => {
      const ad = a.dueDate || null, bd = b.dueDate || null;
      const aScore = !ad ? 3 : ad < today ? 0 : ad === today ? 1 : 2;
      const bScore = !bd ? 3 : bd < today ? 0 : bd === today ? 1 : 2;
      if (aScore !== bScore) return aScore - bScore;
      if (ad && bd && ad !== bd) return ad.localeCompare(bd);
      const ap = _priOrder[a.priority] ?? 2, bp = _priOrder[b.priority] ?? 2;
      if (ap !== bp) return ap - bp;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    const searchBar = `
      <div class="search-bar-wrap" style="margin-bottom:var(--space-md)">
        <input id="notes-search" class="form-input" type="search"
          placeholder="${App.I18n.t('notes_search')}"
          value="${_esc(_searchQuery)}"
          oninput="App.Notes._setSearch(this.value)">
      </div>`;

    if (!notes.length) {
      const name = _profileName();
      const firstNoteText = !_searchQuery && name
        ? App.I18n.t('empty_first_note_named', { name: _esc(name) })
        : App.I18n.t('no_notes');
      return searchBar + `<div class="empty-state">
        <div class="empty-state-icon"><span class="empty-stationery empty-notes" aria-hidden="true"><span></span></span></div>
        <div class="empty-state-text">${firstNoteText}</div>
        <div class="empty-state-sub">${_searchQuery ? 'No results — try a different search' : App.I18n.t('tap_plus')}</div>
      </div>`;
    }
    return searchBar + `<div class="notes-grid">${notes.map(n => buildNoteCard(n, state)).join('')}</div>`;
  }

  // ── Main Render ───────────────────────────────────────────────────
  function render() {
    const el = document.getElementById('pane-notes');
    if (!el) return;
    const state = App.Storage.getState();

    const catName = _filterCatId
      ? _categoryDisplayName(state.categories.find(c => c.id === _filterCatId))
      : '';

    const viewTabs = `
      <div class="status-tabs" style="margin-bottom:var(--space-md)">
        <button class="status-tab${_view==='categories'?' active':''}"
          onclick="App.Notes._setView('categories')">${App.I18n.t('by_category')}</button>
        <button class="status-tab${_view!=='categories'?' active':''}"
          onclick="App.Notes._setView('notes')">${App.I18n.t('all_notes')}</button>
      </div>`;

    let content = '';
    if (_view === 'categories') {
      content = buildCategoryGrid(state);
    } else if (_view === 'notes') {
      content = buildStatusTabs() + buildNotesGrid(state);
    } else if (_view === 'note-list') {
      // Notes for a specific category
      content = `
        <button class="btn btn-secondary btn-sm" onclick="App.Notes._setView('categories')" style="margin-bottom:var(--space-md)">
          ← ${App.I18n.t('categories')}
        </button>
        <div class="section-header">
          <span class="section-title">${_esc(catName)}</span>
        </div>
        ${buildStatusTabs()}
        ${buildNotesGrid(state)}`;
    }

    el.innerHTML = `
      <div class="section-header">
        <span class="section-title">${_view === 'note-list' ? '' : App.I18n.t(_view==='categories'?'categories':'all_notes')}</span>
      </div>
      ${_view !== 'note-list' ? viewTabs : ''}
      ${content}
    `;
  }

  // ── Navigation ────────────────────────────────────────────────────
  function _setView(v) {
    _view = v;
    if (v !== 'note-list') _filterCatId = null;
    render();
  }

  function _viewCat(catId) {
    _filterCatId = catId;
    _view = 'note-list';
    render();
  }

  function _setStatus(s) {
    _filterStatus = s;
    render();
  }

  function _setSearch(q) {
    _searchQuery = q || '';
    // Debounce: re-render on input without full page rebuild
    const state = App.Storage.getState();
    const gridEl = document.querySelector('.notes-grid, .empty-state');
    const wrapEl = gridEl ? gridEl.closest('.notes-grid, .search-bar-wrap')?.parentElement : null;
    render();
  }

  // ── Note Modal ────────────────────────────────────────────────────
  function _openNoteModal(note) {
    const state = App.Storage.getState();
    const isEdit = !!note;
    const n = note || {
      title: '', body: '', color: 'yellow', categoryId: null,
      priority: 'medium', status: 'active',
      dueDate: '', dueTime: '', reminder: '',
      appointmentName: '', appointmentDatetime: '', leaveBy: '',
      locationName: '', address: '',
    };

    const colorRow = App.Storage.NOTE_COLORS.map(c => {
      const hex = { lavender:'#D4C5E2', sky:'#BDD5EA', mint:'#C5E2C5', yellow:'#F7F0B6', coral:'#F2C4B0', peach:'#F7D9B0' }[c];
      return `<div class="color-swatch${n.color===c?' selected':''}" style="background:${hex}"
        data-color="${c}" onclick="App.Notes._pickColor('${c}')"></div>`;
    }).join('');

    const catOptions = state.categories.map(c =>
      `<option value="${c.id}"${n.categoryId===c.id?' selected':''}>${_esc(_categoryDisplayName(c))}</option>`
    ).join('');

    const priorityOpts = ['critical','high','medium','low','optional'].map(p =>
      `<option value="${p}"${n.priority===p?' selected':''}>${App.I18n.t('priority_'+p)}</option>`
    ).join('');

    const statusOpts = ['active','awaiting','followup','hold','toread'].map(s =>
      `<option value="${s}"${n.status===s?' selected':''}>${App.I18n.t('status_'+s)}</option>`
    ).join('');

    const mapsBlock = n.address ? `
      <div style="display:flex;flex-wrap:wrap;gap:var(--space-sm);margin-top:var(--space-sm)">
        <button class="share-btn" onclick="App.Notes._openAppleMaps()">${App.I18n.t('open_maps')}</button>
        <button class="share-btn" onclick="App.Notes._openGoogleMaps()">${App.I18n.t('open_gmaps')}</button>
        <button class="share-btn copy" onclick="App.Notes._copyAddress()">${App.I18n.t('copy_address')}</button>
      </div>` : '';

    const html = `
      <div id="note-modal" class="modal-backdrop" onclick="if(event.target===this)App.Notes._closeModal()">
        <div class="modal-sheet">
          <div class="modal-handle"></div>
          <div class="modal-title">${isEdit ? App.I18n.t('edit_note') : App.I18n.t('add_note')}</div>

          <div class="form-group">
            <label class="form-label">${App.I18n.t('note_title')}</label>
            <input id="note-title" class="form-input" placeholder="${App.I18n.t('note_title_ph')}" value="${_esc(n.title)}">
          </div>
          <div class="form-group">
            <label class="form-label">${App.I18n.t('note_body')}</label>
            <textarea id="note-body" class="form-textarea" placeholder="${App.I18n.t('note_body_ph')}">${_esc(n.body)}</textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${App.I18n.t('note_priority')}</label>
              <select id="note-priority" class="form-select">${priorityOpts}</select>
            </div>
            <div class="form-group">
              <label class="form-label">${App.I18n.t('note_status')}</label>
              <select id="note-status" class="form-select">${statusOpts}</select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">${App.I18n.t('note_category')}</label>
            <select id="note-cat" class="form-select">
              <option value="">— none —</option>
              ${catOptions}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">${App.I18n.t('note_color')}</label>
            <div class="color-row" id="color-row">${colorRow}</div>
          </div>

          <details open style="margin-bottom:var(--space-md)">
            <summary style="font-size:var(--text-sm);font-weight:600;cursor:pointer;padding:8px 0;color:var(--color-text-muted)">
              ${App.I18n.t('note_due_reminder')}
            </summary>
            <div style="padding-top:var(--space-sm)">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">${App.I18n.t('note_due')}</label>
                  <input type="date" id="note-due" class="form-input" value="${_esc(n.dueDate)}">
                </div>
                <div class="form-group">
                  <label class="form-label">${App.I18n.t('note_due_time')}</label>
                  <input type="time" id="note-due-time" class="form-input" value="${_esc(n.dueTime)}">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">${App.I18n.t('note_reminder')}</label>
                <select id="note-reminder" class="form-select">
                  <option value="">— none —</option>
                  <option value="same_day"${n.reminder==='same_day'?' selected':''}>Same day (8am)</option>
                  <option value="day_before"${n.reminder==='day_before'?' selected':''}>Day before</option>
                  <option value="1h_before"${n.reminder==='1h_before'?' selected':''}>1 hour before</option>
                  <option value="2h_before"${n.reminder==='2h_before'?' selected':''}>2 hours before</option>
                </select>
              </div>
            </div>
          </details>

          <details style="margin-bottom:var(--space-md)">
            <summary style="font-size:var(--text-sm);font-weight:600;cursor:pointer;padding:8px 0;color:var(--color-text-muted)">
              ${App.I18n.t('note_appt_location')}
            </summary>
            <div style="padding-top:var(--space-sm)">
              <div class="form-group">
                <label class="form-label">${App.I18n.t('note_appt')}</label>
                <input id="note-appt-name" class="form-input" placeholder="Appointment name…" value="${_esc(n.appointmentName)}">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">${App.I18n.t('note_appt_dt')}</label>
                  <input type="datetime-local" id="note-appt-dt" class="form-input" value="${_esc(n.appointmentDatetime)}">
                </div>
                <div class="form-group">
                  <label class="form-label">${App.I18n.t('note_leave_by')}</label>
                  <input type="time" id="note-leave" class="form-input" value="${_esc(n.leaveBy)}">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">${App.I18n.t('note_location')}</label>
                <input id="note-location" class="form-input" placeholder="Location name…" value="${_esc(n.locationName)}">
              </div>
              <div class="form-group">
                <label class="form-label">${App.I18n.t('note_address')}</label>
                <input id="note-address" class="form-input" placeholder="Full address…" value="${_esc(n.address)}">
              </div>
              ${mapsBlock}
            </div>
          </details>

          <div class="modal-actions sticky-actions">
            ${isEdit ? `
              <button class="btn btn-danger btn-sm" onclick="App.Notes._deleteNote('${n.id}',true)">
                ${App.I18n.t('delete')}
              </button>
              ${n.completed
                ? `<button class="btn btn-secondary btn-sm" onclick="App.Notes._reopenNote('${n.id}')">↩ Reopen</button>`
                : `<button class="btn btn-secondary btn-sm" onclick="App.Notes._completeNote('${n.id}')">✓</button>`}
              ${n.archived
                ? `<button class="btn btn-secondary btn-sm" onclick="App.Notes._restoreNote('${n.id}')">${App.I18n.t('restore')}</button>`
                : `<button class="btn btn-secondary btn-sm" onclick="App.Notes._archiveNote('${n.id}')">${App.I18n.t('archive')}</button>`}
            ` : ''}
            <button class="btn btn-secondary" onclick="App.Notes._closeModal()">${App.I18n.t('cancel')}</button>
            <button class="btn btn-primary" onclick="App.Notes._saveNote('${isEdit ? n.id : ''}')">${App.I18n.t('save')}</button>
          </div>
        </div>
      </div>`;

    document.body.insertAdjacentHTML('beforeend', html);
    App.enhanceModal?.('note-modal');
    document.getElementById('note-title').focus();
    _selectedNoteColor = n.color || 'yellow';
  }

  let _selectedNoteColor = 'yellow';

  function _pickColor(c) {
    _selectedNoteColor = c;
    document.querySelectorAll('#color-row .color-swatch').forEach(sw => {
      sw.classList.toggle('selected', sw.dataset.color === c);
    });
  }

  function _saveNote(id) {
    const title    = document.getElementById('note-title')?.value.trim() || '';
    const body     = document.getElementById('note-body')?.value.trim()  || '';
    const priority = document.getElementById('note-priority')?.value || 'medium';
    const status   = document.getElementById('note-status')?.value   || 'active';
    const catId    = document.getElementById('note-cat')?.value       || null;
    const dueDate  = document.getElementById('note-due')?.value       || '';
    const dueTime  = document.getElementById('note-due-time')?.value  || '';
    const reminder = document.getElementById('note-reminder')?.value  || '';
    const apptName = document.getElementById('note-appt-name')?.value || '';
    const apptDt   = document.getElementById('note-appt-dt')?.value   || '';
    const leaveBy  = document.getElementById('note-leave')?.value     || '';
    const locName  = document.getElementById('note-location')?.value  || '';
    const address  = document.getElementById('note-address')?.value   || '';

    if (!title && !body) { App.showToast(App.I18n.t('toast_enter_title'), 'error'); return; }

    const patch = {
      title, body, priority, status, color: _selectedNoteColor,
      categoryId: catId || null,
      dueDate, dueTime, reminder, appointmentName: apptName,
      appointmentDatetime: apptDt, leaveBy, locationName: locName, address,
    };

    if (id) {
      App.Storage.updateNote(id, patch);
      App.showToast(App.I18n.t('toast_note_updated'), 'success');
    } else {
      App.Storage.addNote(patch);
      App.showToast(App.I18n.t('toast_note_saved'), 'success');
    }
    _closeModal();
    render();
    if (document.getElementById('pane-calendar')?.classList.contains('active')) App.Calendar?.render();
    App.Reminders?.checkDue();
  }

  function _editNote(id) {
    const state = App.Storage.getState();
    const note = state.notes.find(n => n.id === id);
    if (!note) return;
    _editingNoteId = id;
    _openNoteModal(note);
  }

  function _deleteNote(id, fromModal) {
    if (!confirm('Delete this note?')) return;
    App.Storage.deleteNote(id);
    if (fromModal) _closeModal();
    App.showToast(App.I18n.t('toast_note_deleted'), 'success');
    render();
  }

  function _completeNote(id) {
    App.Storage.updateNote(id, { completed: true, status: 'completed' });
    _closeModal();
    App.showToast(App.I18n.t('toast_note_completed'), 'success');
    render();
  }

  function _archiveNote(id) {
    App.Storage.updateNote(id, { archived: true });
    _closeModal();
    App.showToast(App.I18n.t('toast_note_archived'), 'success');
    render();
  }

  function _restoreNote(id) {
    App.Storage.updateNote(id, { archived: false });
    _closeModal();
    App.showToast(App.I18n.t('toast_note_restored'), 'success');
    render();
  }

  function _reopenNote(id) {
    App.Storage.updateNote(id, { completed: false, status: 'active' });
    _closeModal();
    App.showToast(App.I18n.t('toast_note_reopened'), 'success');
    render();
  }

  function _openAppleMaps() {
    const addr = document.getElementById('note-address')?.value || '';
    if (addr) window.open(`https://maps.apple.com/?q=${encodeURIComponent(addr)}`,'_blank');
  }
  function _openGoogleMaps() {
    const addr = document.getElementById('note-address')?.value || '';
    if (addr) window.open(`https://maps.google.com/?q=${encodeURIComponent(addr)}`,'_blank');
  }
  function _copyAddress() {
    const addr = document.getElementById('note-address')?.value || '';
    if (addr) {
      navigator.clipboard.writeText(addr).then(() => App.showToast(App.I18n.t('toast_address_copied'),'success'));
    }
  }

  function _categoryIconPickerHtml(selectedIcon) {
    const lang = App.I18n.current() === 'es' ? 'es' : 'en';
    const safeIcon = _safeIconId(selectedIcon);
    const isCustom = _isCustomEmojiIcon(safeIcon);
    return `
      <input id="cat-icon" type="hidden" value="${_esc(safeIcon)}">
      <div class="cat-icon-selected" aria-live="polite">
        <div id="cat-icon-preview" class="cat-icon-selected-preview">${_iconHtml(safeIcon)}</div>
        <div>
          <div class="cat-icon-selected-label">${App.I18n.t('cat_icon_selected')}</div>
          <div id="cat-icon-selected-name" class="cat-icon-selected-name">${_esc(_iconLabel(safeIcon))}</div>
        </div>
      </div>
      <div class="cat-icon-picker" role="radiogroup" aria-label="${App.I18n.t('cat_icon')}">
        <div class="cat-icon-curated-label">${App.I18n.t('cat_curated_icons')}</div>
        ${CATEGORY_ICON_GROUPS.map(group => `
          <section class="cat-icon-group" aria-label="${_esc(group.label[lang])}">
            <div class="cat-icon-group-title">${_esc(group.label[lang])}</div>
            <div class="cat-icon-grid">
              ${group.icons.map(icon => {
                const id = icon[0];
                const selected = id === safeIcon;
                return `<button type="button" class="cat-icon-option${selected ? ' selected' : ''}"
                  role="radio" aria-checked="${selected ? 'true' : 'false'}"
                  data-icon="${_esc(id)}" onclick="App.Notes._selectCatIcon('${_esc(id)}')">
                  ${_iconHtml(id)}
                  <span>${_esc(lang === 'es' ? icon[2] : icon[1])}</span>
                </button>`;
              }).join('')}
            </div>
          </section>
        `).join('')}
        <section class="cat-icon-group cat-custom-emoji-section" aria-label="${App.I18n.t('cat_custom_emoji')}">
          <div class="cat-icon-group-title">${App.I18n.t('cat_custom_emoji')}</div>
          <div class="cat-custom-emoji-panel">
            <div class="cat-custom-emoji-copy">${App.I18n.t('cat_custom_emoji_sub')}</div>
            <div class="cat-custom-emoji-row">
              <input id="cat-custom-emoji" class="form-input cat-emoji-input" inputmode="text" autocomplete="off"
                maxlength="12" placeholder="${App.I18n.t('cat_custom_emoji_ph')}" value="${isCustom ? _esc(safeIcon) : ''}"
                oninput="App.Notes._selectCustomEmoji(this.value,false)">
              <button type="button" class="btn btn-secondary btn-sm" onclick="App.Notes._selectCustomEmoji(document.getElementById('cat-custom-emoji')?.value,true)">
                ${App.I18n.t('cat_use_emoji')}
              </button>
            </div>
            <div id="cat-custom-emoji-help" class="settings-row-sub">${App.I18n.t('cat_custom_emoji_help')}</div>
          </div>
        </section>
      </div>`;
  }

  function _selectCatIcon(icon) {
    const safeIcon = _safeIconId(icon);
    const input = document.getElementById('cat-icon');
    if (!input) return;
    input.value = safeIcon;
    const preview = document.getElementById('cat-icon-preview');
    const label = document.getElementById('cat-icon-selected-name');
    if (preview) preview.innerHTML = _iconHtml(safeIcon);
    if (label) label.textContent = _iconLabel(safeIcon);
    const customInput = document.getElementById('cat-custom-emoji');
    if (customInput && !_isCustomEmojiIcon(safeIcon)) customInput.value = '';
    document.querySelectorAll('.cat-icon-option').forEach(btn => {
      const selected = btn.dataset.icon === safeIcon;
      btn.classList.toggle('selected', selected);
      btn.setAttribute('aria-checked', selected ? 'true' : 'false');
    });
  }

  function _selectCustomEmoji(value, showError) {
    const emoji = String(value || '').trim();
    const help = document.getElementById('cat-custom-emoji-help');
    if (!emoji) {
      if (help) help.textContent = App.I18n.t('cat_custom_emoji_help');
      return;
    }
    if (!_isCustomEmojiIcon(emoji)) {
      if (help) help.textContent = App.I18n.t('cat_invalid_emoji');
      if (showError) App.showToast(App.I18n.t('cat_invalid_emoji'), 'error');
      return;
    }
    const input = document.getElementById('cat-icon');
    const preview = document.getElementById('cat-icon-preview');
    const label = document.getElementById('cat-icon-selected-name');
    if (input) input.value = emoji;
    if (preview) preview.innerHTML = _iconHtml(emoji);
    if (label) label.textContent = _iconLabel(emoji);
    if (help) help.textContent = App.I18n.t('cat_custom_emoji_selected');
    document.querySelectorAll('.cat-icon-option').forEach(btn => {
      btn.classList.remove('selected');
      btn.setAttribute('aria-checked', 'false');
    });
  }

  function _closeModal() {
    document.getElementById('note-modal')?.remove();
    document.getElementById('cat-modal')?.remove();
    document.getElementById('cat-delete-modal')?.remove();
    App.restoreFocus?.();
    _editingNoteId = null;
    _editingCatId  = null;
  }

  // ── Category Modal ────────────────────────────────────────────────
  function _openCatModal(cat) {
    const isEdit = !!cat;
    const c = cat || { name: '', icon: 'ic_cat_note', color: '#F7F0B6' };
    const icon = _safeIconId(c.icon);

    const html = `
      <div id="cat-modal" class="modal-backdrop" onclick="if(event.target===this)App.Notes._closeModal()">
        <div class="modal-sheet cat-modal-sheet">
          <div class="modal-handle"></div>
          <div class="modal-title">${isEdit ? App.I18n.t('edit_category') : App.I18n.t('add_category')}</div>
          <div class="form-group">
            <label class="form-label">${App.I18n.t('cat_name')}</label>
            <input id="cat-name" class="form-input" placeholder="Category name…" value="${_esc(c.name)}">
          </div>
          <div class="form-group">
            <label class="form-label">${App.I18n.t('cat_icon')}</label>
            ${_categoryIconPickerHtml(icon)}
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" onclick="App.Notes._closeModal()">${App.I18n.t('cancel')}</button>
            <button class="btn btn-primary" onclick="App.Notes._saveCat('${isEdit?c.id:''}')">${App.I18n.t('save')}</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);
    App.enhanceModal?.('cat-modal');
    document.getElementById('cat-name').focus();
  }

  function _editCat(id) {
    const state = App.Storage.getState();
    const cat = state.categories.find(c => c.id === id);
    if (!cat) return;
    _editingCatId = id;
    _openCatModal(cat);
  }

  function _saveCat(id) {
    const name = document.getElementById('cat-name')?.value.trim() || '';
    const icon = _safeIconId(document.getElementById('cat-icon')?.value || 'ic_cat_note');
    if (!name) { App.showToast(App.I18n.t('toast_cat_name_req'), 'error'); return; }
    if (id) {
      App.Storage.updateCategory(id, { name, icon });
      App.showToast(App.I18n.t('toast_cat_updated'), 'success');
    } else {
      App.Storage.addCategory({ name, icon });
      App.showToast(App.I18n.t('toast_cat_added'), 'success');
    }
    _closeModal();
    render();
  }

  function _deleteCat(id) {
    const state = App.Storage.getState();
    const noteCount = state.notes.filter(n => n.categoryId === id).length;
    if (noteCount > 0) {
      // Show choose modal
      const html = `
        <div id="cat-delete-modal" class="modal-backdrop" onclick="if(event.target===this)App.Notes._closeModal()">
          <div class="modal-sheet">
            <div class="modal-handle"></div>
            <div class="modal-title">${App.I18n.t('delete_category')}</div>
            <p style="margin-bottom:var(--space-md);color:var(--color-text-muted)">${App.I18n.t('cat_delete_q')}</p>
            <div class="modal-actions" style="flex-direction:column">
              <button class="btn btn-secondary w-full" onclick="App.Notes._confirmDeleteCat('${id}',false)">
                ${App.I18n.t('cat_delete_tag')}
              </button>
              <button class="btn btn-danger w-full" onclick="App.Notes._confirmDeleteCat('${id}',true)">
                ${App.I18n.t('cat_delete_all')}
              </button>
              <button class="btn btn-secondary w-full" onclick="App.Notes._closeModal()">${App.I18n.t('cancel')}</button>
            </div>
          </div>
        </div>`;
      document.body.insertAdjacentHTML('beforeend', html);
      App.enhanceModal?.('cat-delete-modal');
    } else {
      if (!confirm('Delete this category?')) return;
      App.Storage.deleteCategory(id, false);
      App.showToast(App.I18n.t('toast_cat_deleted'), 'success');
      render();
    }
  }

  function _confirmDeleteCat(id, deleteNotes) {
    App.Storage.deleteCategory(id, deleteNotes);
    App.showToast(App.I18n.t('toast_cat_deleted'), 'success');
    _closeModal();
    render();
  }

  // ── FAB handler (called by app.js) ─────────
  function onFab() {
    if (_view === 'categories') {
      _openCatModal(null);
    } else {
      _openNoteModal(null);
    }
  }

  // ── Date filter (called from calendar date tap) ───────────────────
  function filterByDate(dateStr) {
    _dateFilter = dateStr || null;
    _view = 'notes';
    render();
    // Auto-clear after 10s so normal browsing resumes
    setTimeout(() => {
      if (_dateFilter === dateStr) {
        _dateFilter = null;
        render();
      }
    }, 10000);
  }

  App.Notes = {
    render, onFab, filterByDate,
    _setView, _viewCat, _setStatus, _setSearch,
    _editNote, _deleteNote, _completeNote, _archiveNote, _restoreNote, _reopenNote,
    _openNoteModal, _closeModal, _saveNote, _pickColor,
    _editCat, _saveCat, _deleteCat, _confirmDeleteCat,
    _selectCatIcon, _selectCustomEmoji,
    _openAppleMaps, _openGoogleMaps, _copyAddress,
  };

})(window.App = window.App || {});
