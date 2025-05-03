
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  // Redirect to dashboard
  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl">Redirecting to Portal Dashboard...</h1>
      </div>
    </div>
  );
};

export default Index;
