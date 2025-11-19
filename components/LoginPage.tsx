import * as React from 'react';
import type { FormEvent } from 'react';
import type { User } from '../types';

interface LoginPageProps {
    users: User[];
    onSignUp: (email: string, password_hash: string) => User | { error: string };
    onLogin: (email: string, password_hash: string) => User | { error: string };
    onVerifyEmail: (userId: string) => void;
    onApproveUser: (userId: string) => void;
    onDevLogin: () => void;
}

type AuthView = 'login' | 'signup' | 'verify_email' | 'awaiting_approval' | 'approved';

const LoginPage: React.FC<LoginPageProps> = ({ users, onSignUp, onLogin, onVerifyEmail, onApproveUser, onDevLogin }) => {
    const [view, setView] = React.useState<AuthView>('login');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [pendingUser, setPendingUser] = React.useState<User | null>(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // In a real app, you'd hash the password on the server. Here we simulate it.
        const password_hash = `hashed_${password}`; 

        if (view === 'login') {
            const result = onLogin(email, password_hash);
            if ('error' in result) {
                setError(result.error);
                const userWithError = users.find(u => u.email === email);
                if (userWithError) {
                    setPendingUser(userWithError);
                    switch(userWithError.status) {
                        case 'pending_verification': setView('verify_email'); break;
                        case 'pending_approval': setView('awaiting_approval'); break;
                    }
                }
            }
        } else if (view === 'signup') {
            if (password.length < 6) {
                setError('Password must be at least 6 characters long.');
                return;
            }
            const result = onSignUp(email, password_hash);
            if ('error' in result) {
                setError(result.error);
            } else {
                setPendingUser(result);
                setView('verify_email');
            }
        }
    };
    
    const handleSimulatedVerification = () => {
        if (!pendingUser) return;
        onVerifyEmail(pendingUser.id);
        setPendingUser(prev => prev ? { ...prev, status: 'pending_approval' } : null);
        setView('awaiting_approval');
    };

    const handleSimulatedApproval = () => {
        if (!pendingUser) return;
        onApproveUser(pendingUser.id);
        setPendingUser(prev => prev ? { ...prev, status: 'approved' } : null);
        setView('approved');
    };

    const renderContent = () => {
        switch(view) {
            case 'verify_email':
                return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-deep-sea mb-2">Check Your Email</h2>
                        <p className="text-gray-600 mb-6">We've sent a verification link to <span className="font-semibold">{pendingUser?.email}</span>.</p>
                        <p className="text-sm text-gray-500 mb-4">(This is a simulation. Click below to continue.)</p>
                        <button 
                            onClick={handleSimulatedVerification}
                            className="w-full bg-seafoam-green hover:bg-opacity-90 text-deep-sea font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                        >
                           Simulate Clicking Verification Link
                        </button>
                    </div>
                );
            case 'awaiting_approval':
                 return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-deep-sea mb-2">Email Verified!</h2>
                        <p className="text-gray-600 mb-6">Your account is now awaiting administrator approval. An approval request has been sent to <span className="font-semibold">innovation@rrf.org.au</span>.</p>
                        <p className="text-sm text-gray-500 mb-4">(This is a simulation. Click below to simulate admin approval.)</p>
                        <button 
                            onClick={handleSimulatedApproval}
                            className="w-full bg-seafoam-green hover:bg-opacity-90 text-deep-sea font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                        >
                           Simulate Admin Approval
                        </button>
                    </div>
                );
            case 'approved':
                return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-deep-sea mb-2">Account Approved!</h2>
                        <p className="text-gray-600 mb-6">You can now log in to the application.</p>
                        <button 
                            onClick={() => { setView('login'); setPendingUser(null); }}
                            className="w-full bg-ocean-blue hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                        >
                           Go to Login
                        </button>
                    </div>
                );
            case 'login':
            case 'signup':
            default:
                return (
                     <form onSubmit={handleSubmit} className="space-y-6">
                        <h2 className="text-3xl font-bold text-center text-deep-sea">{view === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-ocean-blue rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-ocean-blue focus:border-ocean-blue sm:text-sm bg-white text-gray-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password"  className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete={view === 'login' ? "current-password" : "new-password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-ocean-blue rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-ocean-blue focus:border-ocean-blue sm:text-sm bg-white text-gray-900"
                                />
                            </div>
                        </div>
                        
                        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ocean-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-blue"
                            >
                                {view === 'login' ? 'Sign in' : 'Sign up'}
                            </button>
                        </div>
                         <div className="text-center text-sm">
                            <button
                                type="button"
                                onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(''); }}
                                className="font-medium text-ocean-blue hover:text-opacity-80"
                            >
                                {view === 'login' ? 'Don\'t have an account? Sign up' : 'Already have an account? Sign in'}
                            </button>
                        </div>
                    </form>
                );
        }
    }

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                 <h1 className="text-center text-4xl font-bold tracking-tight text-white" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>Coral Nursery Monitor</h1>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/90 backdrop-blur-sm py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
                   {renderContent()}
                </div>
            </div>
            
            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
                 <button
                    onClick={onDevLogin}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-blue"
                >
                    Access as Dev User
                </button>
            </div>
        </div>
    );
};

export default LoginPage;