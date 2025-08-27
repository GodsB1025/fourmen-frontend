import { useNavigate } from 'react-router-dom';

// 간단한 아이콘 SVG (컴포넌트 내부에 포함하여 별도 파일이 필요 없음)
const NotFoundIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="80"
    height="80"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: '#4b52ff', marginBottom: '20px' }}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);


export default function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/'); // 홈으로 이동
  };

  const handleGoBack = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  return (
    <div style={styles.container}>
      <NotFoundIcon />
      <h1 style={styles.title}>404 - 페이지를 찾을 수 없습니다.</h1>
      <p style={styles.description}>
        죄송합니다. 요청하신 페이지가 존재하지 않거나,
        <br />
        주소가 변경되었을 수 있습니다.
      </p>
      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={handleGoBack}>
          이전 페이지로
        </button>
        <button style={{ ...styles.button, ...styles.primaryButton }} onClick={handleGoHome}>
          홈으로 가기
        </button>
      </div>
    </div>
  );
}

// 스타일 객체
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: '1rem',
  },
  description: {
    fontSize: '1rem',
    color: '#6c757d',
    lineHeight: '1.5',
    marginBottom: '2rem',
  },
  buttonContainer: {
    display: 'flex',
    gap: '1rem', // 버튼 사이 간격
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#495057',
    backgroundColor: '#ffffff',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
  },
  primaryButton: {
    color: '#ffffff',
    backgroundColor: '#4b52ff',
    border: 'none',
  },
} as const;