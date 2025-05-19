// LoginPage.jsx - 로그인 페이지 컴포넌트
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { saveToken, saveUser } from '../utils/authUtils';
import axios from 'axios';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 입력값 검증
    if (!credentials.email || !credentials.password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // URL에 호스트 명시적으로 추가 - 절대 경로 사용
      const response = await axios.post(
        'http://localhost:8080/api/auth/login',
        credentials,
        {
          // axios 요청에 추가 설정
          withCredentials: true, // CORS 쿠키 처리를 위해 필요할 수 있음
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // 응답 확인을 위해 전체 응답 로깅
      console.log('로그인 응답:', response);

      // JWT 토큰 확인 및 저장
      const token = response.data.token || response.data.accessToken;

      if (!token) {
        console.error('토큰이 응답에 포함되어 있지 않습니다:', response.data);
        throw new Error('토큰이 응답에 포함되어 있지 않습니다.');
      }

      // localStorage에 토큰 저장 및 확인
      saveToken(token);
      console.log('토큰 저장됨:', token);

      // 로컬 스토리지에 실제로 저장되었는지 확인
      const savedToken = localStorage.getItem('jwt');
      console.log('저장된 토큰 확인:', savedToken);

      // 사용자 정보도 저장 (선택적)
      if (response.data.user) {
        saveUser(response.data.user);
        console.log('사용자 정보 저장됨:', response.data.user);
      }

      // 로그인 성공 후 메인 페이지로 이동
      navigate('/dashboard');
      setTimeout(() => {
        if (window.location.pathname !== '/dashboard') {
          console.log('navigate가 작동하지 않음, window.location 사용');
          window.location.href = '/dashboard';
        }
      }, 500);
    } catch (error) {
      // 에러 객체 자세히 로깅
      console.error('로그인 오류 발생:', error);

      if (error.response) {
        // 서버 응답이 있는 경우 (4xx, 5xx 상태 코드)
        console.error('서버 응답 오류:', {
          status: error.response.status,
          data: error.response.data,
        });

        if (error.response.data && error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError(`서버 오류 (${error.response.status}): 다시 시도해주세요.`);
        }
      } else if (error.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        console.error('서버로부터 응답이 없습니다:', error.request);
        setError('서버 연결에 실패했습니다. 네트워크 연결을 확인해주세요.');
      } else {
        // 요청 설정 중 오류가 발생한 경우
        console.error('요청 설정 오류:', error.message);
        setError('요청 처리 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          PeekPort 로그인
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="이메일"
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="비밀번호"
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 text-sm text-gray-600"
              >
                로그인 상태 유지
              </label>
            </div>

            <div>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-3 rounded transition-colors hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isLoading ? '처리 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
