import { twMerge } from 'tailwind-merge';

/**
 * SM PRO brand mark, drawn as vector outlines so it is sharp at every size
 * and never waits on an image or font request.
 *
 *   Logo      — full lockup: orange "SM" tile + "PRO" wordmark.
 *   LogoMark  — the tile on its own, for dense headers and app icons.
 *
 * `inverted` renders the wordmark in white for dark surfaces.
 */

const VIEW_W = 94;
const VIEW_H = 40;
const TILE = 40;
const SM_PATH =
'M10.83 31.33L10.83 31.33Q8.76 31.33 7.38 30.59Q5.99 29.86 5.29 28.32Q4.58 26.79 4.50 24.35L4.50 24.35L8.66 23.72Q8.68 25.13 8.91 26.00Q9.14 26.87 9.57 27.25Q9.99 27.63 10.58 27.63L10.58 27.63Q11.34 27.63 11.58 27.12Q11.81 26.60 11.81 26.03L11.81 26.03Q11.81 24.67 11.15 23.73Q10.50 22.80 9.39 21.85L9.39 21.85L7.49 20.19Q6.24 19.13 5.38 17.79Q4.53 16.44 4.53 14.46L4.53 14.46Q4.53 11.66 6.18 10.18Q7.84 8.70 10.69 8.70L10.69 8.70Q12.46 8.70 13.53 9.30Q14.60 9.90 15.16 10.86Q15.72 11.82 15.92 12.90Q16.12 13.97 16.15 14.95L16.15 14.95L11.97 15.46Q11.94 14.49 11.85 13.77Q11.75 13.05 11.45 12.65Q11.15 12.26 10.53 12.26L10.53 12.26Q9.85 12.26 9.54 12.83Q9.23 13.40 9.23 13.97L9.23 13.97Q9.23 15.19 9.81 15.97Q10.39 16.74 11.34 17.58L11.34 17.58L13.16 19.19Q14.60 20.41 15.60 21.96Q16.59 23.50 16.59 25.79L16.59 25.79Q16.59 27.33 15.88 28.60Q15.17 29.86 13.88 30.59Q12.59 31.33 10.83 31.33ZM22.57 31L19.07 31L19.45 9L24.66 9L27.08 21.79L29.69 9L34.71 9L35.09 31L31.64 31L31.24 16.36L28.68 31L25.61 31L22.90 16.25L22.57 31Z';
const PRO_PATH =
'M50.49 31L45.63 31L45.63 9L53.02 9Q55 9 56.28 9.75Q57.55 10.49 58.18 11.92Q58.80 13.35 58.80 15.38L58.80 15.38Q58.80 17.94 57.96 19.28Q57.12 20.62 55.68 21.14Q54.24 21.66 52.45 21.66L52.45 21.66L50.49 21.66L50.49 31ZM50.49 12.42L50.49 18.26L52.12 18.26Q53.02 18.26 53.48 17.94Q53.94 17.61 54.09 16.96Q54.24 16.31 54.24 15.30L54.24 15.30Q54.24 14.46 54.12 13.82Q54.00 13.18 53.53 12.80Q53.07 12.42 52.09 12.42L52.09 12.42L50.49 12.42ZM66.60 31L61.74 31L61.74 9L67.80 9Q70.02 9 71.65 9.49Q73.28 9.98 74.19 11.24Q75.10 12.50 75.10 14.81L75.10 14.81Q75.10 16.17 74.88 17.23Q74.67 18.29 74.08 19.06Q73.50 19.84 72.41 20.35L72.41 20.35L75.43 31L70.40 31L67.99 21.14L66.60 21.14L66.60 31ZM66.60 12.26L66.60 18.34L67.96 18.34Q68.99 18.34 69.56 17.98Q70.13 17.61 70.36 16.92Q70.59 16.22 70.59 15.25L70.59 15.25Q70.59 13.83 70.08 13.05Q69.56 12.26 68.18 12.26L68.18 12.26L66.60 12.26ZM84.94 31.33L84.94 31.33Q82.46 31.33 81.02 30.46Q79.59 29.59 78.96 27.96Q78.34 26.33 78.34 24.07L78.34 24.07L78.34 15.90Q78.34 13.62 78.96 12.01Q79.59 10.41 81.02 9.56Q82.46 8.70 84.94 8.70L84.94 8.70Q87.43 8.70 88.89 9.56Q90.34 10.41 90.97 12.01Q91.59 13.62 91.59 15.90L91.59 15.90L91.59 24.07Q91.59 26.33 90.97 27.96Q90.34 29.59 88.89 30.46Q87.43 31.33 84.94 31.33ZM84.94 27.88L84.94 27.88Q85.70 27.88 86.05 27.50Q86.40 27.12 86.51 26.52Q86.62 25.92 86.62 25.30L86.62 25.30L86.62 14.70Q86.62 14.05 86.51 13.47Q86.40 12.88 86.05 12.50Q85.70 12.12 84.94 12.12L84.94 12.12Q84.23 12.12 83.88 12.50Q83.52 12.88 83.41 13.47Q83.31 14.05 83.31 14.70L83.31 14.70L83.31 25.30Q83.31 25.92 83.40 26.52Q83.50 27.12 83.84 27.50Q84.18 27.88 84.94 27.88Z';

/** Rendered height in px for each named size. */
const HEIGHTS = { xs: 16, sm: 20, md: 24, lg: 34, xl: 48 } as const;

export type LogoSize = keyof typeof HEIGHTS;

const BRAND = '#F96317';

export function Logo({
  size = 'md',
  inverted,
  className
}: {size?: LogoSize;inverted?: boolean;className?: string;}) {
  const height = HEIGHTS[size];
  return (
    <svg
      role="img"
      aria-label="SM PRO"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      height={height}
      width={height * VIEW_W / VIEW_H}
      className={twMerge('shrink-0', className)}>
      <rect width={TILE} height={TILE} rx={4.5} fill={BRAND} />
      <path d={SM_PATH} fill="#fff" />
      <path d={PRO_PATH} fill={inverted ? '#fff' : BRAND} />
    </svg>);

}

export function LogoMark({ size = 'md', className }: {size?: LogoSize;className?: string;}) {
  const height = HEIGHTS[size];
  return (
    <svg
      role="img"
      aria-label="SM PRO"
      viewBox={`0 0 ${TILE} ${TILE}`}
      height={height}
      width={height}
      className={twMerge('shrink-0', className)}>
      <rect width={TILE} height={TILE} rx={4.5} fill={BRAND} />
      <path d={SM_PATH} fill="#fff" />
    </svg>);

}
