// authUtils.js - 인증 관련 유틸리티 함수
import axios from 'axios';

// JWT 토큰 저장
export const saveToken = (token) => {
  localStorage.setItem('token', token);
};

// JWT 토큰 가져오기
export const getToken = () => {
  return localStorage.getItem('token');
};

// JWT 토큰 삭제
export const removeToken = () => {
  localStorage.removeItem('token');
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
export const authAxios = axios.create();

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

// 응답 인터셉터 - 401 오류 처리
authAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // 인증 오류 시 로그아웃
      logout();
      // 로그인 페이지로 리다이렉트 (선택적)
      window.location.href = '/login';
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