import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { RouteSuspense } from '../app/RouteLoading';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

/**
 * Routes that own their own full-width, full-height layout. The AI takeoff
 * workspace is professional drawing software — it cannot sit inside a
 * centred reading column with page padding.
 */
const FULL_BLEED = [/^\/takeoff\/[^/]+$/];

export function AppShell() {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const fullBleed = FULL_BLEED.some((r) => r.test(location.pathname));

  return (
    <div className={fullBleed ? 'h-full overflow-hidden bg-canvas' : 'min-h-full bg-canvas'}>
      <Sidebar mobileOpen={navOpen} onCloseMobile={() => setNavOpen(false)} />
      <div className={`flex flex-col lg:pl-[264px] ${fullBleed ? 'h-full' : 'min-h-full'}`}>
        <TopBar onOpenNav={() => setNavOpen(true)} />
        <main className={fullBleed ? 'min-h-0 flex-1' : 'flex-1'}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: fullBleed ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className={fullBleed ? 'h-full' : 'page-container pb-16'}>
            
            <RouteSuspense>
              <Outlet />
            </RouteSuspense>
          </motion.div>
        </main>
      </div>
    </div>);

}



/** Main column + sticky context rail, collapsing to one column on small screens. */
export function TwoColumn({
  main,
  aside,
  asideFirstOnMobile




}: {main: React.ReactNode;aside: React.ReactNode;asideFirstOnMobile?: boolean;}) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className={`min-w-0 space-y-6 ${asideFirstOnMobile ? 'order-2 xl:order-1' : ''}`}>{main}</div>
      <div className={`min-w-0 space-y-6 xl:sticky xl:top-[88px] xl:self-start ${asideFirstOnMobile ? 'order-1 xl:order-2' : ''}`}>
        {aside}
      </div>
    </div>);

}