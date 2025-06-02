// SignupPage.jsx - 회원가입 페이지 컴포넌트
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name) {
      setError('이름을 입력해주세요.');
      return false;
    }

    if (!formData.email) {
      setError('이메일을 입력해주세요.');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('유효한 이메일 주소를 입력해주세요.');
      return false;
    }

    if (!formData.password) {
      setError('비밀번호를 입력해주세요.');
      return false;
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 회원가입 API 호출
      const response = await axios.post('/api/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      console.log('회원가입 성공:', response.data);

      // 로그인 페이지로 리다이렉트
      navigate('/login', {
        state: {
          message: '회원가입이 완료되었습니다. 로그인해주세요.',
        },
      });
    } catch (err) {
      console.error('회원가입 오류:', err);

      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          PeekPort 회원가입
        </h2>

        <p className="text-center text-sm text-gray-600 mb-6">
          계정이 이미 있으신가요?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            로그인
          </Link>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm text-gray-700 mb-1">
              이름
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="홍길동"
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm text-gray-700 mb-1"
            >
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="8자 이상 입력해주세요"
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm text-gray-700 mb-1"
            >
              비밀번호 확인
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호를 다시 입력해주세요"
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-3 rounded transition-colors hover:bg-blue-700 disabled:bg-blue-400 mt-2"
          >
            {isLoading ? '처리 중...' : '회원가입'}
          </button>

          <p className="text-xs text-center text-gray-500 mt-4">
            회원가입 시{' '}
            <Link to="/terms" className="text-blue-600 hover:underline">
              이용약관
            </Link>
            과{' '}
            <Link to="/privacy" className="text-blue-600 hover:underline">
              개인정보처리방침
            </Link>
            에 동의하게 됩니다.
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
