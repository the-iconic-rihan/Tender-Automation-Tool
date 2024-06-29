export function clearCookies() {
  const allCookies = document.cookie.split("; ");
  for (let cookieIndex = 0; cookieIndex < allCookies.length; cookieIndex++) {
    const hostnameParts = window.location.hostname.split(".");
    while (hostnameParts.length > 0) {
      const [cookieName] = allCookies[cookieIndex].split(";")[0].split("=");
      const cookieBase = `${encodeURIComponent(
        cookieName
      )}=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=${hostnameParts.join(
        "."
      )} ;path=`;
      const pathParts = location.pathname.split("/");
      document.cookie = cookieBase + "/";
      while (pathParts.length > 0) {
        document.cookie = cookieBase + pathParts.join("/");
        pathParts.pop();
      }
      hostnameParts.shift();
    }
  }
}
