import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent, CardSubtitle } from './components/card.tsx';
import { IconCircle } from '../../components/icons/icon-circle.tsx';
import { SignalIcon } from '../../components/icons/signal-icon.tsx';
import { LoginForm } from './components/login-form.tsx';

export const Login = () => {
    const navigate = useNavigate();
    const { login, isLoading, error } = useAuth();

    const handleSubmit = async (username: string, password: string, rememberMe: boolean) => {
        await login(username, password, rememberMe);
        navigate('/products', { replace: true });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card>
                <div className="w-[399px] mx-auto">
                    <CardHeader className="flex flex-col items-center pt-12">
                        <IconCircle>
                            <SignalIcon />
                        </IconCircle>
                        <CardTitle
                            className="text-center text-[40px] font-semibold"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            Добро пожаловать!
                        </CardTitle>
                        <CardSubtitle className="text-center">
                            Пожалуйста, авторизуйтесь
                        </CardSubtitle>
                    </CardHeader>
                    <CardContent>
                        <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
                    </CardContent>
                </div>
            </Card>
        </div>
    );
};
