export type Rank = 'MAX' | 'SS' | 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export function calcRank(value: number): Rank {
  if (value >= 999) return 'MAX';
  if (value >= 500) return 'SS';
  if (value >= 300) return 'S';
  if (value >= 200) return 'A';
  if (value >= 150) return 'B';
  if (value >= 100) return 'C';
  if (value >= 60)  return 'D';
  if (value >= 30)  return 'E';
  return 'F';
}

export const rankColor: Record<Rank, string> = {
  MAX: '#FFD700',
  SS:  '#FFD700',
  S:   '#FFD700',
  A:   '#EE1111',
  B:   '#2233EE',
  C:   '#119933',
  D:   '#CC8800',
  E:   '#888888',
  F:   '#888888',
};
