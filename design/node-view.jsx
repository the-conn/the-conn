// Node view — drilldown after clicking a node in the pipeline timeline.
// Same chrome as the dashboard. Top: node identity + timing breakdown.
// Below: full-bleed log viewer with stream filter + search.

const W_NODE = 1280;
const H_NODE = 820;

// Format helpers
const pad2 = (n) => n.toString().padStart(2, "0");
const fmtTimeUTC = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}.${d.getUTCMilliseconds().toString().padStart(3, "0")}Z`;
};
const fmtElapsed = (sec) => {
  if (sec == null) return "—";
  if (sec < 60) return `${sec.toFixed(2)}s`;
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return `${m}m ${s.toFixed(1)}s`;
};
const fmtElapsedMs = (ms) => {
  const total = ms / 1000;
  const m = Math.floor(total / 60);
  const s = total - m * 60;
  return `${pad2(m)}:${s.toFixed(3).padStart(6, "0")}`;
};

function NodeView({ stream = "all", query = "" }) {
  const d = NODE_DETAIL;
  const status = d.success === true ? "ok" : d.success === false ? "fail" : (d.started_at ? "run" : "pending");
  const created   = new Date(d.created_at).getTime();
  const started   = d.started_at   ? new Date(d.started_at).getTime()   : null;
  const completed = d.completed_at ? new Date(d.completed_at).getTime() : null;
  const waitMs    = started   != null ? started - created : null;
  const runMs     = completed != null && started != null ? completed - started : null;
  const totalMs   = completed != null ? completed - created : null;

  // base time for log offsets = earliest log ts (per spec)
  const base = NODE_LOGS_BASE_MS;
  const filtered = NODE_LOGS.filter(l => {
    if (stream !== "all" && l.stream !== stream) return false;
    if (query && !l.text.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="sk-wire" style={{ width: W_NODE, height: H_NODE, display: "flex", flexDirection: "column" }}>
      {/* TOP NAV — same as dashboard */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 18px", borderBottom: "1.2px solid var(--ink)", background: "var(--paper)" }}>
        <Wordmark size={13} />
        <div style={{ width: 1, height: 16, background: "var(--ink-trace)" }} />
        <Breadcrumb items={[NAMESPACE, "web-edge", RUN_ID, d.node_name]} />
        <div style={{ flex: 1 }} />
        <ConnHandoff handle={ON_CALL} />
        <button className="sk-btn small ghost"><Radar size={12}/> sync</button>
      </div>

      {/* SUB-NAV: back to run + node identity strip */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 18px", borderBottom: "1px solid var(--ink-trace)", background: "var(--paper-2)" }}>
        <button className="sk-btn small ghost" style={{ padding: "2px 6px" }}>← run {RUN_ID}</button>
        <div style={{ width: 1, height: 14, background: "var(--ink-trace)" }} />
        <Glyph status={status} size={12}/>
        <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{d.node_name}</span>
        <StatusPill status={status} />
        <span style={{ flex: 1 }} />
        <Mono size={11} dim>node #{d.id}</Mono>
        <div style={{ width: 1, height: 14, background: "var(--ink-trace)" }} />
        <Mono size={11} dim>run_id</Mono>
        <Mono size={11}>{d.run_id.slice(0, 8)}…</Mono>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* LEFT — timing + metadata */}
        <aside style={{ width: 320, borderRight: "1.2px solid var(--ink)", padding: "16px 16px 14px", display: "flex", flexDirection: "column", gap: 14, overflow: "auto", background: "var(--paper)" }}>
          <Section title="Timing">
            <TimingBreakdown waitMs={waitMs} runMs={runMs} totalMs={totalMs} />
            <TimestampRow label="created" iso={d.created_at} />
            <TimestampRow label="started" iso={d.started_at} />
            <TimestampRow label="completed" iso={d.completed_at} />
          </Section>

          <Section title="Result">
            <KV label="exit">
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, color: status === "fail" ? "var(--status-red)" : "var(--ink)" }}>
                {d.success === true ? "success (code 0)" : d.success === false ? "failure (code 1)" : "—"}
              </span>
            </KV>
            <KV label="success"><Mono size={12}>{String(d.success)}</Mono></KV>
          </Section>

          <NodeDefinition yaml={d.node_definition} />
        </aside>

        {/* RIGHT — log viewer */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "var(--paper)" }}>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid var(--ink-trace)" }}>
            <HandHeader size={11}>Log Output</HandHeader>
            <StreamFilter value={stream} counts={{
              all:    NODE_LOGS.length,
              stdout: NODE_LOGS.filter(l => l.stream === "stdout").length,
              stderr: NODE_LOGS.filter(l => l.stream === "stderr").length,
            }} />
            <div style={{ flex: 1 }} />
            <SearchBox value={query} count={filtered.length} total={NODE_LOGS.length} />
            <button className="sk-btn small ghost" title="Wrap long lines">↵ wrap</button>
            <button className="sk-btn small ghost" title="Download logs">⤓ download</button>
          </div>

          {/* Log body */}
          <LogBody lines={filtered} base={base} />
        </main>
      </div>
    </div>
  );
}

// ---- Timing ----

function TimingBreakdown({ waitMs, runMs, totalMs }) {
  const total = (waitMs || 0) + (runMs || 0);
  const waitPct = total ? (waitMs / total) * 100 : 0;
  const runPct  = total ? (runMs  / total) * 100 : 0;
  return (
    <div style={{ marginBottom: 8 }}>
      {/* Stacked bar */}
      <div style={{ display: "flex", height: 8, borderRadius: 2, overflow: "hidden", border: "1px solid var(--ink-trace)" }}>
        <div title={`wait ${waitMs}ms`} style={{
          width: `${waitPct}%`,
          backgroundImage: "repeating-linear-gradient(-45deg, transparent 0, transparent 3px, rgba(136,136,136,0.35) 3px, rgba(136,136,136,0.35) 4px)",
          backgroundColor: "var(--paper-3)",
        }}/>
        <div title={`run ${runMs}ms`} style={{
          width: `${runPct}%`,
          background: "var(--status-red-soft)",
          borderLeft: "1px solid var(--status-red)",
        }}/>
      </div>
      {/* Numbers */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontFamily: "var(--mono)", fontSize: 11 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-faint)" }}>queued</div>
          <div style={{ color: "var(--ink-soft)", fontWeight: 600 }}>{fmtElapsedMs(waitMs || 0)}</div>
        </div>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-faint)" }}>ran</div>
          <div style={{ color: "var(--status-red)", fontWeight: 600 }}>{fmtElapsedMs(runMs || 0)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-faint)" }}>total</div>
          <div style={{ color: "var(--ink)", fontWeight: 600 }}>{fmtElapsedMs(totalMs || 0)}</div>
        </div>
      </div>
    </div>
  );
}

function TimestampRow({ label, iso }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "4px 0", borderTop: "1px dashed var(--ink-trace)" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 1 }}>{label}</div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: iso ? "var(--ink)" : "var(--ink-faint)", fontWeight: 500 }}>
        {fmtTimeUTC(iso)}
      </div>
    </div>
  );
}

// ---- Sidebar bits ----

function Section({ title, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <HandHeader size={10}>{title}</HandHeader>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>{children}</div>
    </div>
  );
}

function KV({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "2px 0" }}>
      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ marginLeft: 12 }}>{children}</span>
    </div>
  );
}

function StatusPill({ status }) {
  const labels = { ok: "SUCCESS", fail: "FAILED", run: "RUNNING", pending: "PENDING", cancel: "CANCELLED", skip: "SKIPPED" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 3,
      background: STATUS_SOFT[status],
      border: `1px solid ${STATUS_COLOR[status]}`,
      color: STATUS_COLOR[status],
      fontFamily: "var(--mono)", fontWeight: 700, fontSize: 10, letterSpacing: "0.14em",
    }}>{labels[status] || status.toUpperCase()}</span>
  );
}

// ---- Log toolbar ----

function StreamFilter({ value = "all", counts = {} }) {
  const opts = [
    { v: "all",    label: "ALL" },
    { v: "stdout", label: "STDOUT" },
    { v: "stderr", label: "STDERR" },
  ];
  return (
    <div style={{ display: "inline-flex", border: "1px solid rgba(26,26,26,0.18)", borderRadius: 4, overflow: "hidden", background: "var(--paper)" }}>
      {opts.map((o, i) => {
        const active = o.v === value;
        const isErr = o.v === "stderr";
        const count = counts[o.v];
        return (
          <button key={o.v} className="sk-btn small" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            border: "none",
            borderLeft: i === 0 ? "none" : "1px solid rgba(26,26,26,0.10)",
            borderRadius: 0,
            padding: "3px 10px",
            background: active ? (isErr ? "var(--status-red-soft)" : "var(--paper-3)") : "transparent",
            color: active ? (isErr ? "var(--status-red)" : "var(--ink)") : "var(--ink-faint)",
            fontWeight: active ? 700 : 500,
            letterSpacing: "0.08em",
            fontFamily: "var(--mono)",
          }}>
            <span>{o.label}</span>
            {count != null && (
              <span style={{
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: 0,
                padding: "0 4px",
                borderRadius: 2,
                background: active ? "rgba(26,26,26,0.08)" : "transparent",
                color: active ? (isErr ? "var(--status-red)" : "var(--ink-soft)") : "var(--ink-faint)",
                opacity: active ? 1 : 0.7,
              }}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---- Node Definition (YAML) — sidebar block ----

function NodeDefinition({ yaml }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <HandHeader size={10}>Node Definition</HandHeader>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-faint)", letterSpacing: "0.08em" }}>YAML</span>
      </div>
      <pre style={{
        margin: 0,
        padding: "8px 10px",
        background: "var(--paper-2)",
        border: "1px dashed var(--ink-trace)",
        borderRadius: 2,
        fontFamily: "var(--mono)",
        fontSize: 10.5,
        lineHeight: 1.55,
        color: "var(--ink-soft)",
        whiteSpace: "pre",
        overflow: "auto",
        maxHeight: 280,
      }}>{renderYaml(yaml)}</pre>
    </div>
  );
}

// Light syntax tinting: keys = ink, strings/values = soft, comments = faint.
function renderYaml(src) {
  if (!src) return null;
  const lines = src.split("\n");
  return lines.map((line, i) => {
    // match `  key:` or `  - key:` or list item `  - value`
    const m = line.match(/^(\s*-?\s*)([A-Za-z0-9_.-]+)(:)(\s*)(.*)$/);
    if (m) {
      const [, lead, key, colon, sp, val] = m;
      return (
        <div key={i}>
          <span style={{ whiteSpace: "pre" }}>{lead}</span>
          <span style={{ color: "var(--ink)", fontWeight: 500 }}>{key}</span>
          <span style={{ color: "var(--ink-faint)" }}>{colon}</span>
          <span style={{ whiteSpace: "pre" }}>{sp}</span>
          <span style={{ color: "var(--ink-soft)" }}>{val}</span>
        </div>
      );
    }
    // bare list item
    const li = line.match(/^(\s*)(- )(.*)$/);
    if (li) {
      const [, lead, dash, rest] = li;
      return (
        <div key={i}>
          <span style={{ whiteSpace: "pre" }}>{lead}</span>
          <span style={{ color: "var(--ink-faint)" }}>{dash}</span>
          <span style={{ color: "var(--ink-soft)" }}>{rest}</span>
        </div>
      );
    }
    return <div key={i} style={{ whiteSpace: "pre" }}>{line || " "}</div>;
  });
}

function SearchBox({ value, count, total }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      border: "1px solid rgba(26,26,26,0.18)", borderRadius: 4,
      padding: "3px 8px",
      fontFamily: "var(--mono)", fontSize: 11,
      minWidth: 240, background: "var(--paper)",
    }}>
      <span style={{ color: "var(--ink-faint)" }}>⌕</span>
      <input
        defaultValue={value || ""}
        placeholder="search logs…"
        style={{
          border: "none", outline: "none", background: "transparent",
          fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink)",
          flex: 1, padding: 0,
        }}
      />
      <span style={{ color: "var(--ink-faint)", fontSize: 10, whiteSpace: "nowrap" }}>
        {count === total ? `${total}` : `${count}/${total}`}
      </span>
    </div>
  );
}

// ---- Log body ----

function LogBody({ lines, base }) {
  return (
    <div style={{
      flex: 1, overflow: "auto",
      background: "#1a1a1a",
      fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.5,
      color: "#d8d4c8",
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: 56 }} />
          <col style={{ width: 86 }} />
          <col style={{ width: 64 }} />
          <col />
        </colgroup>
        <tbody>
          {lines.map((l, i) => {
            const elapsed = (l.ts - base) / 1000;
            const isErr = l.stream === "stderr";
            return (
              <tr key={i} style={{ background: isErr ? "rgba(212,68,68,0.08)" : "transparent" }}>
                <td style={{ padding: "1px 8px", color: "#5a5a55", textAlign: "right", userSelect: "none", verticalAlign: "top" }}>{i + 1}</td>
                <td style={{ padding: "1px 8px", color: "#8a8a82", textAlign: "right", userSelect: "none", verticalAlign: "top" }}>+{elapsed.toFixed(3)}s</td>
                <td style={{ padding: "1px 8px", verticalAlign: "top", userSelect: "none" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "0 5px",
                    borderRadius: 2,
                    fontSize: 9,
                    letterSpacing: "0.08em",
                    fontWeight: 700,
                    color: isErr ? "#ff8e8e" : "#7fb59d",
                    border: `1px solid ${isErr ? "#7a3535" : "#3a6655"}`,
                    background: isErr ? "rgba(212,68,68,0.12)" : "rgba(58,170,136,0.08)",
                  }}>{l.stream === "stdout" ? "OUT" : "ERR"}</span>
                </td>
                <td style={{ padding: "1px 12px 1px 8px", whiteSpace: "pre", overflow: "hidden", textOverflow: "ellipsis", color: isErr ? "#f5b8b8" : "#d8d4c8", verticalAlign: "top" }}>
                  {l.text}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

Object.assign(window, { NodeView, W_NODE, H_NODE });
