/**
 * fab-hotfix.js — robust FAB routing for Note Clip.
 * Keeps the global + button aligned with the currently visible tab and Notes view.
 */
(function (App) {
  'use strict';

  function activeTabName() {
    const activeNav = document.querySelector('.nav-tab.active[data-tab]');
    if (activeNav?.dataset?.tab) return activeNav.dataset.tab;

    const activePane = document.querySelector('.tab-pane.active[id^="pane-"]');
    if (activePane?.id) return activePane.id.replace(/^pane-/, '');

    return 'dashboard';
  }

  function notesIsCategoryView() {
    const pane = document.getElementById('pane-notes');
    if (!pane?.classList.contains('active')) return false;

    // Category view can be a populated grid or an empty-state card.
    if (pane.querySelector('.category-grid, .category-card')) return true;

    const activeToggle = Array.from(pane.querySelectorAll('.status-tab.active'))
      .find(btn => (btn.textContent || '').trim().toLowerCase().includes('category'));
    return !!activeToggle;
  }

  function openCategoryModal() {
    if (typeof App.Notes?._openCatModal === 'function') {
      App.Notes._openCatModal(null);
      return true;
    }
    if (typeof App.Notes?.onFab === 'function') {
      App.Notes.onFab();
      return true;
    }
    return false;
  }

  function routeFab(event) {
    const target = event.target?.closest?.('#fab');
    if (!target) return;

    const tab = activeTabName();

    // Own the click before older listeners can misroute it.
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();

    if (tab === 'notes') {
      if (notesIsCategoryView()) {
        openCategoryModal();
      } else {
        App.Notes?._openNoteModal?.(null);
      }
      return;
    }

    if (tab === 'lists') {
      App.Lists?.onFab?.();
      return;
    }

    if (tab === 'calendar' || tab === 'dashboard') {
      App.Notes?._openNoteModal?.(null);
      return;
    }
  }

  function install() {
    if (window.__noteClipFabHotfixReady) return;
    window.__noteClipFabHotfixReady = true;
    document.addEventListener('click', routeFab, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})(window.App = window.App || {});
