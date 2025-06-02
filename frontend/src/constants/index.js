// 색상 테마
export const COLORS = {
  SHORT: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
  MID: ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d'],
  LONG: ['#a4de6c', '#d0ed57', '#ffc658', '#ff7300'],
  CASH: ['#0088FE', '#FF8042'],
  // 추가 색상 세트
  ACCENT: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#4D9DE0'],
  GRADIENT: {
    BLUE: 'linear-gradient(135deg, #0072ff 0%, #00c6ff 100%)',
    GREEN: 'linear-gradient(135deg, #1D976C 0%, #93F9B9 100%)',
    PURPLE: 'linear-gradient(135deg, #834d9b 0%, #d04ed6 100%)',
    ORANGE: 'linear-gradient(135deg, #f46b45 0%, #eea849 100%)'
  }
};

// 용어 라벨
export const TERM_LABELS = {
  short: '단기',
  mid: '중기',
  long: '장기'
};

// 애니메이션 지속 시간 (ms)
export const ANIMATION = {
  FAST: 200,
  NORMAL: 500,
  SLOW: 1000,
  NUMBER: 1500
};

// 포맷 함수
export const formatCurrency = (value) => {
  return value.toLocaleString() + '원';
};

export const formatPercent = (value) => {
  return value.toFixed(2) + '%';
};