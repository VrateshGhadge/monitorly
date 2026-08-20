export function isSafeMonitorUrl(url: string): boolean {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return false;
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return false;
  }

  if (parsedUrl.username || parsedUrl.password) {
    return false;
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  if (!hostname) {
    return false;
  }

  // Block localhost and local domains
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local")
  ) {
    return false;
  }

  // Block IPv4 addresses
  const ipv4 = hostname.match(
    /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/
  );

  if (ipv4) {
    const [, a, b, c, d] = ipv4.map(Number);

    if (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    ) {
      return false;
    }
  }

  // Block IPv6 loopback/private/link-local
  if (
    hostname === "::1" ||
    hostname.startsWith("fc") ||
    hostname.startsWith("fd") ||
    hostname.startsWith("fe80")
  ) {
    return false;
  }

  return true;
}