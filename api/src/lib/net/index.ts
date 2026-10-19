export function getHostName(): string {
  return Deno.hostname();
}

// `URL.hostname` rend un littéral IPv6 entre crochets ; les clients TCP/TLS attendent l'adresse nue.
export function stripIpv6Brackets(hostname: string): string {
  return hostname.replace(/^\[(.*)\]$/, "$1");
}
