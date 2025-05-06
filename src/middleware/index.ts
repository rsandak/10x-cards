import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../lib/supabase/client";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  // Auth pages
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Get user session
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Auth error:", error.message);
    return redirect("/auth/login");
  }

  if (user) {
    // Add user data to locals for use in routes
    locals.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    return next();
  }

  // Redirect to login for protected routes
  return redirect("/auth/login");
});
