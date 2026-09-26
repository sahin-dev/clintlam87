import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Official SM PRO brand assets. The source files are square with generous
 * clear space around the artwork, so each variant is rendered as a cropped
 * background at a fixed height. That keeps the mark optically identical —
 * same size, same baseline, same spacing — on every surface it appears on.
 */
const ASSET_LIGHT = "/9B91B1E2-4F4D-4C2E-B5C1-75D65F31FB3E.png";

const ASSET_ON_BRAND = "/46CFC537-12B0-4F83-AB34-ADDCA5B2EF55.png";


/** Rendered height in px for each named size. */
const HEIGHTS = { xs: 18, sm: 22, md: 28, lg: 40, xl: 56 } as const;

export type LogoSize = keyof typeof HEIGHTS;

/** Crop geometry for the full lockup (mark + wordmark) in each asset. */
const LOCKUP_LIGHT = { ratio: 1.926, scale: 2.247, left: -0.189, top: -0.571 };
const LOCKUP_BRAND = { ratio: 1.812, scale: 1.98, left: -0.099, top: -0.4455 };
/** Crop geometry for the square "SM" tile on its own. */
const MARK_LIGHT = { ratio: 1, scale: 2.304, left: -0.2166, top: -0.608 };

function cropStyle(
height: number,
asset: string,
crop: {ratio: number;scale: number;left: number;top: number;})
: React.CSSProperties {
  return {
    height,
    width: height * crop.ratio,
    backgroundImage: `url(${asset})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${height * crop.scale}px ${height * crop.scale}px`,
    backgroundPosition: `${height * crop.left}px ${height * crop.top}px`
  };
}

/**
 * Square SM PRO app tile. Use where a compact, square brand token is needed
 * (avatars, favicons, dense headers) — never as a substitute for the lockup.
 */
export function LogoMark({ size = 'md', className }: {size?: LogoSize;className?: string;}) {
  const height = HEIGHTS[size];
  return (
    <span
      role="img"
      aria-label="SM PRO"
      className={twMerge('inline-block shrink-0 rounded-[6px] mix-blend-multiply', className)}
      style={cropStyle(height, ASSET_LIGHT, MARK_LIGHT)} />);


}

/**
 * Primary SM PRO lockup.
 * `inverted` swaps to the on-brand asset for dark surfaces, rendered as a
 * contained badge so the orange field reads as intentional brand space.
 */
export function Logo({
  size = 'md',
  inverted,
  className




}: {size?: LogoSize;inverted?: boolean;className?: string;}) {
  const height = HEIGHTS[size];
  const crop = inverted ? LOCKUP_BRAND : LOCKUP_LIGHT;
  const asset = inverted ? ASSET_ON_BRAND : ASSET_LIGHT;
  return (
    <span
      role="img"
      aria-label="SM PRO"
      className={twMerge(
        'inline-block shrink-0',
        inverted ? 'rounded-[8px]' : 'mix-blend-multiply',
        className
      )}
      style={cropStyle(height, asset, crop)} />);


}