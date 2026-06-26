import { Link } from 'react-router-dom';
import GlassPanel from '../../components/ui/GlassPanel';
import LoginForm from '../../components/auth/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <GlassPanel className="w-full max-w-md">
        <h1 className="font-heading text-2xl text-center mb-6">Login</h1>
        <LoginForm />
        <p className="text-center text-white/50 mt-4">
          Belum punya akun?{' '}
          <Link to="/register" className="text-blue-400 hover:underline">
            Register
          </Link>
        </p>
      </GlassPanel>
    </div>
  );
};

export default Login;
