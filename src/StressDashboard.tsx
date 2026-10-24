import { useEffect, useRef, useState } from "react";

export type Level = { max: number; label: string; color: string };
export type Session = { title: string; icon: string; before: number; after: number; seconds: number };
export type Check = { eyebrow: string; emoji: string; label: string; value: number };

type Props = {
  start: number;
  sessions: Session[];
  levels: Level[];
  checks: Check[];
  onPlayMore: () => void;
  onRestart: () => void;
};

const levelOf = (levels: Level[], value: number) => levels.find((item) => value <= item.max * 10) ?? levels[levels.length - 1];

function useCountTo(target: number, from: number) {
  const [value, setValue] = useState(from);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let frame = 0;
    const began = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - began - 500) / 1400);
      const eased = t <= 0 ? 0 : 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, from]);
  return value;
}

function Rings({ before, now, beforeColor, nowColor }: { before: number; now: number; beforeColor: string; nowColor: string }) {
  const rings = [
    { r: 84, value: before, color: beforeColor, label: "Before" },
    { r: 64, value: now, color: nowColor, label: "Now" },
  ];
  return (
    <svg className="dash-rings" viewBox="0 0 200 200" role="img" aria-label={`Stress before ${before}%, now ${now}%`}>
      {rings.map(({ r, value, color, label }) => {
        const length = 2 * Math.PI * r;
        return (
          <g key={label}>
            <title>{`${label}: ${value}%`}</title>
            <circle cx="100" cy="100" r={r} fill="none" stroke="#ebe7de" strokeWidth="13" />
            <circle
              className="dash-ring"
              cx="100"
              cy="100"
              r={r}
              fill="none"
              stroke={color}
              strokeWidth="13"
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              style={{ "--len": length, strokeDasharray: length, strokeDashoffset: length * (1 - Math.max(value, 0.5) / 100) } as React.CSSProperties}
            />
          </g>
        );
      })}
      <text x="100" y="98" textAnchor="middle" className="dash-rings-delta">−{before - now}</text>
      <text x="100" y="120" textAnchor="middle" className="dash-rings-sub">points lighter</text>
    </svg>
  );
}

function Journey({ points, levels }: { points: { name: string; icon: string; value: number }[]; levels: Level[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [width, setWidth] = useState(640);
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    // Draw at the real pixel width so text stays readable on every screen.
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(260, Math.round(entry.contentRect.width))));
    observer.observe(box);
    return () => observer.disconnect();
  }, []);
  const height = width < 480 ? 220 : 270;
  const pad = { top: 16, right: 18, bottom: 44, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const x = (i: number) => pad.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => pad.top + innerH * (1 - v / 100);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i)} ${y(p.value)}`).join(" ");
  const area = `${line} L${x(points.length - 1)} ${y(0)} L${x(0)} ${y(0)} Z`;
  const bands = levels.map((level, i) => ({ ...level, from: i ? levels[i - 1].max * 10 : 0, to: level.max * 10 }));
  const compact = points.length > 5 || width < 520;

  return (
    <div className="dash-journey" ref={boxRef}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Stress level after each step of this session">
        <defs>
          <linearGradient id="journey-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#30483d" stopOpacity=".16" />
            <stop offset="100%" stopColor="#30483d" stopOpacity="0" />
          </linearGradient>
        </defs>
        {bands.map((band) => (
          <g key={band.label}>
            <rect x={pad.left} y={y(band.to)} width={innerW} height={y(band.from) - y(band.to)} fill={band.color} opacity=".07" />
            <text x={width - pad.right - 6} y={y(band.to) + 14} textAnchor="end" className="dash-band-label">{band.label}</text>
          </g>
        ))}
        {[0, 20, 60, 100].map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke="#29362f" strokeOpacity=".08" />
            <text x={pad.left - 8} y={y(tick) + 4} textAnchor="end" className="dash-axis">{tick}</text>
          </g>
        ))}
        <path d={area} fill="url(#journey-fill)" className="dash-area" />
        <path d={line} fill="none" stroke="#30483d" strokeWidth="2" strokeLinejoin="round" pathLength={1} className="dash-line" />
        {points.map((p, i) => (
          <g key={i}>
            <text
              x={x(i)}
              y={height - 16}
              textAnchor={compact ? "middle" : i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
              className="dash-axis"
            >
              {compact ? p.icon : `${i ? `${p.icon} ` : ""}${p.name}`}
            </text>
            <circle
              cx={x(i)}
              cy={y(p.value)}
              r={active === i ? 8 : 6}
              fill={levelOf(levels, p.value).color}
              stroke="#fffdf8"
              strokeWidth="2"
              className="dash-dot"
              style={{ animationDelay: `${0.4 + i * 0.15}s` }}
            />
            {(i === 0 || i === points.length - 1) && (
              <text x={x(i)} y={y(p.value) - 14} textAnchor="middle" className="dash-point-label">{p.value}%</text>
            )}
            <circle
              cx={x(i)}
              cy={y(p.value)}
              r="20"
              fill="transparent"
              tabIndex={0}
              aria-label={`${p.name}: ${p.value}%`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            />
          </g>
        ))}
      </svg>
      {active !== null && (
        <div className="dash-tooltip" style={{ left: `${(x(active) / width) * 100}%`, top: `${(y(points[active].value) / height) * 100}%` }}>
          <b>{points[active].icon} {points[active].name}</b>
          <span>
            <i style={{ background: levelOf(levels, points[active].value).color }} />
            {points[active].value}% · {levelOf(levels, points[active].value).label}
          </span>
          {active > 0 && <small>−{points[active - 1].value - points[active].value} points from the step before</small>}
        </div>
      )}
    </div>
  );
}

export default function StressDashboard({ start, sessions, levels, checks, onPlayMore, onRestart }: Props) {
  const now = sessions.length ? sessions[sessions.length - 1].after : start;
  const before = levelOf(levels, start);
  const after = levelOf(levels, now);
  const shown = useCountTo(now, start);
  const minutes = Math.max(1, Math.round(sessions.reduce((sum, s) => sum + s.seconds, 0) / 60));
  const helpers = [...sessions]
    .map((s) => ({ ...s, relief: s.before - s.after }))
    .sort((a, b) => b.relief - a.relief);
  const maxRelief = Math.max(1, ...helpers.map((h) => h.relief));
  const points = [{ name: "Check-in", icon: "◉", value: start }, ...sessions.map((s) => ({ name: s.title, icon: s.icon, value: s.after }))];

  return (
    <section className="dashboard">
      <header className="dash-head">
        <div>
          <p className="kicker">Your calm dashboard</p>
          <h1>Look how far you've <em>softened.</em></h1>
        </div>
        <div className="dash-actions">
          <button className="primary" onClick={onPlayMore}>Play another activity <span aria-hidden="true">→</span></button>
          <button className="text-button" onClick={onRestart}>Start a fresh check-in</button>
        </div>
      </header>

      <div className="dash-grid">
        <article className="dash-card dash-hero">
          <div className="dash-hero-copy">
            <p className="dash-label">Stress load</p>
            <div className="dash-numbers">
              <span className="dash-before">{start}%</span>
              <span className="dash-arrow" aria-hidden="true">→</span>
              <span className="dash-now" style={{ color: after.color }}>{shown}%</span>
            </div>
            <p className="dash-summary">
              {start - now > 0
                ? <>You're <b>{start - now} points lighter</b> after {sessions.length} {sessions.length === 1 ? "activity" : "activities"}.</>
                : <>You were already steady — these minutes helped you stay that way.</>}
            </p>
            <div className="dash-chips">
              <span className="dash-chip" style={{ "--chip": before.color } as React.CSSProperties}><i />Before · {before.label}</span>
              <span aria-hidden="true">→</span>
              <span className="dash-chip" style={{ "--chip": after.color } as React.CSSProperties}><i />Now · {after.label}</span>
            </div>
          </div>
          <div className="dash-rings-wrap">
            <Rings before={start} now={now} beforeColor={before.color} nowColor={after.color} />
            <p className="dash-rings-key">
              <span><i style={{ background: before.color }} />Outer · before</span>
              <span><i style={{ background: after.color }} />Inner · now</span>
            </p>
          </div>
        </article>

        <article className="dash-card dash-tiles">
          <div><strong>{sessions.length}</strong><span>{sessions.length === 1 ? "activity" : "activities"} played</span></div>
          <div><strong>{minutes}</strong><span>{minutes === 1 ? "minute" : "minutes"} for you</span></div>
          <div><strong>{helpers[0]?.icon ?? "—"}</strong><span>Top helper: {helpers[0]?.title ?? "—"}</span></div>
        </article>

        <article className="dash-card dash-wide">
          <div className="dash-card-head">
            <h2>Your stress journey</h2>
            <p>Each dot is your estimated level after a step. Hover a dot for details.</p>
          </div>
          <Journey points={points} levels={levels} />
          <details className="dash-table">
            <summary>See as a table</summary>
            <table>
              <thead><tr><th>Step</th><th>Stress</th><th>Level</th><th>Change</th></tr></thead>
              <tbody>
                {points.map((p, i) => (
                  <tr key={i}>
                    <td>{p.name}</td>
                    <td>{p.value}%</td>
                    <td>{levelOf(levels, p.value).label}</td>
                    <td>{i ? `−${points[i - 1].value - p.value}` : "start"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </article>

        <article className="dash-card">
          <div className="dash-card-head">
            <h2>What helped most</h2>
            <p>Points eased by each activity.</p>
          </div>
          <div className="dash-bars">
            {helpers.map((h, i) => (
              <div className="dash-bar-row" key={i} title={`${h.title}: −${h.relief} points`}>
                <span className="dash-bar-name">{h.icon} {h.title}</span>
                <div className="dash-bar-track">
                  <i style={{ width: `${(h.relief / maxRelief) * 100}%`, animationDelay: `${0.3 + i * 0.12}s` }} />
                </div>
                <b>−{h.relief}</b>
              </div>
            ))}
          </div>
        </article>

        <article className="dash-card">
          <div className="dash-card-head">
            <h2>Where it started</h2>
            <p>The pictures you picked at check-in.</p>
          </div>
          <ul className="dash-checks">
            {checks.map((c) => (
              <li key={c.eyebrow}>
                <span className="dash-check-emoji" aria-hidden="true">{c.emoji}</span>
                <span><small>{c.eyebrow}</small>{c.label}</span>
                <span className="dash-pips" aria-label={`${c.value} of 2`}>
                  {[0, 1].map((pip) => <i key={pip} className={pip < c.value ? "on" : ""} />)}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <p className="dash-note">These numbers are friendly estimates from your check-in and the activities you played — not a medical measurement.</p>
    </section>
  );
}
