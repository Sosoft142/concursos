const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

export function filterContests(contests, {query = '', filter = 'all'} = {}) {
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  return contests.filter(contest => {
    if (filter === 'registered' && !contest.inscrita) return false;
    if (filter === 'watching' && contest.inscrita) return false;
    const text = normalize([contest.titulo, contest.cargo, contest.curto, contest.banca, contest.bancaCurto, contest.nivel].join(' '));
    return words.every(word => text.includes(word));
  });
}

export function nextDeadline(contests, today, registrationEnd) {
  const deadlines = [];
  for (const contest of contests) {
    const end = registrationEnd(contest);
    if (!contest.inscrita && end && end >= today) deadlines.push({contest, date: end, kind: 'registration'});
    if (contest.prova && contest.prova >= today) deadlines.push({contest, date: contest.prova, kind: 'exam'});
  }
  return deadlines.sort((a, b) => a.date.localeCompare(b.date) || (a.kind === 'registration' ? -1 : 1))[0] || null;
}
