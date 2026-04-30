// Shared data + tiny helper components for The Conn wireframes.
// Exposes window globals for the three artboard files.

const PIPELINE_NAME = "deploy.web-edge";
const NAMESPACE = "jefferies";
const REPO = "jefferies/web-edge";
const SHA = "8a3f2c1";
const RUN_ID = "R-9821";
const OWNER = "k.archer";
const ON_CALL = "k.archer";

// 12 nodes — realistic shape with one failure cluster
// Each node has wait (created → started) and run (started → end). status: ok | fail | run | pending | skip
const NODES = [
  { id: "n01", name: "checkout",         wait:  2, start:  4, end:  16, status: "ok",      lane: "setup" },
  { id: "n02", name: "restore-cache",    wait: 16, start: 18, end:  24, status: "ok",      lane: "setup" },
  { id: "n03", name: "install-deps",     wait: 24, start: 26, end:  82, status: "ok",      lane: "setup" },
  { id: "n04", name: "lint",             wait: 82, start: 88, end: 104, status: "ok",      lane: "verify" },
  { id: "n05", name: "typecheck",        wait: 82, start: 95, end: 124, status: "ok",      lane: "verify" },
  { id: "n06", name: "test-unit",        wait:104, start:112, end: 168, status: "fail",    lane: "verify" },
  { id: "n07", name: "test-integration", wait:104, start:118, end: 200, status: "ok",      lane: "verify" },
  { id: "n08", name: "build-web",        wait:124, start:140, end: 232, status: "ok",      lane: "build" },
  { id: "n09", name: "build-edge",       wait:124, start:148, end: 256, status: "ok",      lane: "build" },
  { id: "n10", name: "scan-vulns",       wait:232, start:240, end: 272, status: "skip",    lane: "verify" },
  { id: "n11", name: "deploy-staging",   wait:256, start:256, end: 256, status: "pending", lane: "deploy" },
  { id: "n12", name: "deploy-prod",      wait:256, start:256, end: 256, status: "pending", lane: "deploy" },
];

const TOTAL_T = 280;

// Run list — 9 prior runs to fill sidebar
// triggerType: branch | tag | pr | retry
const RUNS = [
  { id: "R-9821", name: "deploy.web-edge",       repo: "jefferies/web-edge",  sha: "8a3f2c1", status: "fail", recency: "2m ago",  current: true, triggerType: "branch", ref: "main" },
  { id: "R-9820", name: "deploy.web-edge",       repo: "jefferies/web-edge",  sha: "1bd0e44", status: "ok",   recency: "14m ago", triggerType: "pr", ref: "feat/edge-router", prNum: 482, prBase: "main" },
  { id: "R-9819", name: "test.web-edge",         repo: "jefferies/web-edge",  sha: "f02ac9d", status: "run",  recency: "18m ago", triggerType: "branch", ref: "release/2.4" },
  { id: "R-9818", name: "release.cli",           repo: "jefferies/conn-cli",  sha: "44c1289", status: "ok",   recency: "32m ago", triggerType: "tag", ref: "v1.8.2" },
  { id: "R-9817", name: "deploy.web-edge",       repo: "jefferies/web-edge",  sha: "2a7b3e9", status: "fail", recency: "1h ago",  triggerType: "retry", ref: "main", retryOf: "R-9810" },
  { id: "R-9816", name: "nightly.observability", repo: "jefferies/obs-stack", sha: "ee05f17", status: "ok",   recency: "3h ago",  triggerType: "branch", ref: "main" },
  { id: "R-9815", name: "deploy.gateway",        repo: "jefferies/gateway",   sha: "9c41a02", status: "cancel", recency: "4h ago",  triggerType: "pr", ref: "fix/timeout-bug", prNum: 311, prBase: "main" },
  { id: "R-9814", name: "release.cli",           repo: "jefferies/conn-cli",  sha: "3306d8a", status: "ok",   recency: "6h ago",  triggerType: "tag", ref: "v1.8.1" },
  { id: "R-9813", name: "deploy.web-edge",       repo: "jefferies/web-edge",  sha: "771ba00", status: "ok",   recency: "1d ago",  triggerType: "branch", ref: "main" },
];

const CURRENT_RUN = RUNS[0];

// Log lines (sample) — kept for wire-b log preview
const LOG_LINES = [
  { t: "+00:00", lvl: "info",  text: "▸ test-unit: starting (worker-3)" },
  { t: "+00:02", lvl: "info",  text: "  resolved 412 specs across 38 files" },
  { t: "+00:08", lvl: "info",  text: "  PASS  src/router/url.spec.ts (12)" },
  { t: "+00:14", lvl: "info",  text: "  PASS  src/cache/lru.spec.ts (24)" },
  { t: "+00:31", lvl: "info",  text: "  PASS  src/auth/session.spec.ts (8)" },
  { t: "+00:48", lvl: "warn",  text: "  ⚠ flaky: src/queue/drain.spec.ts (retry 1/2)" },
  { t: "+00:59", lvl: "info",  text: "  PASS  src/queue/drain.spec.ts (retry passed)" },
  { t: "+01:02", lvl: "err",   text: "  FAIL  src/edge/handler.spec.ts" },
  { t: "+01:02", lvl: "err",   text: "    × handler › routes /v2/* to edge worker" },
  { t: "+01:02", lvl: "err",   text: "      AssertionError: expected 'edge-v1' to equal 'edge-v2'" },
  { t: "+01:02", lvl: "err",   text: "        at handler.spec.ts:84:23" },
  { t: "+01:04", lvl: "err",   text: "▸ test-unit: exited (code 1) — 1 failed, 411 passed" },
];

// ---- Node view sample data (shape matches API) ----
// API: { id, run_id, node_name, node_definition, success, created_at, started_at, completed_at }
const NODE_DETAIL = {
  id: 1428,
  run_id: "9f3a8c2e-4b1d-4f0a-9e7c-8d3a1b2c5e7f",
  node_name: "test-unit",
  success: false,
  created_at:   "2026-04-30T17:10:14.108Z", // dispatch
  started_at:   "2026-04-30T17:10:22.341Z", // pod ready
  completed_at: "2026-04-30T17:11:18.962Z", // exit
  node_definition:
`name: test-unit
needs: [build]
runner:
  image: node:20-bullseye
  cpu: 2
  memory: 4Gi
  timeout: 10m
env:
  CI: "true"
  NODE_ENV: test
  COVERAGE: "1"
cache:
  - key: node-modules-{{ hash "package-lock.json" }}
    path: node_modules
steps:
  - run: npm ci --prefer-offline
  - run: npm run test:unit -- --reporters=default --reporters=summary
artifacts:
  - junit/**/*.xml
  - coverage/lcov.info
retries: 1`,
};

// Frontend computes elapsed seconds from earliest log timestamp.
// ts is unix ms.
const NODE_LOGS_BASE_MS = 1777525822341; // matches started_at
const NODE_LOGS = [
  { ts: 1777525822341, stream: "stdout", text: "▸ test-unit: starting (worker-3)" },
  { ts: 1777525822421, stream: "stdout", text: "  > jest --runInBand --reporters=default --reporters=summary" },
  { ts: 1777525824510, stream: "stdout", text: "  resolved 412 specs across 38 files" },
  { ts: 1777525830162, stream: "stdout", text: "  PASS  src/router/url.spec.ts (12)" },
  { ts: 1777525836940, stream: "stdout", text: "  PASS  src/cache/lru.spec.ts (24)" },
  { ts: 1777525841117, stream: "stderr", text: "(node:1) ExperimentalWarning: VM Modules is an experimental feature" },
  { ts: 1777525846803, stream: "stdout", text: "  PASS  src/middleware/cors.spec.ts (6)" },
  { ts: 1777525852088, stream: "stdout", text: "  PASS  src/auth/session.spec.ts (8)" },
  { ts: 1777525860244, stream: "stderr", text: "[warn] flaky test detected — src/queue/drain.spec.ts (retry 1/2)" },
  { ts: 1777525864880, stream: "stdout", text: "  PASS  src/queue/drain.spec.ts (retry passed)" },
  { ts: 1777525870510, stream: "stdout", text: "  RUNS  src/edge/handler.spec.ts" },
  { ts: 1777525873432, stream: "stderr", text: "[error] AssertionError: expected 'edge-v1' to equal 'edge-v2'" },
  { ts: 1777525873433, stream: "stderr", text: "    at Object.<anonymous> (src/edge/handler.spec.ts:84:23)" },
  { ts: 1777525873434, stream: "stderr", text: "    at processTicksAndRejections (node:internal/process/task_queues:96:5)" },
  { ts: 1777525873812, stream: "stdout", text: "  FAIL  src/edge/handler.spec.ts" },
  { ts: 1777525873820, stream: "stdout", text: "    ✕ handler › routes /v2/* to edge worker  (412 ms)" },
  { ts: 1777525874020, stream: "stdout", text: "    ✓ handler › routes /v1/* to legacy worker (88 ms)" },
  { ts: 1777525876200, stream: "stderr", text: "npm error code EACCES" },
  { ts: 1777525876201, stream: "stderr", text: "npm error syscall mkdir" },
  { ts: 1777525876202, stream: "stderr", text: "npm error path /.npm" },
  { ts: 1777525876203, stream: "stderr", text: "npm error errno -13" },
  { ts: 1777525878410, stream: "stdout", text: "Tests: 1 failed, 411 passed, 412 total" },
  { ts: 1777525878411, stream: "stdout", text: "Time:  56.07 s" },
  { ts: 1777525878962, stream: "stderr", text: "▸ test-unit: exited (code 1)" },
];

// helper: status → glyph
const Glyph = ({ status, size = 12 }) => {
  const s = { width: size, height: size, display: "inline-block", verticalAlign: "middle" };
  switch (status) {
    case "ok":      return <svg style={s} viewBox="0 0 12 12"><path d="M2 6 l3 3 l5 -6" fill="none" stroke="var(--status-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "fail":    return <svg style={s} viewBox="0 0 12 12"><path d="M3 3 l6 6 M9 3 l-6 6" fill="none" stroke="var(--status-red)" strokeWidth="2" strokeLinecap="round"/></svg>;
    case "cancel":  return <svg style={s} viewBox="0 0 12 12"><circle cx="6" cy="6" r="4" fill="none" stroke="var(--status-grey)" strokeWidth="1.5"/><line x1="3.2" y1="3.2" x2="8.8" y2="8.8" stroke="var(--status-grey)" strokeWidth="1.5" strokeLinecap="round"/></svg>;
    case "run":     return <svg style={s} viewBox="0 0 12 12"><circle cx="6" cy="6" r="4" fill="none" stroke="var(--status-yellow)" strokeWidth="2" strokeDasharray="3 2"/></svg>;
    case "pending": return <svg style={s} viewBox="0 0 12 12"><circle cx="6" cy="6" r="3.5" fill="none" stroke="var(--ink-faint)" strokeWidth="1.5" strokeDasharray="1.5 1.5"/></svg>;
    case "skip":    return <svg style={s} viewBox="0 0 12 12"><path d="M3 6 h6" fill="none" stroke="var(--ink-faint)" strokeWidth="2" strokeLinecap="round"/></svg>;
    default:        return <span style={s}/>;
  }
};

// status → color var
const STATUS_COLOR = {
  ok:      "var(--status-green)",
  fail:    "var(--status-red)",
  run:     "var(--status-yellow)",
  cancel:  "var(--status-grey)",
  pending: "var(--ink-faint)",
  skip:    "var(--ink-faint)",
};
const STATUS_SOFT = {
  ok:      "var(--status-green-soft)",
  fail:    "var(--status-red-soft)",
  run:     "var(--status-yellow-soft)",
  cancel:  "var(--paper-2)",
  pending: "var(--paper-2)",
  skip:    "var(--paper-2)",
};

// Trigger type → icon + color
// branch: ⎇  / blue tone
// tag:    ⌖  / purple tone
// pr:     ⇄  / green tone
// retry:  ↻  / amber tone (always references retryOf)
const TRIGGER_META = {
  branch: { icon: "⎇", label: "branch", color: "#4a7aa8", soft: "#dde6f0" },
  tag:    { icon: "⌖", label: "tag",    color: "#8a5cb8", soft: "#e6dcef" },
  pr:     { icon: "⇄", label: "PR",     color: "#3a8a6e", soft: "#d5e8df" },
  retry:  { icon: "↻", label: "retry",  color: "#c47a1c", soft: "#f0dcc0" },
};

// Renders the trigger as an inline glyph + ref text.
// inline: just glyph+ref. detail: full tag with type label.
const TriggerChip = ({ run, size = 11, detail }) => {
  const m = TRIGGER_META[run.triggerType] || TRIGGER_META.branch;
  const refText = run.triggerType === "pr"
    ? `#${run.prNum} ${run.ref}→${run.prBase}`
    : run.ref;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontFamily: "var(--mono)", fontSize: size,
      padding: detail ? "2px 6px" : "1px 4px",
      borderRadius: 3,
      background: detail ? m.soft : "transparent",
      border: detail ? `1px solid ${m.color}55` : "none",
      color: m.color,
      whiteSpace: "nowrap",
    }}>
      <span style={{ fontWeight: 700 }}>{m.icon}</span>
      {detail && <span style={{ textTransform: "uppercase", fontSize: size - 1, letterSpacing: "0.08em", fontWeight: 700, opacity: .85 }}>{m.label}</span>}
      <span style={{ color: "var(--ink)", fontWeight: 500 }}>{refText}</span>
    </span>
  );
};

// Retry → original link (small chip)
const RetryLink = ({ run, size = 10 }) => {
  if (run.triggerType !== "retry" || !run.retryOf) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      fontFamily: "var(--mono)", fontSize: size,
      color: TRIGGER_META.retry.color, fontWeight: 600,
    }}>
      <span style={{ fontSize: size + 2, lineHeight: 1 }}>↪</span>
      retry of <span style={{ textDecoration: "underline" }}>{run.retryOf}</span>
    </span>
  );
};

// Section header — uppercase command-center label
const HandHeader = ({ children, size = 11 }) => (
  <div style={{
    fontFamily: "var(--mono)",
    fontSize: size,
    fontWeight: 700,
    lineHeight: 1,
    color: "var(--ink-soft)",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  }}>
    {children}
  </div>
);

// Mono "code" inline
const Mono = ({ children, dim, size }) => (
  <span style={{
    fontFamily: "var(--mono)",
    fontSize: size || 11,
    color: dim ? "var(--ink-faint)" : "var(--ink-soft)",
    letterSpacing: "0.01em",
  }}>{children}</span>
);

// Naval-coord-style breadcrumb (still useful as a path indicator, not naval-flavored)
const Breadcrumb = ({ items, sep = "›" }) => (
  <span className="sk-coord" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
    {items.map((it, i) => (
      <React.Fragment key={i}>
        {i > 0 && <span style={{ opacity: .45 }}>{sep}</span>}
        <span style={{ color: i === items.length - 1 ? "var(--ink)" : "var(--ink-faint)", fontWeight: i === items.length - 1 ? 600 : 400 }}>{it}</span>
      </React.Fragment>
    ))}
  </span>
);

// Sketchy refresh / radar icon
const Radar = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" style={{ verticalAlign: "middle" }}>
    <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1"/>
    <circle cx="7" cy="7" r="3" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5"/>
    <path d="M7 7 L11 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

// THE CONN wordmark — command-center, all caps, wide tracking
const Wordmark = ({ size = 13 }) => (
  <span style={{ fontFamily: "var(--mono)", fontSize: size, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ink)" }}>
    THE&nbsp;CONN
  </span>
);

// "you have the conn" callout for top-right
const ConnHandoff = ({ handle = ON_CALL }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "3px 10px",
    border: "1px solid var(--ink)",
    borderRadius: 999,
    background: "var(--paper-2)",
    fontFamily: "var(--ui)", fontSize: 12, fontWeight: 500, color: "var(--ink)",
    whiteSpace: "nowrap",
  }}>
    <span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--status-green)" }}/>
    <span style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>@{handle}</span>
    <span style={{ opacity: .75 }}>— you have the conn</span>
  </span>
);

Object.assign(window, {
  PIPELINE_NAME, NAMESPACE, REPO, SHA, RUN_ID, OWNER, ON_CALL,
  NODES, TOTAL_T, RUNS, CURRENT_RUN, LOG_LINES,
  NODE_DETAIL, NODE_LOGS, NODE_LOGS_BASE_MS,
  Glyph, STATUS_COLOR, STATUS_SOFT,
  TRIGGER_META, TriggerChip, RetryLink,
  HandHeader, Mono, Breadcrumb, Radar, Wordmark, ConnHandoff,
});
