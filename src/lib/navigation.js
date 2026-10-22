// Hand a question to the consultation screen. It lands in the input box for the
// seeker to review; nothing is sent (or charged) until they press send.
export function askInConsult(app, question, mode = 'general') {
  if (question) sessionStorage.setItem('pending_chart_query', question);
  app.setCurrentMode?.(mode);
  app.setCurrentPage('dashboard');
}
