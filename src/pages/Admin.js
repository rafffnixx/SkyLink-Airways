// src/pages/Admin.js - Complete with Modal System
import { flightService, authService } from '../services/api.js';

const Admin = {
    async render() {
        if (!authService.isAuthenticated() || !authService.isAdmin()) {
            return `
                <div class="container">
                    <div class="auth-container">
                        <h2>Access Denied</h2>
                        <p>You do not have permission to access this page.</p>
                        <button onclick="window.App.navigateTo('home')" class="btn-primary">Go Home</button>
                    </div>
                </div>
            `;
        }
        
        try {
            // Fetch all data
            const flights = await this.getFlights();
            const routes = await this.getRoutes();
            const users = await this.getUsers();
            const bookings = await this.getBookings();
            const userStats = await this.getUserStats();
            const bookingStats = await this.getBookingStats();
            
            // Safely extract numbers
            const totalFlights = Array.isArray(flights) ? flights.length : 0;
            const totalRoutes = Array.isArray(routes) ? routes.length : 0;
            const totalUsers = userStats?.total_users || (Array.isArray(users) ? users.length : 0);
            const totalBookings = bookingStats?.total_bookings || (Array.isArray(bookings) ? bookings.length : 0);
            const totalRevenue = parseFloat(bookingStats?.total_revenue || 0);
            const confirmedBookings = bookingStats?.confirmed_bookings || 0;
            
            return `
                <div class="admin-dashboard">
                    <div class="container">
                        <h1>Admin Dashboard</h1>
                        
                        <!-- Statistics Cards -->
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon">✈️</div>
                                <div class="stat-info">
                                    <h3>${totalFlights}</h3>
                                    <p>Total Flights</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">🛣️</div>
                                <div class="stat-info">
                                    <h3>${totalRoutes}</h3>
                                    <p>Total Routes</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">👥</div>
                                <div class="stat-info">
                                    <h3>${totalUsers}</h3>
                                    <p>Total Users</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">📋</div>
                                <div class="stat-info">
                                    <h3>${totalBookings}</h3>
                                    <p>Total Bookings</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">💰</div>
                                <div class="stat-info">
                                    <h3>$${totalRevenue.toFixed(2)}</h3>
                                    <p>Total Revenue</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">✅</div>
                                <div class="stat-info">
                                    <h3>${confirmedBookings}</h3>
                                    <p>Confirmed Bookings</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tabs -->
                        <div class="admin-tabs">
                            <button class="tab-btn active" data-tab="flights">✈️ Flights</button>
                            <button class="tab-btn" data-tab="routes">🛣️ Routes</button>
                            <button class="tab-btn" data-tab="users">👥 Users</button>
                            <button class="tab-btn" data-tab="bookings">📋 Bookings</button>
                        </div>
                        
                        <!-- Flights Tab -->
                        <div id="flights-tab" class="tab-content active">
                            <div class="admin-panel">
                                <div class="panel-header">
                                    <h2>Manage Flights</h2>
                                    <button class="btn-primary" onclick="window.openAddFlightModal()">+ Add New Flight</button>
                                </div>
                                <div class="table-container">
                                    <table class="data-table">
                                        <thead>
                                            <tr><th>Flight #</th><th>Airline</th><th>Route</th><th>Departure</th><th>Seats</th><th>Price</th><th>Actions</th></tr>
                                        </thead>
                                        <tbody>
                                            ${flights.map(flight => `
                                                <tr>
                                                    <td>${flight.flight_number}</td>
                                                    <td>${flight.airline}</td>
                                                    <td>${flight.origin_code || 'N/A'} → ${flight.dest_code || 'N/A'}</td>
                                                    <td>${new Date(flight.departure_time).toLocaleDateString()}</td>
                                                    <td>${flight.available_seats}/${flight.total_seats}</td>
                                                    <td>$${(flight.base_price * flight.price_multiplier).toFixed(2)}</td>
                                                    <td><button class="btn-small btn-danger" onclick="window.deleteFlight(${flight.id})">Delete</button></td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Routes Tab -->
                        <div id="routes-tab" class="tab-content">
                            <div class="admin-panel">
                                <div class="panel-header">
                                    <h2>Manage Routes</h2>
                                    <button class="btn-primary" onclick="window.openAddRouteModal()">+ Add New Route</button>
                                </div>
                                <div class="table-container">
                                    <table class="data-table">
                                        <thead><tr><th>ID</th><th>Route</th><th>Distance (km)</th><th>Base Price</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            ${routes.map(route => `
                                                <tr>
                                                    <td>${route.id}</td>
                                                    <td>${route.origin_code} → ${route.dest_code}</td>
                                                    <td>${route.distance_km}</td>
                                                    <td>$${route.base_price}</td>
                                                    <td><button class="btn-small btn-danger" onclick="window.deleteRoute(${route.id})">Delete</button></td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Users Tab -->
                        <div id="users-tab" class="tab-content">
                            <div class="admin-panel">
                                <div class="panel-header">
                                    <h2>Manage Users</h2>
                                    <button class="btn-primary" onclick="window.openAddUserModal()">+ Add New User</button>
                                </div>
                                <div class="table-container">
                                    <table class="data-table">
                                        <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                                        <tbody>
                                            ${users.map(user => `
                                                <tr>
                                                    <td>${user.id}</td>
                                                    <td>${user.username}</td>
                                                    <td>${user.email}</td>
                                                    <td>
                                                        <select onchange="window.updateUserRole(${user.id}, this.value)" class="role-select">
                                                            <option value="customer" ${user.role === 'customer' ? 'selected' : ''}>Customer</option>
                                                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                                        </select>
                                                    </td>
                                                    <td><button class="btn-small btn-danger" onclick="window.deleteUser(${user.id})">Delete</button></td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Bookings Tab -->
                        <div id="bookings-tab" class="tab-content">
                            <div class="admin-panel">
                                <h2>All Bookings</h2>
                                <div class="table-container">
                                    <table class="data-table">
                                        <thead><tr><th>Reference</th><th>User</th><th>Flight</th><th>Price</th><th>Status</th><th>Date</th></tr></thead>
                                        <tbody>
                                            ${bookings.map(booking => `
                                                <tr>
                                                    <td>${booking.booking_reference}</td>
                                                    <td>${booking.user_name || booking.username}</td>
                                                    <td>${booking.flight_number}</td>
                                                    <td>$${parseFloat(booking.total_price).toFixed(2)}</td>
                                                    <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
                                                    <td>${new Date(booking.booking_date).toLocaleDateString()}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Modals -->
                ${this.renderAddFlightModal(routes)}
                ${this.renderAddRouteModal()}
                ${this.renderAddUserModal()}
            `;
        } catch (error) {
            console.error('Error loading admin panel:', error);
            return `<div class="container"><div class="auth-container"><h2>Error</h2><p>${error.message}</p><button onclick="window.location.reload()" class="btn-primary">Retry</button></div></div>`;
        }
    },
    
    renderAddFlightModal(routes) {
        return `
            <div id="addFlightModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add New Flight</h3>
                        <span class="close-modal" onclick="window.closeAddFlightModal()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="add-flight-form">
                            <div class="form-grid">
                                <div class="form-control">
                                    <label>Flight Number *</label>
                                    <input type="text" id="flight_number" required>
                                </div>
                                <div class="form-control">
                                    <label>Route *</label>
                                    <select id="route_id" required>
                                        <option value="">Select Route</option>
                                        ${routes.map(route => `<option value="${route.id}">${route.origin_code} → ${route.dest_code} ($${route.base_price})</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-control">
                                    <label>Airline *</label>
                                    <input type="text" id="airline" required>
                                </div>
                                <div class="form-control">
                                    <label>Departure Time *</label>
                                    <input type="datetime-local" id="departure_time" required>
                                </div>
                                <div class="form-control">
                                    <label>Arrival Time *</label>
                                    <input type="datetime-local" id="arrival_time" required>
                                </div>
                                <div class="form-control">
                                    <label>Total Seats *</label>
                                    <input type="number" id="total_seats" required min="1">
                                </div>
                                <div class="form-control">
                                    <label>Available Seats</label>
                                    <input type="number" id="available_seats">
                                </div>
                                <div class="form-control">
                                    <label>Price Multiplier</label>
                                    <input type="number" step="0.1" id="price_multiplier" value="1.0">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="window.closeAddFlightModal()">Cancel</button>
                        <button class="btn-primary" onclick="window.submitAddFlight()">Create Flight</button>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderAddRouteModal() {
        return `
            <div id="addRouteModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add New Route</h3>
                        <span class="close-modal" onclick="window.closeAddRouteModal()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="add-route-form">
                            <div class="form-grid">
                                <div class="form-control">
                                    <label>Origin Airport ID *</label>
                                    <input type="number" id="origin_airport_id" required placeholder="1-10">
                                </div>
                                <div class="form-control">
                                    <label>Destination Airport ID *</label>
                                    <input type="number" id="destination_airport_id" required placeholder="1-10">
                                </div>
                                <div class="form-control">
                                    <label>Distance (km) *</label>
                                    <input type="number" id="distance_km" required>
                                </div>
                                <div class="form-control">
                                    <label>Base Price *</label>
                                    <input type="number" step="0.01" id="base_price" required>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="window.closeAddRouteModal()">Cancel</button>
                        <button class="btn-primary" onclick="window.submitAddRoute()">Create Route</button>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderAddUserModal() {
        return `
            <div id="addUserModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add New User</h3>
                        <span class="close-modal" onclick="window.closeAddUserModal()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="add-user-form">
                            <div class="form-grid">
                                <div class="form-control">
                                    <label>Username *</label>
                                    <input type="text" id="username" required>
                                </div>
                                <div class="form-control">
                                    <label>Email *</label>
                                    <input type="email" id="email" required>
                                </div>
                                <div class="form-control">
                                    <label>Full Name *</label>
                                    <input type="text" id="full_name" required>
                                </div>
                                <div class="form-control">
                                    <label>Phone</label>
                                    <input type="tel" id="phone">
                                </div>
                                <div class="form-control">
                                    <label>Password *</label>
                                    <input type="password" id="password" required>
                                </div>
                                <div class="form-control">
                                    <label>Role *</label>
                                    <select id="role">
                                        <option value="customer">Customer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="window.closeAddUserModal()">Cancel</button>
                        <button class="btn-primary" onclick="window.submitAddUser()">Create User</button>
                    </div>
                </div>
            </div>
        `;
    },
    
    async getFlights() { try { return await flightService.getAllFlights(); } catch (error) { return []; } },
    async getRoutes() { try { const token = authService.getToken(); const response = await axios.get('http://localhost:5000/api/routes', { headers: { Authorization: `Bearer ${token}` } }); return response.data || []; } catch (error) { return []; } },
    async getUsers() { try { const token = authService.getToken(); const response = await axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } }); return response.data || []; } catch (error) { return []; } },
    async getBookings() { try { const token = authService.getToken(); const response = await axios.get('http://localhost:5000/api/bookings/all', { headers: { Authorization: `Bearer ${token}` } }); return response.data || []; } catch (error) { return []; } },
    async getUserStats() { try { const token = authService.getToken(); const response = await axios.get('http://localhost:5000/api/users/stats', { headers: { Authorization: `Bearer ${token}` } }); return response.data || {}; } catch (error) { return {}; } },
    async getBookingStats() { try { const token = authService.getToken(); const response = await axios.get('http://localhost:5000/api/bookings/stats/all', { headers: { Authorization: `Bearer ${token}` } }); return response.data || {}; } catch (error) { return {}; } },
    
    attachEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.getElementById(`${tab}-tab`).classList.add('active');
                btn.classList.add('active');
            });
        });
        
        // Modal functions
        window.openAddFlightModal = () => document.getElementById('addFlightModal').style.display = 'block';
        window.closeAddFlightModal = () => document.getElementById('addFlightModal').style.display = 'none';
        window.openAddRouteModal = () => document.getElementById('addRouteModal').style.display = 'block';
        window.closeAddRouteModal = () => document.getElementById('addRouteModal').style.display = 'none';
        window.openAddUserModal = () => document.getElementById('addUserModal').style.display = 'block';
        window.closeAddUserModal = () => document.getElementById('addUserModal').style.display = 'none';
        
        // Close modals when clicking outside
        window.onclick = (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        };
        
        // Submit functions
        window.submitAddFlight = async () => {
            const flightData = {
                flight_number: document.getElementById('flight_number').value,
                route_id: parseInt(document.getElementById('route_id').value),
                airline: document.getElementById('airline').value,
                departure_time: document.getElementById('departure_time').value,
                arrival_time: document.getElementById('arrival_time').value,
                total_seats: parseInt(document.getElementById('total_seats').value),
                available_seats: document.getElementById('available_seats').value ? parseInt(document.getElementById('available_seats').value) : parseInt(document.getElementById('total_seats').value),
                price_multiplier: parseFloat(document.getElementById('price_multiplier').value) || 1.0
            };
            try {
                await flightService.createFlight(flightData);
                alert('✅ Flight added!');
                window.closeAddFlightModal();
                window.location.reload();
            } catch (error) { alert('❌ Failed: ' + (error.response?.data?.message || error.message)); }
        };
        
        window.submitAddRoute = async () => {
            const token = authService.getToken();
            const routeData = {
                origin_airport_id: parseInt(document.getElementById('origin_airport_id').value),
                destination_airport_id: parseInt(document.getElementById('destination_airport_id').value),
                distance_km: parseFloat(document.getElementById('distance_km').value),
                base_price: parseFloat(document.getElementById('base_price').value)
            };
            try {
                await axios.post('http://localhost:5000/api/routes', routeData, { headers: { Authorization: `Bearer ${token}` } });
                alert('✅ Route added!');
                window.closeAddRouteModal();
                window.location.reload();
            } catch (error) { alert('❌ Failed: ' + (error.response?.data?.message || error.message)); }
        };
        
        window.submitAddUser = async () => {
            const token = authService.getToken();
            const userData = {
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                full_name: document.getElementById('full_name').value,
                phone: document.getElementById('phone').value,
                password: document.getElementById('password').value,
                role: document.getElementById('role').value
            };
            try {
                await axios.post('http://localhost:5000/api/users', userData, { headers: { Authorization: `Bearer ${token}` } });
                alert('✅ User added!');
                window.closeAddUserModal();
                window.location.reload();
            } catch (error) { alert('❌ Failed: ' + (error.response?.data?.message || error.message)); }
        };
        
        // Delete functions
        window.deleteFlight = async (id) => { if (confirm('Delete flight?')) { const token = authService.getToken(); await axios.delete(`http://localhost:5000/api/flights/${id}`, { headers: { Authorization: `Bearer ${token}` } }); window.location.reload(); } };
        window.deleteRoute = async (id) => { if (confirm('Delete route?')) { const token = authService.getToken(); await axios.delete(`http://localhost:5000/api/routes/${id}`, { headers: { Authorization: `Bearer ${token}` } }); window.location.reload(); } };
        window.deleteUser = async (id) => { if (confirm('Delete user?')) { const token = authService.getToken(); await axios.delete(`http://localhost:5000/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } }); window.location.reload(); } };
        window.updateUserRole = async (id, role) => { const token = authService.getToken(); await axios.put(`http://localhost:5000/api/users/${id}/role`, { role }, { headers: { Authorization: `Bearer ${token}` } }); alert('Role updated!'); window.location.reload(); };
    }
};

export default Admin;