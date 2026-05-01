import { jsonToYaml, valueToYaml, type JsonValue } from '@/utils/jsonToYaml';

type JsonObject = { [key: string]: JsonValue };

function isObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asStringArray(value: JsonValue | undefined): string[] | null {
  if (!Array.isArray(value)) return null;
  if (!value.every((item) => typeof item === 'string')) return null;
  return value as string[];
}

function asStringMap(value: JsonValue | undefined): Record<string, string> | null {
  if (!isObject(value)) return null;
  const out: Record<string, string> = {};
  for (const k of Object.keys(value)) {
    const v = value[k];
    if (typeof v !== 'string') return null;
    out[k] = v;
  }
  return out;
}

function buildConfigToJson(raw: JsonObject): JsonObject | null {
  const containerfile = raw.containerfile;
  if (typeof containerfile !== 'string') return null;
  const tags = asStringArray(raw.tags);
  if (tags === null) return null;
  const buildArgs = asStringArray(raw.build_args);
  if (buildArgs === null) return null;

  const config: JsonObject = { containerfile, tags };
  if (buildArgs.length > 0) config.build_args = buildArgs;
  return config;
}

export function toUserConfiguredNode(json: string): JsonValue | null {
  if (!json) return null;
  let parsed: JsonValue;
  try {
    parsed = JSON.parse(json) as JsonValue;
  } catch {
    return null;
  }
  if (!isObject(parsed)) return null;

  const name = parsed.name;
  if (typeof name !== 'string') return null;

  const kindRaw = parsed.kind;
  let kind: 'exec' | 'build';
  let buildConfig: JsonObject | null = null;
  if (kindRaw === 'exec') {
    kind = 'exec';
  } else if (isObject(kindRaw) && isObject(kindRaw.build)) {
    const config = buildConfigToJson(kindRaw.build);
    if (config === null) return null;
    kind = 'build';
    buildConfig = config;
  } else {
    return null;
  }

  const checkout = parsed.checkout === true;
  const env = asStringMap(parsed.env) ?? {};
  const dependencies = asStringArray(parsed.dependencies) ?? [];
  const timeoutSecs =
    typeof parsed.timeout_secs === 'number' || parsed.timeout_secs === null
      ? parsed.timeout_secs
      : null;
  const steps = asStringArray(parsed.steps) ?? [];
  const image = typeof parsed.image === 'string' ? parsed.image : '';

  const out: JsonObject = { name };
  if (kind === 'build') out.type = 'build';
  if (kind === 'exec') out.image = image;
  if (checkout) out.checkout = true;
  if (Object.keys(env).length > 0) out.env = env;
  if (dependencies.length > 0) out.dependencies = dependencies;
  if (timeoutSecs !== null) out.timeout_secs = timeoutSecs;
  if (kind === 'exec' && steps.length > 0) out.steps = steps;
  if (kind === 'build' && buildConfig !== null) out.config = buildConfig;

  return out;
}

export function nodeDefinitionToYaml(json: string): string {
  const normalized = toUserConfiguredNode(json);
  if (normalized === null) return jsonToYaml(json);
  return valueToYaml(normalized);
}
