// Ikony SVG z handoffu Claude Design — stroke-based, dziedziczą currentColor
export function Icon({ name, size = 22, stroke = 1.6, color = 'currentColor', className }) {
  const s = {
    width: size, height: size, fill: 'none',
    stroke: color, strokeWidth: stroke,
    strokeLinecap: 'round', strokeLinejoin: 'round',
    flexShrink: 0,
  };
  const paths = {
    dashboard: <><rect x="3.5" y="3.5" width="7" height="9" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="5" rx="1.5"/><rect x="3.5" y="15.5" width="7" height="5" rx="1.5"/><rect x="13.5" y="11.5" width="7" height="9" rx="1.5"/></>,
    barbell:   <><path d="M2 12h2M20 12h2"/><rect x="4" y="8" width="3" height="8" rx="0.6"/><rect x="17" y="8" width="3" height="8" rx="0.6"/><path d="M7 12h10"/></>,
    history:   <><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.2 2"/></>,
    ruler:     <><rect x="3" y="8.5" width="18" height="7" rx="1" transform="rotate(-12 12 12)"/><path d="M7.5 11l-.6 1.5M11 10.2l-.6 1.5M14.5 9.5l-.6 1.5M18 8.7l-.6 1.5"/></>,
    book:      <><path d="M4 5.5c2.5-1 5.5-1 8 .5v13c-2.5-1.5-5.5-1.5-8-.5z"/><path d="M20 5.5c-2.5-1-5.5-1-8 .5v13c2.5-1.5 5.5-1.5 8-.5z"/></>,
    plus:      <><path d="M12 5v14M5 12h14"/></>,
    check:     <><path d="M5 12.5l4.5 4.5L19 7"/></>,
    x:         <><path d="M6 6l12 12M18 6L6 18"/></>,
    chevR:     <><path d="M9 5l7 7-7 7"/></>,
    chevL:     <><path d="M15 5l-7 7 7 7"/></>,
    chevD:     <><path d="M5 9l7 7 7-7"/></>,
    chevU:     <><path d="M19 15l-7-7-7 7"/></>,
    more:      <><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></>,
    timer:     <><circle cx="12" cy="13" r="7.5"/><path d="M12 13V9M10 2.5h4"/></>,
    search:    <><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></>,
    filter:    <><path d="M4 6h16M7 12h10M10 18h4"/></>,
    flame:     <><path d="M12 21c4 0 6.5-2.7 6.5-6 0-2.6-1.7-4.4-3-6-1 2-2.5 2-2.5 0 0-1.6.5-3 1-5-3 1-7 4.5-7 9 0 4 2 8 5 8z"/></>,
    trend:     <><path d="M3 17l6-6 4 4 8-9"/><path d="M16 6h5v5"/></>,
    note:      <><rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    arrow:     <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    arrowL:    <><path d="M19 12H5M11 18l-6-6 6-6"/></>,
    dot:       <><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/></>,
    edit:      <><path d="M4 20h4l10-10-4-4L4 16z"/><path d="M14 6l4 4"/></>,
    trash:     <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></>,
    user:      <><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.5 3.7-5.5 7-5.5s6.2 2 7 5.5"/></>,
    settings:  <><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>,
    report:    <><path d="M9 17H7A2 2 0 015 15V5a2 2 0 012-2h10a2 2 0 012 2v4"/><path d="M9 11l3 3L22 4"/><path d="M21 15l-3 3-1.5-1.5"/></>,
    share:     <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></>,
    copy:      <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></>,
    download:  <><path d="M12 3v13M7 11l5 5 5-5M3 21h18"/></>,
  };
  return (
    <svg viewBox="0 0 24 24" style={s} className={className}>
      {paths[name] ?? null}
    </svg>
  );
}
