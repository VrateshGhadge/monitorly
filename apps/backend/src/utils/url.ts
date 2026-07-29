
export function isSafeMonitorUrl(url: string): boolean {
  // Parse the URL and extract only the hostname
  // Example:
  // https://stackoverflow.com/questions -> stackoverflow.com
  // http://127.0.0.1:3000 -> 127.0.0.1
  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname.toLowerCase();

  // Block well-known local and metadata hosts
  // These should never be monitored by users.
  const blockedHostnames = new Set([
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
    "169.254.169.254", // Cloud metadata service
  ]);

  // Reject exact hostname matches
  if (blockedHostnames.has(hostname)) {
    return false;
  }

  // Block private IPv4 ranges:
  // 10.0.0.0 - 10.255.255.255
  // 192.168.0.0 - 192.168.255.255
  if (
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.")
  ) {
    return false;
  }

  // Block RFC1918 private range:
  // 172.16.0.0 - 172.31.255.255
  if (hostname.startsWith("172.")) {
    const secondOctet = Number(hostname.split(".")[1]);

    if (secondOctet >= 16 && secondOctet <= 31) {
      return false;
    }
  }

  // URL is considered safe
  return true;
}


