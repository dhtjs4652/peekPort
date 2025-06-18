import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// API 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 포트폴리오 API
export const portfolioApi = {
  // 포트폴리오 목록 조회
  getPortfolios: () => api.get('/portfolios'),
  
  // 포트폴리오 생성
  createPortfolio: (data) => api.post('/portfolios', data),
  
  // 포트폴리오 요약 정보 조회
  getPortfolioSummary: (portfolioId) => api.get(`/portfolios/${portfolioId}/summary`),
  
  // 현금 업데이트
  updateCash: (portfolioId, cash) => api.put(`/portfolios/${portfolioId}/cash`, { cash }),
};

// 자산 API
export const assetApi = {
  // 포트폴리오의 자산 목록 조회
  getAssets: (portfolioId) => api.get(`/portfolios/${portfolioId}/stocks`),
  
  // 자산 상세 조회
  getAssetDetail: (portfolioId, stockId) => api.get(`/portfolios/${portfolioId}/stocks/${stockId}`),
};

export default api; 