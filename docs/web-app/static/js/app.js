/*
Not a module, on purpose, and loaded before anything else.

e-sidebar decides whether to open itself the moment EHTML activates it, by
reading sessionStorage — so the choice has to already be made by then. A module
script is deferred and would run too late, which is why this is a classic one.

e-sidebar was built as an app-shell icon rail: 4.5rem wide, expanding to 20rem
while the pointer is over it. A table of contents is not something to read
through a rail that closes when you reach for the scrollbar, so it is held open
instead. Two keys do that, and the component reads both on its own:

  sessionStorage['e-sidebar-open']   opens it when it activates
  localStorage['sidebarIsPinned']    stops the pointer from closing it again

The reader can still collapse it by hand on a narrow screen; this only decides
what it does when it starts.
*/
(function pinTheSidebar() {
  try {
    sessionStorage.setItem('e-sidebar-open', 'true')
    localStorage.setItem('sidebarIsPinned', 'true')
  } catch (error) {
    // Private windows and blocked site data. The sidebar still works, it just
    // starts collapsed, so there is nothing to do about it here.
  }
})()
