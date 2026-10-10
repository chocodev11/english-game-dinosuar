// Thứ tự và màu nhận diện của 5 cấp độ Skin (màu đủ tương phản cho chữ nhỏ trên nền sáng)
export const SKIN_TIERS = [
  { id: 'Basic', color: '#6f6f6f' },
  { id: 'Rare', color: '#2563eb' },
  { id: 'Legendary', color: '#7c3aed' },
  { id: 'God', color: '#a16207' },
  { id: 'Secret', color: '#db2777' },
];

export const TIER_COLORS = Object.fromEntries(SKIN_TIERS.map((t) => [t.id, t.color]));
