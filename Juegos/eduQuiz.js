function buildEduQuiz(subject) {
  const isMath = (subject === 'sumas' || subject === 'tablas');
  const data = EDU_DATA[subject];
  const icon = isMath ? (subject==='sumas'?'➕':'✖️') : data.icon;
  container_eduRender(subject, isMath, data, icon);
}
window.buildEduQuiz = buildEduQuiz;
