export { default as middleware } from "next-auth/middleware";

export const config = {
  // Protect these routes (redirect to login if not authenticated)
  matcher: ["/settings", "/saved", "/project/:path*/edit", "/profile/:path*", "/my-projects"],
};

