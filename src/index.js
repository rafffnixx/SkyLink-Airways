import App from './App.js';
import { authService, flightService, bookingService } from './services/api.js';

// Make services available globally
window.authService = authService;
window.flightService = flightService;
window.bookingService = bookingService;

// Global book flight function
window.bookFlight = (flightId) => {
    if (!authService.isAuthenticated()) {
        alert('Please login to book a flight');
        if (window.App && typeof window.App.navigateTo === 'function') {
            window.App.navigateTo('login');
        }
        return;
    }
    
    sessionStorage.setItem('bookingFlightId', flightId);
    if (window.App && typeof window.App.navigateTo === 'function') {
        window.App.navigateTo('booking');
    }
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Debug: Check if App is available
console.log('Index.js loaded, App:', App);