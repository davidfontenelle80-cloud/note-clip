/**
 * storage.js — Note Clip PWA
 * Single localStorage key. State shape. CRUD helpers.
 * Everything that touches localStorage lives here.
 */
(function (App) {
  'use strict';

  const KEY = 'noteClip_v1';

  const NOTE_COLORS = ['yellow','lavender','sky','mint','coral','peach'];

  const DEFAULT_CATEGORIES = [
    { id: 'cat_work',    name: 'Work',       icon: '💼', color: '#BDD5EA' },
    { id: 'cat_medical', name: 'Medical',     icon: '🩺', color: '#C5E2C5' },
    { id: 'cat_personal',name: 'Personal',    icon: '👤', color: '#D4C5E2' },
    { id: 'cat_home',    name: 'Home',        icon: '🏠', color: '#F7D9B0' },
    { id: 'cat_docs',    name: 'Documents',   icon: '📄', color: '#F7F0B6' },
    { id: 'cat_followup',name: 'Follow-Up',   icon: '🔔', color: '#F2C4B0' },
    { id: 'cat_orders',  name: 'Orders',      icon: '📦', color: '#BDD5EA' },
    { id: 'cat_ideas',   name: 'Ideas',       icon: '💡', color: '#F7F0B6' },
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
      todayFocus: '',
      weatherEnabled: false,
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
    save(_state);
  }

  function updateSettings(patch) {
    _state.settings = Object.assign({}, _state.settings, patch);
    save(_state);
    return getState();
  }

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
      icon: '📝',
      color:'#F7F0B6',
    }, data);
    cat.id = cat.id || generateId();
    _state.categories.push(cat);
    save(_state);
    return cat;
  }

  function updateCategory(id, patch) {
    const idx = _state.categories.findIndex(c => c.id === id);
    if (idx < 0) return null;
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
      budget:    150,
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
    const itemData = (text && typeof text === 'object') ? text : { text };
    const item = Object.assign({
      id: generateId(),
      text: '',
      checked: false,
      price: 0,
      qty: 1,
      recurring: true,
      createdAt: new Date().toISOString(),
    }, itemData);
    item.id = item.id || generateId();
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

  function resetGroceryList(listId) {
    const list = _state.lists.find(l => l.id === listId);
    if (!list) return;
    list.items = list.items
      .filter(i => i.recurring !== false)
      .map(i => Object.assign({}, i, { checked: false }));
    save(_state);
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

  // ── getNotes helper ─────────────────────────────────────────────
  function getNotes() {
    return JSON.parse(JSON.stringify(_state.notes));
  }

  // ── updateListItem helper ────────────────────────────────────────
  function updateListItem(listId, itemId, text) {
    const list = _state.lists.find(l => l.id === listId);
    if (!list) return null;
    const item = list.items.find(i => i.id === itemId);
    if (!item) return null;
    if (text && typeof text === 'object') {
      Object.assign(item, text);
    } else {
      item.text = text;
    }
    save(_state);
    return item;
  }

  // ── updateListItemReminder ────────────────────────────────────────
  function updateListItemReminder(listId, itemId, reminderAt) {
    const list = _state.lists.find(l => l.id === listId);
    if (!list) return null;
    const item = list.items.find(i => i.id === itemId);
    if (!item) return null;
    item.reminderAt = reminderAt || '';
    save(_state);
    return item;
  }

  App.Storage = {
    generateId, getState, setState, updateSettings,
    addNote, updateNote, deleteNote,
    addCategory, updateCategory, deleteCategory,
    addList, updateList, deleteList, addListItem, toggleListItem, deleteListItem, resetList, resetGroceryList,
    addDraft, deleteDraft,
    addShared, deleteShared,
    exportJSON,
    NOTE_COLORS,
    getNotes, updateListItem, updateListItemReminder,
  };

})(window.App = window.App || {});
