import { authService } from '../services/api.js';

const Login = {
    render() {
        return `
            <div class="container">
                <div class="auth-container">
                    <div class="auth-header">
                        <h2>Welcome Back</h2>
                        <p>Login to your SkyLink Airways account</p>
                    </div>
                    
                    <form id="login-form">
                        <div class="form-control">
                            <label>Email Address</label>
                            <input type="email" id="email" placeholder="Enter your email" required autocomplete="email">
                        </div>
                        <div class="form-control">
                            <label>Password</label>
                            <input type="password" id="password" placeholder="Enter your password" required autocomplete="current-password">
                        </div>
                        <button type="submit" class="btn-primary" id="login-btn">
                            <span class="btn-text">Login</span>
                            <span class="btn-loader" style="display: none;">Loading...</span>
                        </button>
                    </form>
                    
                    <div class="auth-footer">
                        <p>Don't have an account? <a href="#" onclick="window.App.navigateTo('register')">Register here</a></p>
                    </div>
                    
                    <div class="demo-accounts">
                        <p><strong>Demo Accounts</strong></p>
                        <div class="demo-account">
                            <span>👑 Admin:</span>
                            <code>admin@skylink.com</code>
                            <span class="demo-password">admin123</span>
                        </div>
                        <div class="demo-account">
                            <span>👤 Customer:</span>
                            <code>test@example.com</code>
                            <span class="demo-password">test123</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    attachEvents() {
        const loginForm = document.getElementById('login-form');
        const loginBtn = document.getElementById('login-btn');
        const btnText = loginBtn?.querySelector('.btn-text');
        const btnLoader = loginBtn?.querySelector('.btn-loader');
        
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;
                
                // Validation
                if (!email || !password) {
                    this.showError('Please fill in all fields');
                    return;
                }
                
                if (!this.isValidEmail(email)) {
                    this.showError('Please enter a valid email address');
                    return;
                }
                
                // Show loading state
                if (loginBtn && btnText && btnLoader) {
                    loginBtn.disabled = true;
                    btnText.style.display = 'none';
                    btnLoader.style.display = 'inline';
                }
                
                try {
                    const result = await authService.login({ email, password });
                    
                    // Success
                    this.showSuccess(`Welcome back, ${result.user.full_name}!`);
                    
                    // Update app state
                    window.App.currentUser = result.user;
                    
                    // Redirect to home after short delay
                    setTimeout(() => {
                        window.App.navigateTo('home');
                        window.location.reload();
                    }, 1000);
                    
                } catch (error) {
                    console.error('Login error:', error);
                    
                    // Handle different error types
                    let errorMessage = 'Invalid credentials. Please try again.';
                    if (error.response?.status === 401) {
                        errorMessage = 'Invalid email or password. Please check and try again.';
                    } else if (error.response?.status === 404) {
                        errorMessage = 'Server error. Please try again later.';
                    }
                    
                    this.showError(errorMessage);
                    
                    // Reset button state
                    if (loginBtn && btnText && btnLoader) {
                        loginBtn.disabled = false;
                        btnText.style.display = 'inline';
                        btnLoader.style.display = 'none';
                    }
                }
            });
        }
        
        // Add Enter key support
        const inputs = document.querySelectorAll('#login-form input');
        inputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    loginForm.dispatchEvent(new Event('submit'));
                }
            });
        });
    },
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    showError(message) {
        // Remove any existing alert
        const existingAlert = document.querySelector('.alert-message');
        if (existingAlert) existingAlert.remove();
        
        // Create error alert
        const alert = document.createElement('div');
        alert.className = 'alert-message alert-error';
        alert.innerHTML = `
            <span>⚠️</span>
            <span>${message}</span>
            <button class="alert-close">&times;</button>
        `;
        
        const form = document.getElementById('login-form');
        form.parentNode.insertBefore(alert, form);
        
        // Auto remove after 5 seconds
        setTimeout(() => alert.remove(), 5000);
        
        // Close button
        alert.querySelector('.alert-close').onclick = () => alert.remove();
    },
    
    showSuccess(message) {
        const alert = document.createElement('div');
        alert.className = 'alert-message alert-success';
        alert.innerHTML = `
            <span>✅</span>
            <span>${message}</span>
        `;
        
        const form = document.getElementById('login-form');
        form.parentNode.insertBefore(alert, form);
    }
};

export default Login;