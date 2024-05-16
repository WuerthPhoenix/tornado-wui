export function getTimezones(): string[] {
  return (Intl as any).supportedValuesOf("timeZone");
}
