import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { getLogsForDateRange, getMeasurementsForDateRange, getCustomExercises, getISOWeekId } from '../../firebase/helpers';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import exerciseDB from '../../data/exerciseDB.json';

const DAYS_PL = ['nd', 'pn', 'wt', 'śr', 'czw', 'pt', 'sb'];

function fmtDate(date) {
  if (!date) return '';
  return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtShort(date) {
  if (!date) return '';
  return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
}

function fmtUTCShort(utcDate) {
  const d = String(utcDate.getUTCDate()).padStart(2, '0');
  const m = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
  return `${d}.${m}`;
}

function fmtInput(date) {
  return date.toISOString().slice(0, 10);
}

function getWeekDateRange(weekId) {
  const [yr, wk] = weekId.split('-W').map(Number);
  const jan4 = new Date(Date.UTC(yr, 0, 4));
  const jan4Day = (jan4.getUTCDay() + 6) % 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - jan4Day + (wk - 1) * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return { monday, sunday, weekNum: wk };
}

function groupByWeek(logs) {
  const groups = new Map();
  for (const log of logs) {
    const weekId = getISOWeekId(log._date);
    if (!groups.has(weekId)) groups.set(weekId, []);
    groups.get(weekId).push(log);
  }
  return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

function formatSets(sets) {
  return (sets ?? [])
    .filter(s => s.reps && s.weight)
    .map(s => `${s.reps}×${s.weight} kg`)
    .join(' | ');
}

function buildExerciseMap(customExercises) {
  const map = {};
  exerciseDB.forEach(e => { map[e.id] = e.name; });
  customExercises.forEach(e => { map[e.id] = e.name; });
  return map;
}

function computeStats(logs, exerciseMap) {
  const prs = {};
  let totalVolume = 0;
  for (const log of logs) {
    for (const ex of log.exercises ?? []) {
      for (const set of ex.sets ?? []) {
        if (!set.weight || !set.reps) continue;
        totalVolume += set.weight * set.reps;
        if (!prs[ex.exerciseId] || set.weight > prs[ex.exerciseId].weight) {
          prs[ex.exerciseId] = {
            name: exerciseMap[ex.exerciseId] ?? String(ex.exerciseId),
            weight: set.weight,
            reps: set.reps,
            date: log._date,
          };
        }
      }
    }
  }
  return {
    totalWorkouts: logs.length,
    totalVolume: Math.round(totalVolume),
    prs: Object.values(prs).sort((a, b) => a.name.localeCompare(b.name, 'pl')),
  };
}

function exportExcel({ logs, measurements, stats, exerciseMap, from, to }) {
  const wb = XLSX.utils.book_new();

  const weeks = groupByWeek(logs);
  const workoutRows = weeks.flatMap(([weekId, wLogs]) => {
    const { monday, sunday, weekNum } = getWeekDateRange(weekId);
    const weekLabel = `T${weekNum} (${fmtUTCShort(monday)}–${fmtUTCShort(sunday)})`;
    return wLogs.flatMap(log =>
      (log.exercises ?? []).flatMap(ex => {
        const sets = (ex.sets ?? []).filter(s => s.reps && s.weight);
        if (!sets.length) return [];
        return [{
          'Tydzień': weekLabel,
          'Data': fmtDate(log._date),
          'Dzień': DAYS_PL[log._date.getDay()],
          'Plan': log.planId ?? '',
          'Ćwiczenie': exerciseMap[ex.exerciseId] ?? String(ex.exerciseId),
          'Serie': formatSets(ex.sets),
          'Maks. ciężar (kg)': Math.max(...sets.map(s => s.weight)),
          'Łączna objętość (kg)': sets.reduce((s, set) => s + set.weight * set.reps, 0),
        }];
      })
    );
  });
  const ws1 = XLSX.utils.json_to_sheet(workoutRows.length ? workoutRows : [{ 'Brak danych w wybranym okresie': '' }]);
  XLSX.utils.book_append_sheet(wb, ws1, 'Historia treningów');

  const measRows = measurements.map(m => ({
    'Data': fmtDate(m.date?.toDate?.()),
    'Waga (kg)': m.weight ?? '',
    'Szyja (cm)': m.neck ?? '',
    'Klatka (cm)': m.chest ?? '',
    'Talia (cm)': m.waist ?? '',
    'Biodra (cm)': m.hips ?? '',
    'Biceps (cm)': m.bicep ?? '',
    'Udo (cm)': m.thigh ?? '',
  }));
  const ws2 = XLSX.utils.json_to_sheet(measRows.length ? measRows : [{ 'Brak danych w wybranym okresie': '' }]);
  XLSX.utils.book_append_sheet(wb, ws2, 'Pomiary');

  const statsData = [
    ['Statystyki', `${fmtDate(from)} – ${fmtDate(to)}`],
    ['Treningi', stats.totalWorkouts],
    ['Łączna objętość', `${stats.totalVolume.toLocaleString('pl-PL')} kg`],
    [],
    ['Rekordy (PR)'],
    ['Ćwiczenie', 'Ciężar (kg)', 'Powtórzenia', 'Data'],
    ...stats.prs.map(pr => [pr.name, pr.weight, pr.reps, fmtDate(pr.date)]),
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(statsData);
  XLSX.utils.book_append_sheet(wb, ws3, 'Statystyki');

  XLSX.writeFile(wb, `trening_${fmtInput(from)}_${fmtInput(to)}.xlsx`);
}

function exportPDF({ logs, measurements, stats, exerciseMap, from, to }, user) {
  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const weeks = groupByWeek(logs);

  const weeksHTML = weeks.map(([weekId, wLogs]) => {
    const { monday, sunday, weekNum } = getWeekDateRange(weekId);
    const weekRange = `${fmtUTCShort(monday)} – ${fmtUTCShort(sunday)}.${sunday.getUTCFullYear()}`;

    const sessionsHTML = wLogs.map(log => {
      const dayName = DAYS_PL[log._date.getDay()];
      const validEx = (log.exercises ?? []).filter(ex =>
        (ex.sets ?? []).some(s => s.reps && s.weight)
      );
      const maxSets = validEx.reduce((m, ex) =>
        Math.max(m, (ex.sets ?? []).filter(s => s.reps && s.weight).length), 0
      );
      const setColW = maxSets > 0 ? Math.floor(52 / maxSets) : 0;
      const nameColW = 100 - setColW * maxSets;
      const colgroup = `<colgroup><col style="width:${nameColW}%">${
        Array.from({ length: maxSets }, () => `<col style="width:${setColW}%">`).join('')
      }</colgroup>`;
      const rows = validEx.map(ex => {
        const sets = (ex.sets ?? []).filter(s => s.reps && s.weight);
        const cells = Array.from({ length: maxSets }, (_, i) => {
          const s = sets[i];
          return `<td class="ex-set">${s ? esc(`${s.reps}×${s.weight} kg`) : ''}</td>`;
        }).join('');
        return `<tr><td class="ex-name">${esc(exerciseMap[ex.exerciseId] ?? ex.exerciseId)}</td>${cells}</tr>`;
      }).join('');

      const exercisesHTML = rows
        ? `<table class="ex-table">${colgroup}<tbody>${rows}</tbody></table>`
        : '<div class="no-ex">Brak ćwiczeń</div>';

      return `<div class="session">
        <div class="session-hd">${esc(log.planId ? `Trening ${log.planId}` : 'Trening')} &nbsp;·&nbsp; ${esc(dayName)}, ${esc(fmtShort(log._date))}</div>
        <div class="exercises">${exercisesHTML}</div>
      </div>`;
    }).join('');

    return `<div class="week-block">
      <div class="week-hd">Tydzień ${weekNum} &nbsp;·&nbsp; ${weekRange}</div>
      ${sessionsHTML}
    </div>`;
  }).join('');

  const measRows = measurements.map(m => `<tr>
    <td>${esc(fmtDate(m.date?.toDate?.()))}</td>
    <td>${m.weight ?? ''}</td>
    <td>${m.neck ?? ''}</td>
    <td>${m.chest ?? ''}</td>
    <td>${m.waist ?? ''}</td>
    <td>${m.hips ?? ''}</td>
    <td>${m.bicep ?? ''}</td>
    <td>${m.thigh ?? ''}</td>
  </tr>`).join('');

  const prRows = stats.prs.map(pr => `<tr>
    <td>${esc(pr.name)}</td>
    <td>${pr.weight} kg × ${pr.reps}</td>
    <td>${esc(fmtDate(pr.date))}</td>
  </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>Raport treningowy</title>
  <style>
    @page { margin: 2cm; size: A4; }
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; line-height: 1.5; }
    h1 { font-size: 22px; margin: 0 0 4px; font-weight: 700; }
    .meta { color: #666; font-size: 10px; margin-bottom: 24px; }
    h2 { font-size: 11px; font-weight: 700; margin: 28px 0 10px; padding-bottom: 4px; border-bottom: 2px solid #111; text-transform: uppercase; letter-spacing: 0.06em; }
    .stats { display: flex; gap: 12px; margin-bottom: 24px; }
    .stat { background: #f5f5f5; border-radius: 6px; padding: 10px 16px; flex: 1; }
    .stat-val { font-size: 18px; font-weight: 700; }
    .stat-label { font-size: 9px; color: #666; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
    .week-block { margin-bottom: 20px; page-break-inside: avoid; }
    .week-hd { font-size: 12px; font-weight: 700; background: #111; color: #fff; padding: 6px 12px; border-radius: 4px 4px 0 0; }
    .session { border: 1px solid #ddd; border-top: none; }
    .session:last-child { border-radius: 0 0 4px 4px; }
    .session-hd { font-size: 10px; font-weight: 700; color: #555; padding: 7px 12px; background: #f9f9f9; border-bottom: 1px solid #eee; text-transform: uppercase; letter-spacing: 0.04em; }
    .exercises { padding: 4px 12px 6px; }
    .ex-table { width: 100%; border-collapse: collapse; margin: 0; }
    .ex-table td { padding: 3px 0; border-bottom: 1px solid #f2f2f2; font-size: 10px; vertical-align: baseline; }
    .ex-table tr:last-child td { border-bottom: none; }
    .ex-name { color: #111; padding-right: 10px; }
    .ex-set { color: #444; white-space: nowrap; font-variant-numeric: tabular-nums; text-align: right; }
    .no-ex { font-size: 10px; color: #aaa; font-style: italic; padding: 4px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10px; page-break-inside: auto; }
    thead { display: table-header-group; }
    thead th { background: #111; color: #fff; padding: 5px 8px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.04em; }
    tbody tr:nth-child(even) { background: #f9f9f9; }
    tbody td { padding: 4px 8px; border-bottom: 1px solid #eee; }
    .empty { color: #999; font-style: italic; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <h1>Raport treningowy</h1>
  <div class="meta">${esc(user?.displayName ?? '')} &nbsp;&middot;&nbsp; ${esc(fmtDate(from))} &ndash; ${esc(fmtDate(to))}</div>

  <h2>Podsumowanie</h2>
  <div class="stats">
    <div class="stat"><div class="stat-val">${stats.totalWorkouts}</div><div class="stat-label">Treningi</div></div>
    <div class="stat"><div class="stat-val">${stats.totalVolume.toLocaleString('pl-PL')} kg</div><div class="stat-label">Łączna objętość</div></div>
    <div class="stat"><div class="stat-val">${stats.prs.length}</div><div class="stat-label">Ćwiczenia</div></div>
  </div>

  <h2>Historia treningów</h2>
  ${weeksHTML || '<p class="empty">Brak treningów w tym okresie.</p>'}

  <h2>Pomiary</h2>
  ${measRows
    ? `<table><thead><tr><th>Data</th><th>Waga</th><th>Szyja</th><th>Klatka</th><th>Talia</th><th>Biodra</th><th>Biceps</th><th>Udo</th></tr></thead><tbody>${measRows}</tbody></table>`
    : '<p class="empty">Brak pomiarów w tym okresie.</p>'}

  <h2>Rekordy (PR)</h2>
  ${prRows
    ? `<table><thead><tr><th>Ćwiczenie</th><th>Wynik</th><th>Data</th></tr></thead><tbody>${prRows}</tbody></table>`
    : '<p class="empty">Brak danych.</p>'}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export function ReportGenerator() {
  const { tokens: t } = useTheme();
  const isIron = t.key === 'iron';
  const { user } = useAuth();
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const today = new Date();
  const month = new Date(today);
  month.setDate(month.getDate() - 30);
  const [fromDate, setFromDate] = useState(fmtInput(month));
  const [toDate, setToDate] = useState(fmtInput(today));

  const collect = async () => {
    const from = new Date(fromDate + 'T00:00:00');
    const to = new Date(toDate + 'T23:59:59');
    const [logs, measurements, customExercises] = await Promise.all([
      getLogsForDateRange(user.uid, from, to),
      getMeasurementsForDateRange(user.uid, from, to),
      getCustomExercises(user.uid),
    ]);
    const exerciseMap = buildExerciseMap(customExercises);
    const stats = computeStats(logs, exerciseMap);
    return { logs, measurements, exerciseMap, stats, from, to };
  };

  const handle = async (type) => {
    setLoading(type);
    setError(null);
    try {
      const data = await collect();
      if (type === 'pdf') exportPDF(data, user);
      else exportExcel(data);
    } catch (e) {
      setError(e.message ?? 'Błąd eksportu');
    } finally {
      setLoading(null);
    }
  };

  const inputStyle = {
    fontFamily: t.fontNum,
    fontSize: 14,
    background: t.bgSubtle,
    border: `1px solid ${t.border}`,
    borderRadius: t.radiusInput,
    color: t.ink,
    padding: '8px 10px',
    flex: 1,
    outline: 'none',
    minWidth: 0,
  };

  const spinner = (
    <div style={{
      width: 14, height: 14,
      border: `2px solid currentColor`,
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'tya-spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );

  return (
    <div style={{
      background: t.surface,
      borderRadius: t.radiusCard,
      border: `1px solid ${t.border}`,
      boxShadow: t.shadowSm,
      overflow: 'hidden',
    }}>
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="report" size={20} stroke={1.8} color={t.accent} />
          <span style={{
            fontFamily: t.fontDisplay,
            fontSize: isIron ? 15 : 17,
            fontWeight: isIron ? 700 : 500,
            color: t.ink,
            textTransform: isIron ? 'uppercase' : 'none',
          }}>
            {isIron ? 'EKSPORT DANYCH' : 'Eksport danych'}
          </span>
        </div>
        <p style={{ fontFamily: t.fontUI, fontSize: 12, color: t.inkMute, margin: '6px 0 0', lineHeight: 1.4 }}>
          Historia treningów i pomiarów jako PDF lub Excel
        </p>
      </div>

      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            style={inputStyle}
          />
          <span style={{ fontFamily: t.fontUI, fontSize: 13, color: t.inkMute, flexShrink: 0 }}>&ndash;</span>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            variant="accent"
            size="md"
            onClick={() => handle('pdf')}
            disabled={!!loading}
            style={{ flex: 1 }}
          >
            {loading === 'pdf' ? spinner : <Icon name="download" size={16} stroke={2} />}
            {isIron ? 'PDF' : 'Pobierz PDF'}
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => handle('excel')}
            disabled={!!loading}
            style={{ flex: 1 }}
          >
            {loading === 'excel' ? spinner : <Icon name="download" size={16} stroke={2} />}
            {isIron ? 'EXCEL' : 'Pobierz Excel'}
          </Button>
        </div>

        {error && (
          <div style={{
            marginTop: 12,
            background: t.bgSubtle,
            border: `1px solid ${t.warn}`,
            borderRadius: t.radiusInput,
            padding: '10px 12px',
          }}>
            <span style={{ fontFamily: t.fontUI, fontSize: 12, color: t.warn }}>{error}</span>
          </div>
        )}
        <style>{`@keyframes tya-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
