const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

const searchIndex = new WeakMap();
function searchableText(contest) {
  const source = [contest.titulo, contest.cargo, contest.curto, contest.banca, contest.bancaCurto, contest.nivel].join(' ');
  let cached = searchIndex.get(contest);
  if (!cached || cached.source !== source) {
    cached = {source, text: normalize(source)};
    searchIndex.set(contest, cached);
  }
  return cached.text;
}

export function filterContests(contests, {query = '', filter = 'all'} = {}) {
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  return contests.filter(contest => {
    if (filter === 'registered' && !contest.inscrita) return false;
    if (filter === 'watching' && contest.inscrita) return false;
    if (!words.length) return true;
    const text = searchableText(contest);
    return words.every(word => text.includes(word));
  });
}

export function nextDeadline(contests, today, registrationEnd) {
  let next = null;
  const consider = (contest, date, kind) => {
    if (date && date >= today && (!next || date < next.date || (date === next.date && kind === 'registration' && next.kind !== kind))) next = {contest, date, kind};
  };
  for (const contest of contests) {
    if (!contest.inscrita) consider(contest, registrationEnd(contest), 'registration');
    consider(contest, contest.prova, 'exam');
  }
  return next;
}
