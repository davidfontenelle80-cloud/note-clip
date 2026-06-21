/**
 * storage.js â Note Clip PWA
 * Single localStorage key. State shape. CRUD helpers.
 * Everything that touches localStorage lives here.
 */
(function (App) {
  'use strict';

  const KEY = 'noteClip_v1';

  const NOTE_COLORS = ['yellow','lavender','sky','mint','coral','peach'];

  const DEFAULT_CATEGORIES = [
    { id: 'cat_work',    name: 'Work',       icon: 'ð¼', color: '#BDD5EA' },
    { id: 'cat_medical', name: 'Medical',     icon: 'ð©º', color: '#C5E2C5' },
    { id: 'cat_personal',name: 'Personal',    icon: 'ð¤', color: '#D4C5E2' },
    { id: 'cat_home',    name: 'Home',        icon: 'ð ', color: '#F7D9B0' },
    { id: 'cat_docs',    name: 'Documents',   icon: 'ð', color: '#F7F0B6' },
    { id: 'cat_followup',name: 'Follow-Up',   icon: 'ð', color: '#F2C4B0' },
    { id: 'cat_orders',  name: 'Orders',      icon: 'ð¦', color: '#BDD5EA' },
    { id: 'cat_ideas',   name: 'Ideas',       icon: 'ð¡', color: '#F7F0B6' },
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

  // ââ ID generator ââââââââââââââââââââââââââââââââââââââââââââââââ
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // ââ Read / Write âââââââââââââââââââââââââââââââââââââââââââââââââ
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

  // ââ In-memory state ââââââââââââââââââââââââââââââââââââââââââââââ
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

  // ââ Note helpers âââââââââââââââââââââââââââââââââââââââââââââââââ
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

  // ââ Category helpers âââââââââââââââââââââââââââââââââââââââââââââ
  function addCategory(data) {
    const cat = Object.assign({
      id:   generateId(),
      name: '',
      icon: 'ð',
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

  // ââ List helpers âââââââââââââââââââââââââââââââââââââââââââââââââ
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

  // ââ Draft helpers âââââââââââââââââââââââââââââââââââââââââââââââââ
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

  // ââ Shared helpers ââââââââââââââââââââââââââââââââââââââââââââââââ
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

  // ââ Export ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  function exportJSON() {
    const data = getState();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `note-clip-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ââ getNotes helper âââââââââââââââââââââââââââââââââââââââââââââ
  function getNotes() {
    return JSON.parse(JSON.stringify(_state.notes));
  }

  // ââ updateListItem helper ââââââââââââââââââââââââââââââââââââââââ
  function updateListItem(listId, itemId, text) {
    const list = _state.lists.find(l => l.id === listId);
    if (!list) return null;
    const item = list.items.find(i => i.id === itemId);
    if (!item) return null;
    item.text = text;
    save(_state);
    return item;
  }

  // ââ updateListItemReminder ââââââââââââââââââââââââââââââââââââââââ
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
    addList, updateList, deleteList, addListItem, toggleListItem, deleteListItem, resetList,
    addDraft, deleteDraft,
    addShared, deleteShared,
    exportJSON,
    NOTE_COLORS,
    getNotes, updateListItem, updateListItemReminder,
  };

})(window.App = window.App || {});
