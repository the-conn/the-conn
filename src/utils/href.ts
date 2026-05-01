interface QueryStringSource {
  toString(): string;
}

export function withSearchParams(path: string, params: QueryStringSource | null): string {
  const qs = params?.toString() ?? '';
  return qs ? `${path}?${qs}` : path;
}
