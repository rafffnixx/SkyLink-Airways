import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import Home from './pages/Home.js';
import Flights from './pages/Flights.js';
import Booking from './pages/Booking.js';
import MyBookings from './pages/MyBookings.js';
import Admin from './pages/Admin.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import { authService } from './services/api.js';

const App = {
    currentUser: null,
    currentPage: 'home',
    currentParams: '',
    
    async init() {
        this.currentUser = authService.getCurrentUser();
        this.currentPage = 'home';
        await this.render();
        window.App = this;
    },
    
    async navigateTo(page, params = '') {
        this.currentPage = page;
        this.currentParams = params;
        await this.render();
        window.scrollTo(0, 0);
    },
    
    async render() {
        const root = document.getElementById('root');
        
        if (!root) return;
        
        // Show loading state
        root.innerHTML = '<div class="loading" style="text-align: center; padding: 50px;">Loading...</div>';
        
        try {
            const navbarHtml = Navbar.render(this.currentUser);
            
            let mainContent = '';
            
            switch(this.currentPage) {
                case 'home':
                    mainContent = await Home.render();
                    break;
                case 'flights':
                    mainContent = await Flights.render(this.currentParams);
                    break;
                case 'booking':
                    mainContent = await Booking.render();
                    break;
                case 'my-bookings':
                    mainContent = await MyBookings.render();
                    break;
                case 'admin':
                    mainContent = await Admin.render();
                    break;
                case 'login':
                    mainContent = Login.render();
                    break;
                case 'register':
                    mainContent = Register.render();
                    break;
                default:
                    mainContent = await Home.render();
            }
            
            const footerHtml = Footer.render();
            
            root.innerHTML = `
                ${navbarHtml}
                ${mainContent}
                ${footerHtml}
            `;
            
            // Attach Navbar events (for logout button)
            Navbar.attachEvents();
            
            // Attach page-specific events
            if (this.currentPage === 'home' && Home.attachEvents) {
                Home.attachEvents();
            } else if (this.currentPage === 'flights' && Flights.attachEvents) {
                Flights.attachEvents();
            } else if (this.currentPage === 'booking' && Booking.attachEvents) {
                Booking.attachEvents();
            } else if (this.currentPage === 'my-bookings' && MyBookings.attachEvents) {
                MyBookings.attachEvents();
            } else if (this.currentPage === 'admin' && Admin.attachEvents) {
                Admin.attachEvents();
            } else if (this.currentPage === 'login' && Login.attachEvents) {
                Login.attachEvents();
            } else if (this.currentPage === 'register' && Register.attachEvents) {
                Register.attachEvents();
            }
        } catch (error) {
            console.error('Error rendering app:', error);
            root.innerHTML = '<div class="error" style="text-align: center; padding: 50px; color: red;">Error loading page. Please refresh.</div>';
        }
    }
};

export default App;