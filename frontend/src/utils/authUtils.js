// authUtils.js - 인증 관련 유틸리티 함수 
import axios from 'axios';

// JWT 토큰 저장
export const saveToken = (token) => {
  localStorage.setItem('jwt', token);
};

// JWT 토큰 가져오기
export const getToken = () => {
  return localStorage.getItem('jwt');
};

// JWT 토큰 삭제
export const removeToken = () => {
  localStorage.removeItem('jwt');
};

// 사용자 정보 저장
export const saveUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// 사용자 정보 가져오기
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('사용자 정보 파싱 오류', e);
      return null;
    }
  }
  return null;
};

// 로그아웃
export const logout = () => {
  removeToken();
  localStorage.removeItem('user');
  // 필요한 경우 추가 정리 작업
};

// 인증 상태 확인
export const isAuthenticated = () => {
  return !!getToken();
};

// 인증 헤더를 포함한 axios 인스턴스 생성
export const authAxios = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true
});

// 요청 인터셉터 - 모든 요청에 인증 헤더 추가
authAxios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 글로벌 axios 설정 - 모든 요청에 인증 헤더 추가
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// authUtils.js 파일에서 403 오류 처리 부분 수정
// 글로벌 axios 응답 인터셉터 - 401, 403 오류 등 처리
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API 오류:', error.message);
    
    // 서버 응답이 있는 경우
    if (error.response) {
      const { status } = error.response;
      
      // 401 Unauthorized: 인증 오류
      if (status === 401) {
        console.log('인증 오류: 로그인 만료됨');
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        logout();
        window.location.href = '/login';
      } 
      // 403 Forbidden: 권한 오류
      else if (status === 403) {
        console.log('접근 권한 오류 (403 Forbidden)');
        alert('접근 권한이 없는 포트폴리오입니다.');
        
        // 현재 경로 확인
        const currentPath = window.location.pathname;
        
        // API 요청은 window.location.pathname에 포함되지 않기 때문에
        // 페이지 URL 기반으로만 확인
        if (currentPath.includes('/portfolio/')) {
          console.log('포트폴리오 상세 페이지에서 리다이렉트');
          window.location.href = '/portfolio';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// authAxios 응답 인터셉터에도 403 처리 추가
authAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      // 401 Unauthorized: 인증 오류
      if (status === 401) {
        console.log('인증 오류: 로그인 만료됨');
        logout();
        window.location.href = '/login';
      }
      // 403 Forbidden: 권한 오류
      else if (status === 403) {
        console.log('접근 권한 오류 (403 Forbidden - authAxios)');
        alert('접근 권한이 없는 포트폴리오입니다.');
        
        // 현재 경로 확인
        const currentPath = window.location.pathname;
        
        // 포트폴리오 상세 페이지에서만 리다이렉트
        if (currentPath.includes('/portfolio/')) {
          console.log('포트폴리오 상세 페이지에서 리다이렉트');
          window.location.href = '/portfolio';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default {
  saveToken,
  getToken,
  removeToken,
  saveUser,
  getUser,
  logout,
  isAuthenticated,
  authAxios
};