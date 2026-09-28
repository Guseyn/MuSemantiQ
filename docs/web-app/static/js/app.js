/*
Not a module, on purpose, and loaded before anything else.

e-sidebar decides whether to open itself the moment EHTML activates it, by
reading sessionStorage — so the choice has to already be made by then. A module
script is deferred and would run too late, which is why this is a classic one.

The sidebar starts open, unless the reader pinned it closed with ⇧ + P — the
same key e-sidebar reads to stop the pointer from opening it again:

  sessionStorage['e-sidebar-open']   opens it when it activates
  localStorage['sidebarIsPinned']    set by ⇧ + P, cleared by ⇧ + U
*/
(function openTheSidebarUnlessPinned() {
  try {
    if (localStorage.getItem('sidebarIsPinned') !== 'true') {
      sessionStorage.setItem('e-sidebar-open', 'true')
    }
  } catch (error) {
    // Private windows and blocked site data. The sidebar still works, it just
    // starts collapsed, so there is nothing to do about it here.
  }
})()
