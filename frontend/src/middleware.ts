import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = ["/dashboard", "/my-registrations", "/organizer", "/admin"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("event-platform.token")?.value;
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  let isExpired = true;

  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const payloadStr = Buffer.from(b64, 'base64').toString('utf8');
        const payload = JSON.parse(payloadStr);
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          isExpired = false;
        }
      }
    } catch {
      // Ignored, evaluates as expired
    }
  }

  if (isExpired) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const response = NextResponse.redirect(loginUrl);
    // Clear dead cookies to prevent loop issues
    response.cookies.delete("event-platform.token");
    response.cookies.delete("event-platform.refresh");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/my-registrations/:path*", "/organizer/:path*", "/admin/:path*"]
};
