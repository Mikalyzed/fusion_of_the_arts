import { NextResponse, type NextRequest } from "next/server";

const REALM = "Fusion of the Arts Admin";
const USERNAME = "admin";

export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;

  // If no password is configured, fail closed: deny all admin access.
  if (!password) {
    return new NextResponse("Admin password not configured", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    const [user, ...rest] = decoded.split(":");
    const pass = rest.join(":");
    if (user === USERNAME && pass === password) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
      "Content-Type": "text/plain",
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
