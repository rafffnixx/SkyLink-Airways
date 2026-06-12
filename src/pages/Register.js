import { authService } from '../services/api.js';

const Register = {
    render() {
        return `
            <div class="container">
                <div class="auth-container">
                    <div class="auth-header">
                        <h2>Create Account</h2>
                        <p>Join SkyLink Airways and start your journey</p>
                    </div>
                    
                    <form id="register-form">
                        <div class="form-control">
                            <label>Username *</label>
                            <input type="text" id="username" placeholder="Choose a username" required autocomplete="username">
                            <small class="input-hint">At least 3 characters</small>
                        </div>
                        
                        <div class="form-control">
                            <label>Email Address *</label>
                            <input type="email" id="email" placeholder="your@email.com" required autocomplete="email">
                            <small class="input-hint">We'll send booking confirmations here</small>
                        </div>
                        
                        <div class="form-control">
                            <label>Full Name *</label>
                            <input type="text" id="full_name" placeholder="John Doe" required autocomplete="name">
                        </div>
                        
                        <div class="form-control">
                            <label>Phone Number</label>
                            <input type="tel" id="phone" placeholder="+1234567890" autocomplete="tel">
                            <small class="input-hint">Optional but recommended for updates</small>
                        </div>
                        
                        <div class="form-control">
                            <label>Password *</label>
                            <input type="password" id="password" placeholder="Create a password" required autocomplete="new-password">
                            <small class="input-hint">Minimum 6 characters</small>
                        </div>
                        
                        <div class="form-control">
                            <label>Confirm Password *</label>
                            <input type="password" id="confirm_password" placeholder="Confirm your password" required autocomplete="new-password">
                        </div>
                        
                        <div class="form-checkbox">
                            <input type="checkbox" id="terms" required>
                            <label for="terms">I agree to the <a href="#" onclick="return false;">Terms of Service</a> and <a href="#" onclick="return false;">Privacy Policy</a></label>
                        </div>
                        
                        <button type="submit" class="btn-primary" id="register-btn">
                            <span class="btn-text">Create Account</span>
                            <span class="btn-loader" style="display: none;">Loading...</span>
                        </button>
                    </form>
                    
                    <div class="auth-footer">
                        <p>Already have an account? <a href="#" onclick="window.App.navigateTo('login')">Sign in here</a></p>
                    </div>
                </div>
            </div>
        `;
    },
    
    attachEvents() {
        const registerForm = document.getElementById('register-form');
        const registerBtn = document.getElementById('register-btn');
        const btnText = registerBtn?.querySelector('.btn-text');
        const btnLoader = registerBtn?.querySelector('.btn-loader');
        
        // Real-time validation
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmInput = document.getElementById('confirm_password');
        
        // Username validation
        if (usernameInput) {
            usernameInput.addEventListener('input', () => {
                this.validateUsername(usernameInput.value);
            });
        }
        
        // Email validation
        if (emailInput) {
            emailInput.addEventListener('input', () => {
                this.validateEmail(emailInput.value);
            });
        }
        
        // Password strength validation
        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                this.validatePasswordStrength(passwordInput.value);
                if (confirmInput.value) {
                    this.validatePasswordMatch(passwordInput.value, confirmInput.value);
                }
            });
        }
        
        // Confirm password validation
        if (confirmInput) {
            confirmInput.addEventListener('input', () => {
                this.validatePasswordMatch(passwordInput.value, confirmInput.value);
            });
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username').value.trim();
                const email = document.getElementById('email').value.trim();
                const full_name = document.getElementById('full_name').value.trim();
                const phone = document.getElementById('phone').value.trim();
                const password = document.getElementById('password').value;
                const confirm_password = document.getElementById('confirm_password').value;
                const terms = document.getElementById('terms').checked;
                
                // Validation
                if (!username || !email || !full_name || !password) {
                    this.showError('Please fill in all required fields');
                    return;
                }
                
                if (username.length < 3) {
                    this.showError('Username must be at least 3 characters');
                    return;
                }
                
                if (!this.isValidEmail(email)) {
                    this.showError('Please enter a valid email address');
                    return;
                }
                
                if (password !== confirm_password) {
                    this.showError('Passwords do not match');
                    return;
                }
                
                if (password.length < 6) {
                    this.showError('Password must be at least 6 characters long');
                    return;
                }
                
                if (!terms) {
                    this.showError('Please agree to the Terms of Service');
                    return;
                }
                
                // Show loading state
                if (registerBtn && btnText && btnLoader) {
                    registerBtn.disabled = true;
                    btnText.style.display = 'none';
                    btnLoader.style.display = 'inline';
                }
                
                try {
                    const result = await authService.register({ 
                        username, 
                        email, 
                        password, 
                        full_name, 
                        phone 
                    });
                    
                    this.showSuccess(`Welcome to SkyLink Airways, ${result.user.full_name}! Please login to continue.`);
                    
                    // Redirect to login after 2 seconds
                    setTimeout(() => {
                        window.App.navigateTo('login');
                    }, 2000);
                    
                } catch (error) {
                    console.error('Registration error:', error);
                    
                    let errorMessage = 'Registration failed. ';
                    if (error.response?.status === 400) {
                        errorMessage += 'Email or username may already exist.';
                    } else {
                        errorMessage += 'Please try again later.';
                    }
                    
                    this.showError(errorMessage);
                    
                    // Reset button state
                    if (registerBtn && btnText && btnLoader) {
                        registerBtn.disabled = false;
                        btnText.style.display = 'inline';
                        btnLoader.style.display = 'none';
                    }
                }
            });
        }
        
        // Enter key support
        const inputs = document.querySelectorAll('#register-form input');
        inputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    registerForm.dispatchEvent(new Event('submit'));
                }
            });
        });
    },
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    validateUsername(username) {
        const input = document.getElementById('username');
        const isValid = username.length >= 3;
        
        if (username.length > 0 && !isValid) {
            input.style.borderColor = '#dc2626';
            this.showFieldError('username', 'Username must be at least 3 characters');
        } else if (isValid) {
            input.style.borderColor = '#10b981';
            this.clearFieldError('username');
        } else {
            input.style.borderColor = '';
            this.clearFieldError('username');
        }
    },
    
    validateEmail(email) {
        const input = document.getElementById('email');
        const isValid = this.isValidEmail(email);
        
        if (email.length > 0 && !isValid) {
            input.style.borderColor = '#dc2626';
            this.showFieldError('email', 'Enter a valid email address');
        } else if (isValid) {
            input.style.borderColor = '#10b981';
            this.clearFieldError('email');
        } else {
            input.style.borderColor = '';
            this.clearFieldError('email');
        }
    },
    
    validatePasswordStrength(password) {
        const input = document.getElementById('password');
        const hasMinLength = password.length >= 6;
        
        if (password.length > 0 && !hasMinLength) {
            input.style.borderColor = '#f59e0b';
            this.showFieldError('password', 'Password must be at least 6 characters');
        } else if (hasMinLength) {
            input.style.borderColor = '#10b981';
            this.clearFieldError('password');
        } else {
            input.style.borderColor = '';
            this.clearFieldError('password');
        }
    },
    
    validatePasswordMatch(password, confirm) {
        const input = document.getElementById('confirm_password');
        const isValid = password === confirm;
        
        if (confirm.length > 0 && !isValid) {
            input.style.borderColor = '#dc2626';
            this.showFieldError('confirm_password', 'Passwords do not match');
        } else if (isValid && confirm.length > 0) {
            input.style.borderColor = '#10b981';
            this.clearFieldError('confirm_password');
        } else {
            input.style.borderColor = '';
            this.clearFieldError('confirm_password');
        }
    },
    
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        let errorSpan = field.parentNode.querySelector('.field-error');
        
        if (!errorSpan) {
            errorSpan = document.createElement('small');
            errorSpan.className = 'field-error';
            errorSpan.style.color = '#dc2626';
            errorSpan.style.fontSize = '0.75rem';
            errorSpan.style.marginTop = '0.25rem';
            errorSpan.style.display = 'block';
            field.parentNode.appendChild(errorSpan);
        }
        
        errorSpan.textContent = message;
    },
    
    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        const errorSpan = field.parentNode.querySelector('.field-error');
        if (errorSpan) {
            errorSpan.remove();
        }
    },
    
    showError(message) {
        const existingAlert = document.querySelector('.alert-message');
        if (existingAlert) existingAlert.remove();
        
        const alert = document.createElement('div');
        alert.className = 'alert-message alert-error';
        alert.innerHTML = `
            <span>⚠️</span>
            <span>${message}</span>
            <button class="alert-close">&times;</button>
        `;
        
        const form = document.getElementById('register-form');
        form.parentNode.insertBefore(alert, form);
        
        setTimeout(() => alert.remove(), 5000);
        
        alert.querySelector('.alert-close').onclick = () => alert.remove();
    },
    
    showSuccess(message) {
        const alert = document.createElement('div');
        alert.className = 'alert-message alert-success';
        alert.innerHTML = `
            <span>✅</span>
            <span>${message}</span>
        `;
        
        const form = document.getElementById('register-form');
        form.parentNode.insertBefore(alert, form);
    }
};

export default Register;