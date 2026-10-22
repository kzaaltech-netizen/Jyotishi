// Shared visual mapping for planet pills in both chart styles.
export function pillClass(planet, active) {
  if (active) return 'fill-accent stroke-accent';
  switch (planet.dignity) {
    case 'Exalted':
      return 'fill-gold-soft stroke-gold';
    case 'Own Sign':
      return 'fill-panel-2 stroke-gold/60';
    case 'Debilitated':
      return 'fill-panel stroke-danger/60';
    default:
      return 'fill-panel stroke-line';
  }
}

export const DIGNITY_LEGEND = [
  { label: 'Exalted', swatch: 'bg-gold-soft border-gold' },
  { label: 'Own sign', swatch: 'bg-panel-2 border-gold/60' },
  { label: 'Debilitated', swatch: 'bg-panel border-danger/60' },
];
