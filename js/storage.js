/**
 * storage.js — Note Clip PWA
 * Single localStorage key. State shape. CRUD helpers.
 * Everything that touches localStorage lives here.
 */
(function (App) {
  'use strict';

  const KEY = 'noteClip_v1';

  const NOTE_COLORS = ['yellow','lavender','sky','mint','coral','peach'];
  const SAFE_CATEGORY_ICON_IDS = new Set(`
    ic_cat_note ic_cat_sticky ic_cat_notebook ic_cat_clipboard ic_cat_paper_stack ic_cat_bookmark ic_cat_paperclip ic_cat_folder
    ic_cat_index_card ic_cat_lined_note ic_cat_daily_note ic_cat_label_note
    ic_cat_work_note ic_cat_work_folder ic_cat_work_clipboard ic_cat_checklist ic_cat_briefcase_note ic_cat_receipt ic_cat_task_note ic_cat_office_note ic_cat_client_note ic_cat_deadline_note
    ic_cat_personal_card ic_cat_calendar ic_cat_reminder_bell ic_cat_star ic_cat_checkmark ic_cat_goal_note ic_cat_habit_note ic_cat_journal_note ic_cat_birthday_note ic_cat_profile_note
    ic_cat_home_note ic_cat_grocery_note ic_cat_cleaning_note ic_cat_meal_note ic_cat_household_list ic_cat_repair_note ic_cat_chore_note ic_cat_garden_note ic_cat_utility_note ic_cat_recipe_card
    ic_cat_health_note ic_cat_medicine_note ic_cat_walking_note ic_cat_sleep_note ic_cat_water_note ic_cat_appointment_note ic_cat_wellness_log ic_cat_care_note ic_cat_pharmacy_note
    ic_cat_budget_note ic_cat_bill_note ic_cat_savings_note ic_cat_invoice_note ic_cat_tax_folder ic_cat_expense_list ic_cat_payment_note ic_cat_account_note ic_cat_price_note ic_cat_finance_receipt
    ic_cat_travel_folder ic_cat_itinerary_note ic_cat_map_note ic_cat_packing_list ic_cat_reservation_note ic_cat_route_note ic_cat_fuel_receipt ic_cat_trip_checklist ic_cat_luggage_tag ic_cat_travel_label
    ic_cat_study_note ic_cat_class_notebook ic_cat_reading_list ic_cat_lesson_note ic_cat_assignment_clipboard ic_cat_school_folder ic_cat_vocab_cards ic_cat_research_notes ic_cat_course_checklist ic_cat_learning_goal
    ic_cat_shopping_list ic_cat_coupon_note ic_cat_receipt_note ic_cat_order_label ic_cat_returns_note ic_cat_wishlist_note ic_cat_price_tag_note ic_cat_pantry_list ic_cat_store_note ic_cat_purchase_plan
    ic_cat_agenda_note ic_cat_meeting_notes ic_cat_minutes_note ic_cat_appointment_card ic_cat_attendee_list ic_cat_followup_flag ic_cat_schedule_note ic_cat_call_agenda ic_cat_planning_meeting
    ic_cat_message_note ic_cat_envelope_note ic_cat_contact_card ic_cat_announcement_note ic_cat_reply_note ic_cat_draft_note ic_cat_call_note ic_cat_text_note ic_cat_email_note ic_cat_contact_memo
    ic_cat_idea_note ic_cat_lightbulb_note ic_cat_pencil_note ic_cat_sketch_note ic_cat_bookmark_note ic_cat_brainstorm_note ic_cat_outline_note ic_cat_concept_card ic_cat_inspiration_note
    ic_cat_project_folder ic_cat_milestone_note ic_cat_task_board ic_cat_launch_list ic_cat_planning_note ic_cat_roadmap_note ic_cat_review_note ic_cat_blocked_note ic_cat_project_checklist ic_cat_status_note
    ic_cat_pinned_note ic_cat_flag_note ic_cat_reminder_note ic_cat_clock_note ic_cat_checklist_note
    ic_cat_package_note ic_cat_shipping_label ic_cat_order_receipt ic_cat_delivery_note ic_cat_order_checklist
    ic_cat_archive_box ic_cat_filed_note ic_cat_record_folder ic_cat_old_notes ic_cat_storage_label ic_cat_reference_stack ic_cat_completed_file ic_cat_backup_note ic_cat_history_note
  `.trim().split(/\s+/));
  const UNSAFE_CUSTOM_EMOJI = new Set([
    '✝','☦','☪','☯','🕉','✡','🔯','🛐','⛪','🕌','🛕','⛩','🕋',
    '☠','💀','👻','😈','👿','🪄','🔮','🧙',
    '🗡','⚔','🔫','🪓','💣','🧨','🩸','⚰','🪦','⚕','🏥','🚑',
  ]);
  const CATEGORY_ICON_ALIASES = {
    'ic_cat_work': 'ic_cat_work_note',
    'ic_cat_medical': 'ic_cat_health_note',
    'ic_cat_personal': 'ic_cat_personal_card',
    'ic_cat_home': 'ic_cat_home_note',
    'ic_cat_documents': 'ic_cat_paper_stack',
    'ic_cat_followup': 'ic_cat_flag_note',
    'ic_cat_orders': 'ic_cat_shipping_label',
    'ic_cat_ideas': 'ic_cat_idea_note',
    '\u{1F4DD}': 'ic_cat_note',
    '\u{1F4CC}': 'ic_cat_pinned_note',
    '\u{1F4C1}': 'ic_cat_folder',
    '\u{1F4CB}': 'ic_cat_clipboard',
    '\u{2B50}': 'ic_cat_star',
  };

  function sanitizeCategoryIcon(icon) {
    const raw = String(icon || '').trim();
    const mapped = CATEGORY_ICON_ALIASES[raw] || raw;
    if (SAFE_CATEGORY_ICON_IDS.has(mapped)) return mapped;
    return isCustomCategoryEmoji(raw) ? raw : 'ic_cat_note';
  }

  function isCustomCategoryEmoji(icon) {
    const raw = String(icon || '').trim();
    if (!raw || raw.startsWith('ic_') || raw.length > 12) return false;
    if ([...UNSAFE_CUSTOM_EMOJI].some(symbol => raw.includes(symbol))) return false;
    const segmentCount = typeof Intl !== 'undefined' && Intl.Segmenter
      ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(raw)).length
      : Array.from(raw).length;
    if (segmentCount !== 1) return false;
    return /\p{Extended_Pictographic}/u.test(raw) || /\p{Emoji_Presentation}/u.test(raw);
  }

  function sanitizeCategories(categories) {
    const source = Array.isArray(categories) ? categories : DEFAULT_CATEGORIES;
    return source.map(cat => Object.assign({}, cat, {
      icon: sanitizeCategoryIcon(cat && cat.icon),
    }));
  }

  const DEFAULT_CATEGORIES = [
    { id: 'cat_work',    name: 'Work',       icon: 'ic_cat_work_note',      color: '#BDD5EA' },
    { id: 'cat_medical', name: 'Medical',     icon: 'ic_cat_health_note',    color: '#C5E2C5' },
    { id: 'cat_personal',name: 'Personal',    icon: 'ic_cat_personal_card',  color: '#D4C5E2' },
    { id: 'cat_home',    name: 'Home',        icon: 'ic_cat_home_note',      color: '#F7D9B0' },
    { id: 'cat_docs',    name: 'Documents',   icon: 'ic_cat_paper_stack',    color: '#F7F0B6' },
    { id: 'cat_followup',name: 'Follow-Up',   icon: 'ic_cat_flag_note',      color: '#F2C4B0' },
    { id: 'cat_orders',  name: 'Orders',      icon: 'ic_cat_shipping_label', color: '#BDD5EA' },
    { id: 'cat_ideas',   name: 'Ideas',       icon: 'ic_cat_idea_note',      color: '#F7F0B6' },
  ];

  const DEFAULT_STATE = {
    version: 1,
    settings: {
      language: 'en',
      theme: 'light',
      username: '',
      defaultReminderTime: '08:00',
      reminderPopups: true,
      reminderNotifications: false,
      defaultListBehavior: 'reusable',
      cloudSync: false,
      lastCloudBackupAt: '',
      lastCloudRestoreAt: '',
      todayFocus: '',
    },
    categories: DEFAULT_CATEGORIES,
    notes: [],
    lists: [],
    sharedItems: [],
    drafts: [],
    quickNotes: [],
  };

  // ── ID generator ────────────────────────────────────────────────
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // ── Read / Write ─────────────────────────────────────────────────
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      const saved = JSON.parse(raw);
      // Merge any new top-level keys from DEFAULT_STATE (forward compatibility)
      const merged = Object.assign({}, DEFAULT_STATE, saved);
      merged.settings = Object.assign({}, DEFAULT_STATE.settings, saved.settings || {});
      merged.categories = sanitizeCategories(merged.categories);
      return merged;
    } catch (e) {
      console.error('[Storage] load failed:', e);
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.error('[Storage] save failed:', e);
    }
  }

  // ── In-memory state ──────────────────────────────────────────────
  let _state = load();

  function getState() {
    return JSON.parse(JSON.stringify(_state));
  }

  function setState(newState) {
    _state = JSON.parse(JSON.stringify(newState));
    _state.categories = sanitizeCategories(_state.categories);
    save(_state);
  }

  function updateSettings(patch) {
    _state.settings = Object.assign({}, _state.settings, patch);
    save(_state);
    return getState();
  }

  // ── Convenience getters ──────────────────────────────────────────
  function getNotes() { return JSON.parse(JSON.stringify(_state.notes)); }
  function getLists() { return JSON.parse(JSON.stringify(_state.lists)); }

  // ── Note helpers ─────────────────────────────────────────────────
  function nextColor() {
    // Cycle through note colors based on count
    return NOTE_COLORS[_state.notes.length % NOTE_COLORS.length];
  }

  function addNote(data) {
    const note = Object.assign({
      id:          generateId(),
      title:       '',
      body:        '',
      categoryId:  null,
      color:       nextColor(),
      status:      'active',
      priority:    'medium',
      dueDate:     '',
      dueTime:     '',
      reminder:    '',
      appointmentName: '',
      appointmentDatetime: '',
      leaveBy:     '',
      locationName:'',
      address:     '',
      archived:    false,
      completed:   false,
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    }, data);
    note.id = note.id || generateId();
    _state.notes.unshift(note);
    save(_state);
    return note;
  }

  function updateNote(id, patch) {
    const idx = _state.notes.findIndex(n => n.id === id);
    if (idx < 0) return null;
    _state.notes[idx] = Object.assign({}, _state.notes[idx], patch, { updatedAt: new Date().toISOString() });
    save(_state);
    return _state.notes[idx];
  }

  function deleteNote(id) {
    _state.notes = _state.notes.filter(n => n.id !== id);
    save(_state);
  }

  // ── Category helpers ─────────────────────────────────────────────
  function addCategory(data) {
    const cat = Object.assign({
      id:   generateId(),
      name: '',
      icon: 'ic_cat_note',
      color:'#F7F0B6',
    }, data);
    cat.id = cat.id || generateId();
    cat.icon = sanitizeCategoryIcon(cat.icon);
    _state.categories.push(cat);
    save(_state);
    return cat;
  }

  function updateCategory(id, patch) {
    const idx = _state.categories.findIndex(c => c.id === id);
    if (idx < 0) return null;
    if (Object.prototype.hasOwnProperty.call(patch, 'icon')) {
      patch = Object.assign({}, patch, { icon: sanitizeCategoryIcon(patch.icon) });
    }
    _state.categories[idx] = Object.assign({}, _state.categories[idx], patch);
    save(_state);
    return _state.categories[idx];
  }

  function deleteCategory(id, deleteNotes) {
    if (deleteNotes) {
      _state.notes = _state.notes.filter(n => n.categoryId !== id);
    } else {
      _state.notes.forEach(n => { if (n.categoryId === id) n.categoryId = null; });
    }
    _state.categories = _state.categories.filter(c => c.id !== id);
    save(_state);
  }

  // ── List helpers ─────────────────────────────────────────────────
  function addList(data) {
    const list = Object.assign({
      id:        generateId(),
      name:      '',
      type:      'reusable',
      items:     [],
      createdAt: new Date().toISOString(),
    }, data);
    list.id = list.id || generateId();
    _state.lists.unshift(list);
    save(_state);
    return list;
  }

  function updateList(id, patch) {
    const idx = _state.lists.findIndex(l => l.id === id);
    if (idx < 0) return null;
    _state.lists[idx] = Object.assign({}, _state.lists[idx], patch);
    save(_state);
    return _state.lists[idx];
  }

  function deleteList(id) {
    _state.lists = _state.lists.filter(l => l.id !== id);
    save(_state);
  }

  function addListItem(listId, text) {
    const idx = _state.lists.findIndex(l => l.id === listId);
    if (idx < 0) return;
    const item = { id: generateId(), text, checked: false, createdAt: new Date().toISOString() };
    _state.lists[idx].items.push(item);
    save(_state);
    return item;
  }

  function toggleListItem(listId, itemId) {
    const list = _state.lists.find(l => l.id === listId);
    if (!list) return;
    const item = list.items.find(i => i.id === itemId);
    if (item) item.checked = !item.checked;
    save(_state);
  }

  function deleteListItem(listId, itemId) {
    const list = _state.lists.find(l => l.id === listId);
    if (!list) return;
    list.items = list.items.filter(i => i.id !== itemId);
    save(_state);
  }

  function resetList(listId) {
    const list = _state.lists.find(l => l.id === listId);
    if (!list) return;
    list.items.forEach(i => { i.checked = false; });
    save(_state);
  }

  function updateListItem(listId, itemId, text) {
    const list = _state.lists.find(l => l.id === listId);
    if (!list) return;
    const item = list.items.find(i => i.id === itemId);
    if (item) { item.text = text; save(_state); }
  }

  // ── Draft helpers ─────────────────────────────────────────────────
  function addDraft(data) {
    const draft = Object.assign({
      id:        generateId(),
      type:      'message',
      context:   '',
      content:   '',
      language:  'en',
      createdAt: new Date().toISOString(),
    }, data);
    _state.drafts.unshift(draft);
    save(_state);
    return draft;
  }

  function deleteDraft(id) {
    _state.drafts = _state.drafts.filter(d => d.id !== id);
    save(_state);
  }

  // ── Shared helpers ────────────────────────────────────────────────
  function addShared(data) {
    const item = Object.assign({
      id:        generateId(),
      title:     '',
      content:   '',
      sharedAt:  new Date().toISOString(),
    }, data);
    _state.sharedItems.unshift(item);
    save(_state);
    return item;
  }

  function deleteShared(id) {
    _state.sharedItems = _state.sharedItems.filter(s => s.id !== id);
    save(_state);
  }

  // ── Export ────────────────────────────────────────────────────────
  function exportJSON() {
    const data = getState();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `note-clip-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  App.Storage = {
    generateId, getState, getNotes, getLists, setState, updateSettings,
    addNote, updateNote, deleteNote,
    addCategory, updateCategory, deleteCategory,
    addList, updateList, deleteList, addListItem, toggleListItem, deleteListItem, resetList, updateListItem,
    addDraft, deleteDraft,
    addShared, deleteShared,
    exportJSON,
    sanitizeCategoryIcon, isCustomCategoryEmoji,
    NOTE_COLORS,
  };

})(window.App = window.App || {});
