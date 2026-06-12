import { flightService, bookingService, authService } from '../services/api.js';

const Booking = {
    async render() {
        const flightId = sessionStorage.getItem('bookingFlightId');
        if (!flightId) {
            return `
                <div class="container">
                    <div class="auth-container">
                        <div class="auth-header">
                            <h2>No Flight Selected</h2>
                            <p>Please select a flight to continue with your booking.</p>
                        </div>
                        <button onclick="window.App.navigateTo('flights')" class="btn-primary">Browse Flights</button>
                    </div>
                </div>
            `;
        }

        try {
            const flight = await flightService.getFlightById(flightId);
            const currentUser = authService.getCurrentUser();
            
            const price = flight.base_price * flight.price_multiplier;
            const departureDate = new Date(flight.departure_time);
            const arrivalDate = new Date(flight.arrival_time);
            
            return `
                <div class="container">
                    <div class="booking-page">
                        <h1>Complete Your Booking</h1>
                        
                        <div class="booking-layout">
                            <!-- Flight Details Section -->
                            <div class="booking-flight-details">
                                <div class="section-card">
                                    <div class="section-header">
                                        <span class="section-icon">✈️</span>
                                        <h3>Flight Details</h3>
                                    </div>
                                    <div class="flight-summary">
                                        <div class="flight-route-large">
                                            <div class="route-cities">
                                                <div class="city">
                                                    <span class="city-code">${flight.origin_code}</span>
                                                    <span class="city-name">${flight.origin_city || ''}</span>
                                                </div>
                                                <div class="route-arrow">→</div>
                                                <div class="city">
                                                    <span class="city-code">${flight.dest_code}</span>
                                                    <span class="city-name">${flight.dest_city || ''}</span>
                                                </div>
                                            </div>
                                            <div class="flight-meta">
                                                <div class="meta-item">
                                                    <span class="meta-label">Airline</span>
                                                    <span class="meta-value">${flight.airline}</span>
                                                </div>
                                                <div class="meta-item">
                                                    <span class="meta-label">Flight Number</span>
                                                    <span class="meta-value">${flight.flight_number}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="flight-schedule">
                                            <div class="schedule-item">
                                                <span class="schedule-label">Departure</span>
                                                <span class="schedule-date">${departureDate.toLocaleDateString()}</span>
                                                <span class="schedule-time">${departureDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            <div class="schedule-divider"></div>
                                            <div class="schedule-item">
                                                <span class="schedule-label">Arrival</span>
                                                <span class="schedule-date">${arrivalDate.toLocaleDateString()}</span>
                                                <span class="schedule-time">${arrivalDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                        </div>
                                        
                                        <div class="flight-availability">
                                            <span class="availability-label">Available Seats</span>
                                            <span class="availability-value ${flight.available_seats < 10 ? 'low' : ''}">${flight.available_seats} seats left</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Passenger Information Section -->
                            <div class="booking-passenger-form">
                                <div class="section-card">
                                    <div class="section-header">
                                        <span class="section-icon">👤</span>
                                        <h3>Passenger Information</h3>
                                    </div>
                                    
                                    <form id="booking-form">
                                        <div class="passenger-card" id="passenger-1">
                                            <div class="passenger-header">
                                                <span class="passenger-number">Passenger 1</span>
                                                <span class="passenger-badge">Main Traveler</span>
                                            </div>
                                            <div class="form-row">
                                                <div class="form-control">
                                                    <label>Full Name *</label>
                                                    <input type="text" id="passenger-name" value="${currentUser.full_name}" required>
                                                </div>
                                                <div class="form-control">
                                                    <label>Age *</label>
                                                    <input type="number" id="passenger-age" min="0" max="120" required>
                                                </div>
                                                <div class="form-control">
                                                    <label>Passport Number *</label>
                                                    <input type="text" id="passport-number" placeholder="Enter passport number" required>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div id="extra-passengers"></div>
                                        
                                        <div class="form-control">
                                            <label>Number of Passengers</label>
                                            <select id="passenger-count" class="passenger-count-select">
                                                <option value="1">1 Passenger</option>
                                                <option value="2">2 Passengers</option>
                                                <option value="3">3 Passengers</option>
                                                <option value="4">4 Passengers</option>
                                                <option value="5">5 Passengers</option>
                                            </select>
                                        </div>
                                        
                                        <div class="price-summary">
                                            <div class="price-row">
                                                <span>Price per seat</span>
                                                <span>$${price.toFixed(2)}</span>
                                            </div>
                                            <div class="price-row">
                                                <span>Number of passengers</span>
                                                <span id="passenger-count-display">1</span>
                                            </div>
                                            <div class="price-row total">
                                                <span>Total Price</span>
                                                <span id="total-price">$${price.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        
                                        <div class="booking-actions">
                                            <button type="button" onclick="window.App.navigateTo('flights')" class="btn-secondary">Cancel</button>
                                            <button type="submit" class="btn-primary" id="confirm-booking-btn">Confirm Booking</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading flight:', error);
            return `
                <div class="container">
                    <div class="auth-container">
                        <div class="auth-header">
                            <h2>Error Loading Flight</h2>
                            <p>Unable to load flight details. Please try again.</p>
                        </div>
                        <button onclick="window.App.navigateTo('flights')" class="btn-primary">Back to Flights</button>
                    </div>
                </div>
            `;
        }
    },
    
    attachEvents() {
        const passengerCount = document.getElementById('passenger-count');
        if (passengerCount) {
            passengerCount.addEventListener('change', (e) => {
                const count = parseInt(e.target.value);
                this.updatePassengerFields(count);
                this.updateTotalPrice();
                document.getElementById('passenger-count-display').textContent = count;
            });
        }
        
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            bookingForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.submitBooking();
            });
        }
        
        this.updateTotalPrice();
        
        // Add input validation for passport number
        const passportInput = document.getElementById('passport-number');
        if (passportInput) {
            passportInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            });
        }
        
        // Age validation
        const ageInput = document.getElementById('passenger-age');
        if (ageInput) {
            ageInput.addEventListener('input', (e) => {
                let value = parseInt(e.target.value);
                if (value < 0) e.target.value = 0;
                if (value > 120) e.target.value = 120;
            });
        }
    },
    
    updatePassengerFields(count) {
        const container = document.getElementById('extra-passengers');
        if (!container) return;
        
        let html = '';
        for (let i = 2; i <= count; i++) {
            html += `
                <div class="passenger-card" id="passenger-${i}">
                    <div class="passenger-header">
                        <span class="passenger-number">Passenger ${i}</span>
                    </div>
                    <div class="form-row">
                        <div class="form-control">
                            <label>Full Name *</label>
                            <input type="text" id="passenger-name-${i}" required>
                        </div>
                        <div class="form-control">
                            <label>Age *</label>
                            <input type="number" id="passenger-age-${i}" min="0" max="120" required>
                        </div>
                        <div class="form-control">
                            <label>Passport Number *</label>
                            <input type="text" id="passport-number-${i}" placeholder="Enter passport number" required>
                        </div>
                    </div>
                </div>
            `;
        }
        container.innerHTML = html;
        
        // Add validation for new passenger fields
        for (let i = 2; i <= count; i++) {
            const passportInput = document.getElementById(`passport-number-${i}`);
            if (passportInput) {
                passportInput.addEventListener('input', (e) => {
                    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                });
            }
            
            const ageInput = document.getElementById(`passenger-age-${i}`);
            if (ageInput) {
                ageInput.addEventListener('input', (e) => {
                    let value = parseInt(e.target.value);
                    if (value < 0) e.target.value = 0;
                    if (value > 120) e.target.value = 120;
                });
            }
        }
    },
    
    async updateTotalPrice() {
        const passengerCount = document.getElementById('passenger-count');
        const flightId = sessionStorage.getItem('bookingFlightId');
        
        if (passengerCount && flightId) {
            try {
                const flight = await flightService.getFlightById(flightId);
                const price = flight.base_price * flight.price_multiplier;
                const total = price * parseInt(passengerCount.value);
                const totalPriceDiv = document.getElementById('total-price');
                if (totalPriceDiv) {
                    totalPriceDiv.textContent = `$${total.toFixed(2)}`;
                }
            } catch (error) {
                console.error('Error calculating price:', error);
            }
        }
    },
    
    async submitBooking() {
        const flightId = sessionStorage.getItem('bookingFlightId');
        const passengerCount = parseInt(document.getElementById('passenger-count').value);
        const submitBtn = document.getElementById('confirm-booking-btn');
        const originalBtnText = submitBtn?.textContent;
        
        // Collect passenger information
        const passengers = [];
        
        // Validate Passenger 1
        const passenger1Name = document.getElementById('passenger-name').value.trim();
        const passenger1Age = document.getElementById('passenger-age').value;
        const passenger1Passport = document.getElementById('passport-number').value.trim();
        
        if (!passenger1Name || !passenger1Age || !passenger1Passport) {
            this.showError('Please fill in all passenger details');
            return;
        }
        
        if (parseInt(passenger1Age) < 0 || parseInt(passenger1Age) > 120) {
            this.showError('Please enter a valid age (0-120)');
            return;
        }
        
        if (passenger1Passport.length < 5) {
            this.showError('Please enter a valid passport number');
            return;
        }
        
        passengers.push({
            full_name: passenger1Name,
            age: parseInt(passenger1Age),
            passport_number: passenger1Passport.toUpperCase()
        });
        
        // Validate additional passengers
        for (let i = 2; i <= passengerCount; i++) {
            const name = document.getElementById(`passenger-name-${i}`)?.value.trim();
            const age = document.getElementById(`passenger-age-${i}`)?.value;
            const passport = document.getElementById(`passport-number-${i}`)?.value.trim();
            
            if (!name || !age || !passport) {
                this.showError(`Please fill in all details for passenger ${i}`);
                return;
            }
            
            if (parseInt(age) < 0 || parseInt(age) > 120) {
                this.showError(`Please enter a valid age for passenger ${i}`);
                return;
            }
            
            if (passport.length < 5) {
                this.showError(`Please enter a valid passport number for passenger ${i}`);
                return;
            }
            
            passengers.push({
                full_name: name,
                age: parseInt(age),
                passport_number: passport.toUpperCase()
            });
        }
        
        // Get flight details for price calculation
        const flight = await flightService.getFlightById(flightId);
        const pricePerSeat = flight.base_price * flight.price_multiplier;
        const totalPrice = pricePerSeat * passengerCount;
        
        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
        }
        
        // Create booking
        try {
            const booking = await bookingService.createBooking({
                flight_id: parseInt(flightId),
                passengers: passengers,
                total_price: totalPrice
            });
            
            this.showSuccess(`Booking successful! Your booking reference is: ${booking.booking_reference}`);
            
            setTimeout(() => {
                sessionStorage.removeItem('bookingFlightId');
                window.App.navigateTo('my-bookings');
            }, 2000);
            
        } catch (error) {
            console.error('Booking error:', error);
            let errorMessage = 'Failed to create booking. Please try again.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            this.showError(errorMessage);
            
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
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
        
        const form = document.getElementById('booking-form');
        form.parentNode.insertBefore(alert, form);
        
        setTimeout(() => alert.remove(), 5000);
        
        const closeBtn = alert.querySelector('.alert-close');
        if (closeBtn) {
            closeBtn.onclick = () => alert.remove();
        }
    },
    
    showSuccess(message) {
        const alert = document.createElement('div');
        alert.className = 'alert-message alert-success';
        alert.innerHTML = `
            <span>✅</span>
            <span>${message}</span>
        `;
        
        const form = document.getElementById('booking-form');
        form.parentNode.insertBefore(alert, form);
    }
};

export default Booking;