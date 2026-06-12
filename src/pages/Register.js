import { authService } from '../services/api.js';

const Register = {
    render() {
        return `
            <div class="container">
                <div class="auth-container">
                    <h2>Create New Account</h2>
                    <form id="register-form">
                        <div class="form-control">
                            <label>Username</label>
                            <input type="text" id="username" required>
                        </div>
                        <div class="form-control">
                            <label>Email</label>
                            <input type="email" id="email" required>
                        </div>
                        <div class="form-control">
                            <label>Full Name</label>
                            <input type="text" id="full_name" required>
                        </div>
                        <div class="form-control">
                            <label>Phone</label>
                            <input type="tel" id="phone">
                        </div>
                        <div class="form-control">
                            <label>Password</label>
                            <input type="password" id="password" required>
                        </div>
                        <div class="form-control">
                            <label>Confirm Password</label>
                            <input type="password" id="confirm_password" required>
                        </div>
                        <button type="submit" class="btn-primary">Register</button>
                    </form>
                    <p style="margin-top: 1rem; text-align: center;">
                        Already have an account? <a href="#" onclick="window.App.navigateTo('login')">Login here</a>
                    </p>
                </div>
            </div>
        `;
    },
    
    attachEvents() {
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const email = document.getElementById('email').value;
                const full_name = document.getElementById('full_name').value;
                const phone = document.getElementById('phone').value;
                const password = document.getElementById('password').value;
                const confirm_password = document.getElementById('confirm_password').value;
                
                if (!username || !email || !full_name || !password) {
                    alert('Please fill in all required fields');
                    return;
                }
                
                if (password !== confirm_password) {
                    alert('Passwords do not match');
                    return;
                }
                
                if (password.length < 6) {
                    alert('Password must be at least 6 characters long');
                    return;
                }
                
                try {
                    const result = await authService.register({ 
                        username, 
                        email, 
                        password, 
                        full_name, 
                        phone 
                    });
                    alert(`Welcome to SkyLink Airways, ${result.user.full_name}! Please login to continue.`);
                    window.App.navigateTo('login');
                } catch (error) {
                    console.error('Registration error:', error);
                    alert('Registration failed. Email or username may already exist.');
                }
            });
        }
    }
};

export default Register;