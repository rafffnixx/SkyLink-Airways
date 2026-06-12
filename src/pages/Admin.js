// src/pages/Admin.js - Complete Admin Dashboard with Production API URL
import { flightService, authService } from '../services/api.js';

// Production API URL - Update this to your Render backend URL
const API_BASE_URL = 'https://skylink-backend-7fff.onrender.com/api';

const Admin = {
    async render() {
        if (!authService.isAuthenticated() || !authService.isAdmin()) {
            return `
                <div class="container">
                    <div class="auth-container">
                        <div class="auth-header">
                            <h2>Access Denied</h2>
                            <p>You do not have permission to access this page.</p>
                        </div>
                        <button onclick="window.App.navigateTo('home')" class="btn-primary">Go Home</button>
                    </div>
                </div>
            `;
        }
        
        // Show loading state
        let content = `
            <div class="admin-dashboard">
                <div class="container">
                    <h1>Admin Dashboard</h1>
                    <div class="loading-spinner" style="text-align: center; padding: 3rem;"></div>
                </div>
            </div>
        `;
        
        try {
            // Fetch all data
            const [flights, routes, users, bookings, userStats, bookingStats] = await Promise.all([
                this.getFlights(),
                this.getRoutes(),
                this.getUsers(),
                this.getBookings(),
                this.getUserStats(),
                this.getBookingStats()
            ]);
            
            // Safely extract numbers
            const totalFlights = Array.isArray(flights) ? flights.length : 0;
            const totalRoutes = Array.isArray(routes) ? routes.length : 0;
            const totalUsers = userStats?.total_users || (Array.isArray(users) ? users.length : 0);
            const totalBookings = bookingStats?.total_bookings || (Array.isArray(bookings) ? bookings.length : 0);
            const totalRevenue = parseFloat(bookingStats?.total_revenue || 0);
            const confirmedBookings = bookingStats?.confirmed_bookings || 0;
            
            content = `
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
                                            <tr>
                                                <th>Flight #</th>
                                                <th>Airline</th>
                                                <th>Route</th>
                                                <th>Departure</th>
                                                <th>Seats</th>
                                                <th>Price</th>
                                                <th>Actions</th>
                                            </tr>
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
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Route</th>
                                                <th>Distance (km)</th>
                                                <th>Base Price</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
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
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Username</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
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
                                        <thead>
                                            <tr>
                                                <th>Reference</th>
                                                <th>User</th>
                                                <th>Flight</th>
                                                <th>Price</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
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
            content = `
                <div class="container">
                    <div class="auth-container">
                        <div class="auth-header">
                            <h2>Error Loading Dashboard</h2>
                            <p>${error.message}</p>
                        </div>
                        <button onclick="window.location.reload()" class="btn-primary">Retry</button>
                    </div>
                </div>
            `;
        }
        
        return content;
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
                                    <input type="text" id="flight_number" required placeholder="e.g., AA123">
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
                                    <input type="text" id="airline" required placeholder="Airline name">
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
                                    <input type="number" id="total_seats" required min="1" placeholder="e.g., 180">
                                </div>
                                <div class="form-control">
                                    <label>Available Seats</label>
                                    <input type="number" id="available_seats" placeholder="Leave empty = Total Seats">
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
                                    <input type="number" id="distance_km" required placeholder="e.g., 3980">
                                </div>
                                <div class="form-control">
                                    <label>Base Price *</label>
                                    <input type="number" step="0.01" id="base_price" required placeholder="e.g., 450.00">
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
    
    async getFlights() { 
        try { 
            return await flightService.getAllFlights(); 
        } catch (error) { 
            console.error('Error fetching flights:', error);
            return []; 
        } 
    },
    
    async getRoutes() { 
        try { 
            const token = authService.getToken(); 
            const response = await axios.get(`${API_BASE_URL}/routes`, { 
                headers: { Authorization: `Bearer ${token}` } 
            }); 
            return response.data || []; 
        } catch (error) { 
            console.error('Error fetching routes:', error);
            return []; 
        } 
    },
    
    async getUsers() { 
        try { 
            const token = authService.getToken(); 
            const response = await axios.get(`${API_BASE_URL}/users`, { 
                headers: { Authorization: `Bearer ${token}` } 
            }); 
            return response.data || []; 
        } catch (error) { 
            console.error('Error fetching users:', error);
            return []; 
        } 
    },
    
    async getBookings() { 
        try { 
            const token = authService.getToken(); 
            const response = await axios.get(`${API_BASE_URL}/bookings/all`, { 
                headers: { Authorization: `Bearer ${token}` } 
            }); 
            return response.data || []; 
        } catch (error) { 
            console.error('Error fetching bookings:', error);
            return []; 
        } 
    },
    
    async getUserStats() { 
        try { 
            const token = authService.getToken(); 
            const response = await axios.get(`${API_BASE_URL}/users/stats`, { 
                headers: { Authorization: `Bearer ${token}` } 
            }); 
            return response.data || {}; 
        } catch (error) { 
            console.error('Error fetching user stats:', error);
            return {}; 
        } 
    },
    
    async getBookingStats() { 
        try { 
            const token = authService.getToken(); 
            const response = await axios.get(`${API_BASE_URL}/bookings/stats/all`, { 
                headers: { Authorization: `Bearer ${token}` } 
            }); 
            return response.data || {}; 
        } catch (error) { 
            console.error('Error fetching booking stats:', error);
            return {}; 
        } 
    },
    
    attachEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                const tabContent = document.getElementById(`${tab}-tab`);
                if (tabContent) tabContent.classList.add('active');
                btn.classList.add('active');
            });
        });
        
        // Modal functions
        window.openAddFlightModal = () => {
            const modal = document.getElementById('addFlightModal');
            if (modal) modal.style.display = 'block';
        };
        window.closeAddFlightModal = () => {
            const modal = document.getElementById('addFlightModal');
            if (modal) modal.style.display = 'none';
        };
        window.openAddRouteModal = () => {
            const modal = document.getElementById('addRouteModal');
            if (modal) modal.style.display = 'block';
        };
        window.closeAddRouteModal = () => {
            const modal = document.getElementById('addRouteModal');
            if (modal) modal.style.display = 'none';
        };
        window.openAddUserModal = () => {
            const modal = document.getElementById('addUserModal');
            if (modal) modal.style.display = 'block';
        };
        window.closeAddUserModal = () => {
            const modal = document.getElementById('addUserModal');
            if (modal) modal.style.display = 'none';
        };
        
        // Close modals when clicking outside
        window.onclick = (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        };
        
        // Submit functions
        window.submitAddFlight = async () => {
            const submitBtn = event.target;
            const originalText = submitBtn.textContent;
            
            const flightData = {
                flight_number: document.getElementById('flight_number')?.value,
                route_id: parseInt(document.getElementById('route_id')?.value),
                airline: document.getElementById('airline')?.value,
                departure_time: document.getElementById('departure_time')?.value,
                arrival_time: document.getElementById('arrival_time')?.value,
                total_seats: parseInt(document.getElementById('total_seats')?.value),
                available_seats: document.getElementById('available_seats')?.value ? 
                    parseInt(document.getElementById('available_seats').value) : 
                    parseInt(document.getElementById('total_seats').value),
                price_multiplier: parseFloat(document.getElementById('price_multiplier')?.value) || 1.0
            };
            
            // Validate
            if (!flightData.flight_number || !flightData.route_id || !flightData.airline || 
                !flightData.departure_time || !flightData.arrival_time || !flightData.total_seats) {
                alert('Please fill in all required fields');
                return;
            }
            
            try {
                submitBtn.textContent = 'Creating...';
                submitBtn.disabled = true;
                
                await flightService.createFlight(flightData);
                alert('✅ Flight added successfully!');
                window.closeAddFlightModal();
                window.location.reload();
            } catch (error) { 
                alert('❌ Failed: ' + (error.response?.data?.message || error.message));
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        };
        
        window.submitAddRoute = async () => {
            const token = authService.getToken();
            const routeData = {
                origin_airport_id: parseInt(document.getElementById('origin_airport_id')?.value),
                destination_airport_id: parseInt(document.getElementById('destination_airport_id')?.value),
                distance_km: parseFloat(document.getElementById('distance_km')?.value),
                base_price: parseFloat(document.getElementById('base_price')?.value)
            };
            
            if (!routeData.origin_airport_id || !routeData.destination_airport_id || 
                !routeData.distance_km || !routeData.base_price) {
                alert('Please fill in all required fields');
                return;
            }
            
            try {
                await axios.post(`${API_BASE_URL}/routes`, routeData, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                alert('✅ Route added successfully!');
                window.closeAddRouteModal();
                window.location.reload();
            } catch (error) { 
                alert('❌ Failed: ' + (error.response?.data?.message || error.message));
            }
        };
        
        window.submitAddUser = async () => {
            const token = authService.getToken();
            const userData = {
                username: document.getElementById('username')?.value,
                email: document.getElementById('email')?.value,
                full_name: document.getElementById('full_name')?.value,
                phone: document.getElementById('phone')?.value,
                password: document.getElementById('password')?.value,
                role: document.getElementById('role')?.value
            };
            
            if (!userData.username || !userData.email || !userData.full_name || !userData.password) {
                alert('Please fill in all required fields');
                return;
            }
            
            if (userData.password.length < 6) {
                alert('Password must be at least 6 characters');
                return;
            }
            
            try {
                await axios.post(`${API_BASE_URL}/users`, userData, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                alert('✅ User added successfully!');
                window.closeAddUserModal();
                window.location.reload();
            } catch (error) { 
                alert('❌ Failed: ' + (error.response?.data?.message || error.message));
            }
        };
        
        // Delete functions
        window.deleteFlight = async (id) => { 
            if (confirm('Are you sure you want to delete this flight?')) { 
                const token = authService.getToken(); 
                try {
                    await axios.delete(`${API_BASE_URL}/flights/${id}`, { 
                        headers: { Authorization: `Bearer ${token}` } 
                    });
                    alert('✅ Flight deleted successfully!');
                    window.location.reload();
                } catch (error) {
                    alert('❌ Failed to delete flight: ' + (error.response?.data?.message || error.message));
                }
            } 
        };
        
        window.deleteRoute = async (id) => { 
            if (confirm('Are you sure you want to delete this route? This will also delete associated flights.')) { 
                const token = authService.getToken(); 
                try {
                    await axios.delete(`${API_BASE_URL}/routes/${id}`, { 
                        headers: { Authorization: `Bearer ${token}` } 
                    });
                    alert('✅ Route deleted successfully!');
                    window.location.reload();
                } catch (error) {
                    alert('❌ Failed to delete route: ' + (error.response?.data?.message || error.message));
                }
            } 
        };
        
        window.deleteUser = async (id) => { 
            if (confirm('Are you sure you want to delete this user? This will also delete their bookings.')) { 
                const token = authService.getToken(); 
                try {
                    await axios.delete(`${API_BASE_URL}/users/${id}`, { 
                        headers: { Authorization: `Bearer ${token}` } 
                    });
                    alert('✅ User deleted successfully!');
                    window.location.reload();
                } catch (error) {
                    alert('❌ Failed to delete user: ' + (error.response?.data?.message || error.message));
                }
            } 
        };
        
        window.updateUserRole = async (id, role) => { 
            const token = authService.getToken(); 
            try {
                await axios.put(`${API_BASE_URL}/users/${id}/role`, { role }, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                alert('✅ User role updated successfully!');
                window.location.reload();
            } catch (error) {
                alert('❌ Failed to update role: ' + (error.response?.data?.message || error.message));
            }
        };
    }
};

export default Admin;