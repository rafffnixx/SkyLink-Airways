import { authService } from '../services/api.js';

const Login = {
    render() {
        return `
            <div class="container">
                <div class="auth-container">
                    <h2>Login to Your Account</h2>
                    <form id="login-form">
                        <div class="form-control">
                            <label>Email</label>
                            <input type="email" id="email" required>
                        </div>
                        <div class="form-control">
                            <label>Password</label>
                            <input type="password" id="password" required>
                        </div>
                        <button type="submit" class="btn-primary">Login</button>
                    </form>
                    <p style="margin-top: 1rem; text-align: center;">
                        Don't have an account? <a href="#" onclick="window.App.navigateTo('register')">Register here</a>
                    </p>
                    <div style="margin-top: 1rem; padding: 1rem; background: #F4F6F9; border-radius: 6px;">
                        <p style="font-size: 0.875rem; margin: 0;"><strong>Demo Accounts:</strong></p>
                        <p style="font-size: 0.875rem; margin: 0;">Admin: admin@skylink.com / admin123</p>
                        <p style="font-size: 0.875rem; margin: 0;">Customer: test@example.com / test123</p>
                    </div>
                </div>
            </div>
        `;
    },
    
    attachEvents() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                if (!email || !password) {
                    alert('Please fill in all fields');
                    return;
                }
                
                try {
                    const result = await authService.login({ email, password });
                    alert(`Welcome back, ${result.user.full_name}!`);
                    window.App.currentUser = result.user;
                    window.App.navigateTo('home');
                    window.location.reload();
                } catch (error) {
                    console.error('Login error:', error);
                    alert('Invalid credentials. Please try again.');
                }
            });
        }
    }
};

export default Login;