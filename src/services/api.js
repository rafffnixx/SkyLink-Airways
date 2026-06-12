const API_URL = 'http://localhost:5000/api';

// Auth Service
const authService = {
    async register(userData) {
        const response = await axios.post(`${API_URL}/auth/register`, userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    async login(credentials) {
        const response = await axios.post(`${API_URL}/auth/login`, credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout() {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Clear sessionStorage
        sessionStorage.removeItem('bookingFlightId');
        
        // Reload the page to reset app state and redirect to home
        window.location.href = '/';
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getToken() {
        return localStorage.getItem('token');
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }
};

// Flight Service
const flightService = {
    async getAllFlights(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const response = await axios.get(`${API_URL}/flights${params ? '?' + params : ''}`);
        return response.data;
    },

    async getFlightById(id) {
        const response = await axios.get(`${API_URL}/flights/${id}`);
        return response.data;
    },

    async createFlight(flightData) {
        const token = authService.getToken();
        const response = await axios.post(`${API_URL}/flights`, flightData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};

// Booking Service
const bookingService = {
    async createBooking(bookingData) {
        const token = authService.getToken();
        const response = await axios.post(`${API_URL}/bookings`, bookingData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async getUserBookings() {
        const token = authService.getToken();
        const response = await axios.get(`${API_URL}/bookings/my-bookings`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async cancelBooking(bookingId) {
        const token = authService.getToken();
        const response = await axios.put(`${API_URL}/bookings/${bookingId}/cancel`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};

export { authService, flightService, bookingService };