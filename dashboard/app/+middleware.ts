// Server-side middleware for Expo Router

// Role-based route protection configuration
const ROLE_ROUTES: Record<string, string[]> = {
  ADMIN: ["/dashboard/admin"],
  FARMER: ["/dashboard/farmer"],
  RETAILER: ["/dashboard/retailer"],
  GOVERNMENT_AGENCY: ["/dashboard/agency"],
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/home",
  "/welcome",
  "/onboarding",
  "/(auth)/login",
  "/(auth)/register",
  "/(auth)/forgot-password",
  "/oauth-callback",
];

/**
 * Extract JWT token from cookies or Authorization header
 */
function getTokenFromRequest(request: Request): string | null {
  // Try to get token from Authorization header first
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // On web, tokens are stored in cookies (HttpOnly)
  // The cookie name might be 'access_token' or set by your backend
  // Since we can't read HttpOnly cookies in middleware, we'll rely on the API call
  return null;
}

/**
 * Check if a route is public (doesn't require authentication)
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route.includes("(")) {
      // Handle route groups like (auth)
      return pathname.startsWith(route.replace(/\([^)]+\)/, ""));
    }
    return pathname === route || pathname.startsWith(route + "/");
  });
}

/**
 * Get required role for a route
 */
function getRequiredRole(pathname: string): string | null {
  for (const [role, routes] of Object.entries(ROLE_ROUTES)) {
    if (routes.some((route) => pathname.startsWith(route))) {
      return role;
    }
  }
  return null;
}

/**
 * Verify user authentication and role by calling the API
 */
async function verifyAuth(
  request: Request
): Promise<{ authenticated: boolean; role?: string }> {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) {
    return { authenticated: false };
  }

  try {
    // Get cookies from the request
    const cookieHeader = request.headers.get("cookie");

    // Try to get token from Authorization header if available
    const token = getTokenFromRequest(request);

    // Make request to verify authentication
    const response = await fetch(`${apiUrl}/user/profile`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      credentials: "include",
    });

    if (!response.ok) {
      return { authenticated: false };
    }

    const data = await response.json();
    const user = data?.data || data;

    return {
      authenticated: true,
      role: user.role,
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return { authenticated: false };
  }
}

/**
 * Get dashboard route based on user role
 */
function getDashboardRouteForRole(role?: string): string {
  const roleRoutes: Record<string, string> = {
    FARMER: "/dashboard/farmer",
    RETAILER: "/dashboard/retailer",
    GOVERNMENT_AGENCY: "/dashboard/agency",
    ADMIN: "/dashboard/admin",
  };
  return role && roleRoutes[role] ? roleRoutes[role] : "/home";
}

/**
 * Check if pathname is a login/auth route
 * Note: Expo Router route groups like (auth) are not shown in the URL,
 * so /(auth)/login is accessed as /login
 */
function isLoginRoute(pathname: string): boolean {
  // Normalize pathname - remove route group syntax if present
  const normalizedPath = pathname.replace(/\/\([^)]+\)/g, "");
  return normalizedPath === "/login" || normalizedPath.startsWith("/login/");
}

/**
 * Server-side middleware for route protection
 */
export default async function middleware(request: Request) {
  const { pathname } = new URL(request.url);

  // Check if user is trying to access login page while authenticated
  if (isLoginRoute(pathname)) {
    try {
      const { authenticated, role } = await verifyAuth(request);
      if (authenticated) {
        // User is already authenticated, redirect to their dashboard
        const dashboardRoute = getDashboardRouteForRole(role);
        return Response.redirect(
          new URL(dashboardRoute, request.url).toString(),
          302
        );
      }
      // Not authenticated, allow access to login page
      return;
    } catch (error) {
      // If auth check fails, allow access to login page
      console.error("Middleware auth check failed:", error);
      return;
    }
  }

  // Allow public routes - return undefined to let request pass through
  if (isPublicRoute(pathname)) {
    return;
  }

  // Check if route requires authentication
  const requiredRole = getRequiredRole(pathname);

  // If route is in dashboard but no specific role required, still check auth
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (!isDashboardRoute && !requiredRole) {
    // Not a protected route, allow access - return undefined to let request pass through
    return;
  }

  // Verify authentication
  try {
    const { authenticated, role } = await verifyAuth(request);

    if (!authenticated) {
      // Not authenticated, redirect to login
      const loginUrl = new URL("/login", request.url);
      return Response.redirect(loginUrl.toString(), 302);
    }

    // If role is required, verify user has the correct role
    if (requiredRole && role !== requiredRole) {
      // User doesn't have required role, redirect to home
      const homeUrl = new URL("/home", request.url);
      return Response.redirect(homeUrl.toString(), 302);
    }

    // All checks passed, allow request - return undefined to let request pass through
    return;
  } catch (error) {
    // If auth verification fails (e.g., API unavailable), allow request to pass through
    // This prevents blocking the entire app if the backend is down
    console.error("Middleware auth check failed:", error);
    return;
  }
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
