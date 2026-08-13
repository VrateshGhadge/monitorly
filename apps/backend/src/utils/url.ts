export function isSafeMonitorUrl(url: string): boolean {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return false;
  }

  // Only allow HTTP and HTTPS
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return false;
  }

  // Reject credentials in URL
  if (parsedUrl.username || parsedUrl.password) {
    return false;
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Empty hostname
  if (!hostname) {
    return false;
  }

  // Block localhost & metadata services
  const blockedHostnames = new Set([
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
    "169.254.169.254",
  ]);

  if (blockedHostnames.has(hostname)) {
    return false;
  }

  // Block localhost subdomains
  if (hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    return false;
  }

  // Block 10.x.x.x
  if (hostname.startsWith("10.")) {
    return false;
  }

  // Block 192.168.x.x
  if (hostname.startsWith("192.168.")) {
    return false;
  }

  // Block 172.16.x.x - 172.31.x.x
  if (hostname.startsWith("172.")) {
    const secondOctet = Number(hostname.split(".")[1]);

    if (secondOctet >= 16 && secondOctet <= 31) {
      return false;
    }
  }

  // Block IPv6 private ranges
  if (
    hostname.startsWith("fc") ||
    hostname.startsWith("fd") ||
    hostname.startsWith("fe80")
  ) {
    return false;
  }

  return true;
}
