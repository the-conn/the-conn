// Wireframe A: SPARSE + HORIZONTAL GANTT + FIXED SIDEBAR
// Conventional baseline — clean UI font (no handwriting in chrome).

const W_A = 1280;
const H_A = 820;

function WireA({ runState = "fail", errorFocus = false }) {
  const visibleNodes = errorFocus
    ? NODES.filter(n => n.status === "fail" || (n.status === "ok" && NODES.find(x => x.status === "fail" && x.start <= n.end && x.end >= n.start)))
    : NODES;

  return (
    <div className="sk-wire" style={{ width: W_A, height: H_A }}>
      {/* TOP NAV */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 18px", borderBottom: "1.2px solid var(--ink)", background: "var(--paper)" }}>
        <Wordmark size={13} />
        <div style={{ width: 1, height: 16, background: "var(--ink-trace)" }} />
        <Breadcrumb items={[NAMESPACE, "web-edge", RUN_ID]} />
        <div style={{ flex: 1 }} />
        <ConnHandoff handle={ON_CALL} />
        <button className="sk-btn small ghost" title="Manual sync"><Radar size={12}/> sync</button>
      </div>

      <div style={{ display: "flex", height: H_A - 45 }}>
        {/* SIDEBAR — fixed, sparse */}
        <aside style={{ width: 296, borderRight: "1.2px solid var(--ink)", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10, background: "var(--paper)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <HandHeader size={11}>Pipeline Runs</HandHeader>
            <span className="sk-mono tiny" style={{ marginLeft: "auto", color: "var(--ink-faint)" }}>9 of 248</span>
          </div>
          <div className="sk-box dashed" style={{ padding: "5px 9px", display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-faint)", fontFamily: "var(--ui)" }}>
            <span>⌕</span> filter — pipeline, sha, status…
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, overflow: "hidden", flex: 1 }}>
            {RUNS.slice(0, 8).map(r => (
              <RunCardSparse key={r.id} run={r} />
            ))}
          </div>
          {/* Pagination */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "6px 2px 2px", borderTop: "1px solid var(--ink-trace)",
            fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-faint)",
          }}>
            <button className="sk-btn small ghost" style={{ padding: "2px 6px" }} disabled>‹ prev</button>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span>page</span>
              <span style={{ color: "var(--ink)", fontWeight: 600 }}>1</span>
              <span>/ 28</span>
            </span>
            <button className="sk-btn small ghost" style={{ padding: "2px 6px" }}>next ›</button>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, padding: "16px 24px 20px", display: "flex", flexDirection: "column", gap: 14, overflow: "hidden", position: "relative" }}>
          {/* Status banner */}
          <StatusBanner state={runState} />

          {/* Metadata */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 0.9fr", gap: 10 }}>
            <Meta label="trigger">
              <TriggerChip run={CURRENT_RUN} size={11} detail />
            </Meta>
            {CURRENT_RUN.triggerType === "retry" && (
              <Meta label="retry of">
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, color: TRIGGER_META.retry.color, textDecoration: "underline" }}>
                  ↪ {CURRENT_RUN.retryOf}
                </span>
              </Meta>
            )}
            <Meta label="owner"  value={OWNER}  mono />
            <Meta label="repo"   value={REPO}   mono />
            <Meta label="sha"    value={SHA}    mono />
            <Meta label="elapsed" value="04:20" mono />
          </div>

          {/* Timeline header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <HandHeader size={11}>Timeline</HandHeader>
              <Legend />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="sk-btn small command">↻ RE-RUN</button>
              <button className="sk-btn small danger command">■ CANCEL</button>
            </div>
          </div>

          {/* GANTT — main artifact */}
          <Gantt nodes={visibleNodes} />

          {/* Node grid (sparse) */}
          <div style={{ marginTop: 2 }}>
            <HandHeader size={11}>Nodes</HandHeader>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {visibleNodes.slice(0, 8).map(n => <NodeChip key={n.id} node={n} />)}
          </div>
        </main>
      </div>
    </div>
  );
}

function RunCardSparse({ run }) {
  return (
    <div className="sk-box" style={{
      padding: "7px 9px 7px 12px",
      position: "relative",
      background: run.current ? "var(--paper-2)" : "var(--paper)",
      borderWidth: run.current ? 1.5 : 1,
    }}>
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
        background: STATUS_COLOR[run.status],
      }}/>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
        <Glyph status={run.status} size={10}/>
        <Mono size={10}>{run.id}</Mono>
        <span style={{ flex: 1 }}/>
        <span className="sk-mono tiny" style={{ opacity: .65, color: "var(--ink-faint)" }}>{run.recency}</span>
      </div>
      <div className="sk-hand" style={{ fontSize: 13, marginBottom: 3 }}>{run.name}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <TriggerChip run={run} size={10} />
      </div>
      <div style={{ marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
        <Mono size={9}>{run.repo.split("/")[1]} · {run.sha}</Mono>
      </div>
      {run.triggerType === "retry" && (
        <div style={{ marginTop: 3 }}>
          <RetryLink run={run} size={9} />
        </div>
      )}
    </div>
  );
}

function StatusBanner({ state }) {
  const map = {
    fail: { label: "RED ALERT",  msg: "Build failed in node 'test-unit'", color: "var(--status-red)",    soft: "var(--status-red-soft)" },
    run:  { label: "IN PROGRESS",msg: "5 of 12 nodes running",  color: "var(--status-yellow)", soft: "var(--status-yellow-soft)" },
    ok:   { label: "SUCCESS",    msg: "12 of 12 nodes succeeded",         color: "var(--status-green)",  soft: "var(--status-green-soft)" },
  };
  const s = map[state] || map.fail;
  return (
    <div className="sk-box" style={{ padding: "9px 14px", background: s.soft, display: "flex", alignItems: "center", gap: 12, position: "relative", overflow: "hidden", borderWidth: 1.5, borderColor: s.color }}>
      <div style={{ width: 8, height: 8, borderRadius: 4, background: s.color, boxShadow: `0 0 0 4px ${s.color}33` }}/>
      <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: 11, color: s.color, letterSpacing: "0.18em" }}>{s.label}</span>
      <span style={{ fontFamily: "var(--ui)", fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{s.msg}</span>
      <span style={{ flex: 1 }}/>
      <Mono size={11}>elapsed 04:20</Mono>
    </div>
  );
}

function Meta({ label, value, mono, children }) {
  return (
    <div className="sk-box dashed" style={{ padding: "5px 9px" }}>
      <div className="sk-mono tiny" style={{ textTransform: "uppercase", opacity: .55, marginBottom: 2, letterSpacing: "0.06em" }}>{label}</div>
      {children
        ? <div style={{ minHeight: 16 }}>{children}</div>
        : <div style={{ fontFamily: mono ? "var(--mono)" : "var(--ui)", fontSize: 12, fontWeight: 500, color: "var(--ink)" }}>{value}</div>}
    </div>
  );
}

function Legend() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "var(--ui)", fontSize: 11, color: "var(--ink-soft)" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
        <span style={{ display: "inline-block", width: 14, height: 8, background: "var(--paper-3)", border: "1px solid var(--ink-faint)", borderStyle: "dashed", borderRadius: 1 }}/>
        wait (queued)
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
        <span style={{ display: "inline-block", width: 14, height: 8, background: "var(--status-green-soft)", border: "1.2px solid var(--status-green)", borderRadius: 1 }}/>
        run (executing)
      </span>
    </div>
  );
}

function Gantt({ nodes }) {
  const ROW_H = 22;
  const GAP = 4;
  const labelW = 130;
  const ticks = [0, 60, 120, 180, 240];

  return (
    <div className="sk-box" style={{ padding: "12px 14px 14px", background: "var(--paper)" }}>
      {/* axis */}
      <div style={{ display: "flex" }}>
        <div style={{ width: labelW }}/>
        <div style={{ flex: 1, position: "relative", height: 14, marginBottom: 6 }}>
          {ticks.map(t => (
            <div key={t} style={{ position: "absolute", left: `${(t / TOTAL_T) * 100}%`, top: 0, transform: "translateX(-50%)" }}>
              <span className="sk-mono tiny" style={{ color: "var(--ink-faint)" }}>+{Math.floor(t/60).toString().padStart(2,'0')}:{(t%60).toString().padStart(2,'0')}</span>
            </div>
          ))}
        </div>
      </div>
      {/* rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: GAP, position: "relative" }}>
        {/* vertical tick lines */}
        <div style={{ position: "absolute", left: labelW, right: 0, top: 0, bottom: 0, pointerEvents: "none" }}>
          {ticks.map(t => (
            <div key={t} style={{ position: "absolute", left: `${(t / TOTAL_T) * 100}%`, top: 0, bottom: 0, width: 1, background: "var(--ink-trace)", opacity: .55 }}/>
          ))}
        </div>
        {nodes.map(n => {
          const waitLeft = (n.wait / TOTAL_T) * 100;
          const waitWidth = Math.max(0, ((n.start - n.wait) / TOTAL_T) * 100);
          const runLeft = (n.start / TOTAL_T) * 100;
          const runWidth = Math.max(0, ((n.end - n.start) / TOTAL_T) * 100);
          const isPending = n.status === "pending";
          return (
            <div key={n.id} style={{ display: "flex", alignItems: "center", height: ROW_H, position: "relative" }}>
              <div style={{ width: labelW, display: "flex", alignItems: "center", gap: 6, paddingRight: 8 }}>
                <Glyph status={n.status} size={10}/>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.name}</span>
              </div>
              <div style={{ flex: 1, position: "relative", height: ROW_H }}>
                {/* WAIT segment (created → started) */}
                {!isPending && waitWidth > 0.1 && (
                  <div style={{
                    position: "absolute",
                    left: `${waitLeft}%`,
                    width: `${waitWidth}%`,
                    top: 6, height: ROW_H - 12,
                    background: "transparent",
                    border: `1px dashed ${STATUS_COLOR[n.status]}`,
                    borderRadius: 2,
                    backgroundImage: `repeating-linear-gradient(-45deg, transparent 0, transparent 3px, ${n.status === 'fail' ? 'rgba(212,68,68,0.18)' : n.status === 'run' ? 'rgba(220,168,56,0.20)' : n.status === 'ok' ? 'rgba(51,170,136,0.15)' : 'rgba(0,0,0,0.07)'} 3px, ${n.status === 'fail' ? 'rgba(212,68,68,0.18)' : n.status === 'run' ? 'rgba(220,168,56,0.20)' : n.status === 'ok' ? 'rgba(51,170,136,0.15)' : 'rgba(0,0,0,0.07)'} 4px)`,
                  }} title={`waited ${Math.round(n.start - n.wait)}s in queue`}/>
                )}
                {/* RUN segment (started → end) */}
                {!isPending && runWidth > 0.1 && (
                  <div style={{
                    position: "absolute",
                    left: `${runLeft}%`,
                    width: `${Math.max(0.8, runWidth)}%`,
                    top: 4, height: ROW_H - 8,
                    background: STATUS_SOFT[n.status],
                    border: `1.2px solid ${STATUS_COLOR[n.status]}`,
                    borderRadius: 2,
                    display: "flex", alignItems: "center", paddingLeft: 6,
                  }}>
                    <span className="sk-mono tiny" style={{ color: "var(--ink)", fontWeight: 600 }}>
                      {Math.round(n.end - n.start)}s
                    </span>
                    {(n.start - n.wait) >= 6 && runWidth > 6 && (
                      <span className="sk-mono tiny" style={{ marginLeft: 6, color: "var(--ink-faint)", fontWeight: 500 }}>
                        wait {Math.round(n.start - n.wait)}s
                      </span>
                    )}
                  </div>
                )}
                {isPending && (
                  <div style={{ position: "absolute", left: `${runLeft}%`, top: 6, fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-faint)" }}>· · · pending</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NodeChip({ node }) {
  const waited = Math.max(0, node.start - node.wait);
  const ran = Math.max(0, node.end - node.start);
  return (
    <div className="sk-box" style={{ padding: "6px 9px 6px 12px", position: "relative", overflow: "hidden", background: STATUS_SOFT[node.status] }}>
      <div className="sk-bar" style={{ background: STATUS_COLOR[node.status] }}/>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Glyph status={node.status} size={10}/>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600 }}>{node.name}</span>
        <span style={{ flex: 1 }}/>
        <Mono size={10}>{ran}s</Mono>
      </div>
      {waited > 0 && (
        <div style={{ marginTop: 2, fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-faint)" }}>
          wait {waited}s · run {ran}s
        </div>
      )}
    </div>
  );
}

Object.assign(window, { WireA, W_A, H_A });
