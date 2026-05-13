import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/env";

const PROTECTED_PREFIXES = ["/account", "/checkout", "/wishlist"];
const ADMIN_PREFIX = "/admin";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // No env yet? Pass-through so the storefront keeps rendering.
  if (!isSupabaseConfigured()) return res;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (all) =>
          all.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          ),
      },
    },
  );

  // Refreshes the auth cookie on every request.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = req.nextUrl;
  const next = encodeURIComponent(pathname + search);

  // Gate /account, /checkout, /wishlist behind any signed-in user
  if (!user && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL(`/login?next=${next}`, req.url));
  }

  // Gate /admin behind role = admin | super_admin
  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (!user) {
      return NextResponse.redirect(new URL(`/login?next=${next}`, req.url));
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || !["admin", "super_admin"].includes(profile.role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return res;
}

// Match every page except static assets, image optimisation, favicons, and brand assets.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|icon|apple-icon|brand|.*\\.(?:webp|png|jpg|jpeg|svg|gif|ico)$).*)",
  ],
};
