const Navbar = {
    render(currentUser) {
        const isLoggedIn = !!currentUser;
        const isAdmin = currentUser && currentUser.role === 'admin';
        
        return `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="logo" onclick="window.App.navigateTo('home')">
                        SkyLink <span>Airways</span>
                    </div>
                    <button class="mobile-menu-btn" id="mobileMenuBtn">☰</button>
                    <div class="nav-links" id="navLinks">
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
        // Mobile menu toggle
        const mobileBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.getElementById('navLinks');
        
        if (mobileBtn && navLinks) {
            mobileBtn.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.authService.logout();
            });
        }
    }
};

export default Navbar;