import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Enforce redirection protection on /admin paths (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const isLoggedIn = request.cookies.get("balenpop_admin_logged_in")?.value === "true";
    
    if (!isLoggedIn) {
      // Redirect to login page if not authenticated
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect logged-in users away from /admin/login
  if (pathname === "/admin/login") {
    const isLoggedIn = request.cookies.get("balenpop_admin_logged_in")?.value === "true";
    if (isLoggedIn) {
      const dashboardUrl = new URL("/admin/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

// Config to specify matching route paths
export const config = {
  matcher: ["/admin/:path*"],
};
