import {validateSnapshot} from './snapshots.js';
// Portable packages add contests and subjects; they never restore an entire app backup.
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

function copy(value) { return JSON.parse(JSON.stringify(value)); }
function slug(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'importado';
}
function availableId(value, used) {
  const base = slug(value);
  let id = base, suffix = 2;
  while (used.has(id)) id = `${base}-${suffix++}`;
  used.add(id);
  return id;
}
function safeUrl(value) {
  if (!value) return '';
  try { const url = new URL(value); if (['https:', 'http:'].includes(url.protocol)) return url.href; } catch {}
  throw new Error('Um dos links do arquivo não é um endereço http ou https válido.');
}
function subjectFrom(value) {
  if (!value || typeof value !== 'object' || !String(value.id || '').trim() || !String(value.n || '').trim() || !Array.isArray(value.t)) throw new Error('Cada matéria precisa de identificador, nome e lista de tópicos.');
  if (value.t.length > 2000) throw new Error('A matéria excede o limite de 2.000 tópicos.');
  const topics = value.t.map(topic => {
    if (typeof topic === 'string') return topic;
    if (!topic || typeof topic.n !== 'string') throw new Error('Há um tópico de matéria em formato inválido.');
    return {n: topic.n, u: safeUrl(topic.u)};
  });
  const materials = (Array.isArray(value.mat) ? value.mat : []).map(material => ({t: String(material.t || 'site'), l: String(material.l || ''), u: safeUrl(material.u)}));
  return {id: String(value.id), n: String(value.n).trim(), dica: String(value.dica || ''), t: topics, mat: materials};
}
function sameSubject(a, b) { return a.n === b.n && JSON.stringify(a.t) === JSON.stringify(b.t) && JSON.stringify(a.mat || []) === JSON.stringify(b.mat || []); }

export function planContestImport(text, current, normalizeContest) {
  if (typeof text !== 'string' || !text.trim()) throw new Error('Escolha um arquivo JSON ou cole uma ficha para continuar.');
  if (new TextEncoder().encode(text).byteLength > MAX_IMPORT_BYTES) throw new Error('O arquivo excede o limite de 5 MB.');
  let source;
  try { source = JSON.parse(text.replace(/^\uFEFF/, '')); } catch { throw new Error('O conteúdo não é um JSON válido. Confira se o arquivo foi baixado por completo.'); }
  if (!source || typeof source !== 'object') throw new Error('O arquivo não contém uma ficha de concurso.');
  if (source.d || source.t && !source.titulo) throw new Error('Esse arquivo é um backup do app. Use Restaurar backup para recuperá-lo.');
  const packaged = !Array.isArray(source) && source.tipo === 'concursos-pacote';
  if (packaged && source.versao !== 1) throw new Error('Esta versão do pacote ainda não é compatível com o app.');
  if (!packaged && source.concursos) throw new Error('O pacote de concursos não informa um formato compatível.');
  const contests = packaged ? source.concursos : Array.isArray(source) ? source : [source];
  if (!Array.isArray(contests) || !contests.length || contests.length > 100) throw new Error('O arquivo deve conter entre 1 e 100 concursos.');
  if (contests.some(value => !value || typeof value !== 'object' || Array.isArray(value) || !String(value.titulo || '').trim())) throw new Error('Todo concurso do arquivo precisa de um título. Nenhum item foi importado.');
  const incomingSubjects = packaged ? source.materias || [] : [];
  if (!Array.isArray(incomingSubjects) || incomingSubjects.length > 1000) throw new Error('A lista de matérias do pacote é inválida.');
  const subjects = incomingSubjects.map(subjectFrom);
  if (new Set(subjects.map(subject => subject.id)).size !== subjects.length) throw new Error('O pacote repete identificadores de matérias.');
  const existing = current.concursos || [];
  const existingSubjects = current.materias || [];
  const seenContests = new Set(existing.map(contest => contest.id));
  const skipped = [], selected = [];
  for (const contest of contests) {
    if (contest.id && seenContests.has(slug(contest.id))) { skipped.push(String(contest.titulo)); continue; }
    const record = copy(contest);
    record.id = availableId(record.id || record.curto || record.titulo, seenContests);
    selected.push(record);
  }
  const required = new Set(selected.flatMap(contest => Array.isArray(contest.mats) ? contest.mats : []));
  const usedSubjects = new Set(existingSubjects.map(subject => subject.id));
  const mapping = new Map();
  const addedSubjects = [];
  for (const subject of subjects.filter(subject => required.has(subject.id))) {
    const originalId = subject.id;
    const existingSubject = existingSubjects.find(value => value.id === originalId && sameSubject(value, subject));
    if (existingSubject) { mapping.set(originalId, existingSubject.id); continue; }
    subject.id = availableId(subject.id, usedSubjects);
    mapping.set(originalId, subject.id);
    addedSubjects.push(subject);
  }
  const allSubjects = [...existingSubjects, ...addedSubjects];
  const result = selected.map(contest => {
    contest.titulo = String(contest.titulo).trim();
    contest.mats = (Array.isArray(contest.mats) ? contest.mats : []).map(id => mapping.get(id) || id);
    if (packaged && contest.mats.some(id => !allSubjects.some(subject => subject.id === id))) throw new Error('Uma matéria usada pelo concurso não está no pacote nem no app. Nenhum dado foi alterado.');
    for (const block of contest.blocos || []) for (const item of block.itens || []) if (mapping.has(item.mid)) item.mid = mapping.get(item.mid);
    contest.urlBanca = safeUrl(contest.urlBanca);
    for (const link of contest.links || []) link.u = safeUrl(link.u);
    const normalized = normalizeContest(contest, allSubjects);
    normalized.nome ||= normalized.titulo;
    normalized.badge ||= (normalized.curto || normalized.titulo).slice(0, 10);
    return normalized;
  });
  validateSnapshot({t:{},d:{concursos:result,materias:addedSubjects}});
  return {concursos: result, materias: addedSubjects, skipped};
}

export function applyContestImport(current, plan) {
  // Clone before any mutation so a failed validation cannot partially apply a package.
  const next = copy(current);
  next.concursos ||= [];
  next.materias ||= [];
  next.concursos.push(...copy(plan.concursos));
  next.materias.push(...copy(plan.materias));
  return next;
}
