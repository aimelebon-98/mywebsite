"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { useCustomer } from "@/lib/customer-context";
import {
  User, LayoutDashboard, Package, Settings, LogOut, LogIn, UserPlus
} from "lucide-react";

interface Props {
  iconColor: string;
  iconHoverBg: string;
}

export default function AccountHoverMenu({ iconColor, iconHoverBg }: Props) {
  const locale = useLocale();
  const isFr = locale === "fr";
  const { customer, logout } = useCustomer();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };
  const cancelClose = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  // ===== NOT LOGGED IN =====
  // Mobile: icon links straight to login (no hover menu)
  // Desktop: hover shows dropdown with Login + Dashboard
  if (!customer) {
    const guestItems = [
      { href: `/${locale}/account/login`,     icon: LogIn,            label: isFr ? "Connexion"       : "Login" },
      { href: `/${locale}/account/dashboard`, icon: LayoutDashboard,  label: isFr ? "Tableau de bord" : "Dashboard" },
    ];

    return (
      <div
        className="relative hidden md:block"
        onMouseEnter={() => { cancelClose(); setOpen(true); }}
        onMouseLeave={scheduleClose}
      >
        <Link
          href={`/${locale}/account/login`}
          aria-label={isFr ? "Compte" : "Account"}
          className={"relative inline-flex p-2 rounded-xl transition " + iconHoverBg}
        >
          <User className={"w-5 h-5 " + iconColor} />
        </Link>

        {/* Guest dropdown panel */}
        <div
          className={"absolute right-0 top-full w-56 z-50 transition-all duration-150 origin-top-right pt-2 " +
            (open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none")}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="absolute right-3 top-1 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45" />

          <div className="relative bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden">
            <div className="px-4 pt-3.5 pb-3 border-b border-gray-100">
              <div className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase mb-0.5">
                {isFr ? "Bienvenue" : "Welcome"}
              </div>
              <div className="text-sm text-gray-700">
                {isFr ? "Connectez-vous \u00e0 votre compte" : "Sign in to your account"}
              </div>
            </div>

            <div className="py-1.5">
              {guestItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#CA3F2E] transition group"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-[#CA3F2E]" strokeWidth={1.75} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <div className="text-xs text-gray-500">
                {isFr ? "Pas de compte ?" : "No account?"}{" "}
                <Link
                  href={`/${locale}/account/register`}
                  onClick={() => setOpen(false)}
                  className="text-[#CA3F2E] font-semibold hover:underline"
                >
                  {isFr ? "S\u0027inscrire" : "Sign up"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== LOGGED IN =====
  const items = [
    { href: `/${locale}/account/dashboard`, icon: LayoutDashboard, label: isFr ? "Tableau de bord" : "Dashboard" },
    { href: `/${locale}/account/orders`,    icon: Package,         label: isFr ? "Mes commandes"   : "My Orders" },
    { href: `/${locale}/account/profile`,   icon: User,            label: isFr ? "Profil"          : "Profile" },
  ];

  const firstName = customer.name ? customer.name.split(" ")[0] : (isFr ? "Compte" : "Account");

  return (
    <div
      className="relative hidden md:block"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      <Link
        href={`/${locale}/account/dashboard`}
        aria-label="Account"
        className={"relative inline-flex p-2 rounded-xl transition " + iconHoverBg}
      >
        <User className={"w-5 h-5 " + iconColor} />
      </Link>

      <div
        className={"absolute right-0 top-full w-64 z-50 transition-all duration-150 origin-top-right pt-2 " +
          (open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none")}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        <div className="absolute right-3 top-1 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45" />

        <div className="relative bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden">
          <div className="px-4 pt-3.5 pb-3 border-b border-gray-100">
            <div className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase mb-0.5">
              {isFr ? "Connect\u00e9 en tant que" : "Signed in as"}
            </div>
            <div className="font-semibold text-sm text-gray-900 truncate">{firstName}</div>
            <div className="text-xs text-gray-500 truncate">{customer.email}</div>
          </div>

          <div className="py-1.5">
            {items.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#CA3F2E] transition group"
                >
                  <Icon className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-[#CA3F2E]" strokeWidth={1.75} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}

            <button
              onClick={() => { setOpen(false); logout(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#CA3F2E] transition group"
            >
              <LogOut className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-[#CA3F2E]" strokeWidth={1.75} />
              <span>{isFr ? "Se d\u00e9connecter" : "Log out"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
