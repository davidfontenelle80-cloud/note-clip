/**
 * storage.js — Note Clip PWA
 * Single localStorage key. State shape. CRUD helpers.
 * Everything that touches localStorage lives here.
 */
(function (App) {
  'use strict';

  const KEY = 'noteClip_v1';

  const NOTE_COLORS = ['yellow','lavender','sky','mint','coral','peach'];
  const SAFE_CATEGORY_ICON_IDS = new Set([
    'ic_cat_note','ic_cat_sticky','ic_cat_notebook','ic_cat_clipboard','ic_cat_paper_stack','ic_cat_bookmark','ic_cat_paperclip','ic_cat_folder',
    'ic_cat_work_note','ic_cat_work_folder','ic_cat_work_clipboard','ic_cat_checklist','ic_cat_briefcase_note','ic_cat_receipt',
    'ic_cat_home_note','ic_cat_grocery_note','ic_cat_cleaning_note','ic_cat_meal_note','ic_cat_household_list',
    'ic_cat_health_note','ic_cat_medicine_note','ic_cat_walking_note','ic_cat_sleep_note','ic_cat_water_note',
    'ic_cat_personal_card','ic_cat_calendar','ic_cat_reminder_bell','ic_cat_star','ic_cat_checkmark','ic_cat_goal_note',
    'ic_cat_idea_note','ic_cat_lightbulb_note','ic_cat_pencil_note','ic_cat_sketch_note','ic_cat_bookmark_note',
    'ic_cat_pinned_note','ic_cat_flag_note','ic_cat_reminder_note','ic_cat_clock_note','ic_cat_checklist_note',
    'ic_cat_package_note','ic_cat_shipping_label','ic_cat_order_receipt','ic_cat_delivery_note','ic_cat_order_checklist',
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
    return SAFE_CATEGORY_ICON_IDS.has(mapped) ? mapped : 'ic_cat_note';
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
    sanitizeCategoryIcon,
    NOTE_COLORS,
  };

})(window.App = window.App || {});
