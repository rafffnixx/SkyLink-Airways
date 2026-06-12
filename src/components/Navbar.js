const Navbar = {
    render(currentUser) {
        const isLoggedIn = !!currentUser;
        const isAdmin = currentUser && currentUser.role === 'admin';
        
        return `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="logo" style="cursor: pointer;" onclick="window.App.navigateTo('home')">
                        SkyLink <span>Airways</span>
                    </div>
                    <div class="nav-links">
                        <a href="javascript:void(0)" onclick="window.App.navigateTo('home')">Home</a>
                        <a href="javascript:void(0)" onclick="window.App.navigateTo('flights')">Flights</a>
                        ${isLoggedIn ? `<a href="javascript:void(0)" onclick="window.App.navigateTo('my-bookings')">My Bookings</a>` : ''}
                        ${isAdmin ? `<a href="javascript:void(0)" onclick="window.App.navigateTo('admin')">Admin Panel</a>` : ''}
                        ${!isLoggedIn ? 
                            `<a href="javascript:void(0)" onclick="window.App.navigateTo('login')" class="btn-login">Login / Register</a>` : 
                            `<a href="javascript:void(0)" id="logout-btn" class="btn-login">Logout</a>`
                        }
                    </div>
                </div>
            </nav>
        `;
    },
    
    attachEvents() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            // Remove any existing listeners to avoid duplicates
            const newLogoutBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
            
            newLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.authService && typeof window.authService.logout === 'function') {
                    window.authService.logout();
                } else {
                    console.error('authService.logout is not defined');
                    // Fallback logout
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                }
            });
        }
    }
};

export default Navbar;