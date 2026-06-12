import { bookingService, authService } from '../services/api.js';

const MyBookings = {
    async render() {
        if (!authService.isAuthenticated()) {
            return `
                <div class="container">
                    <div class="auth-container">
                        <div class="auth-header">
                            <h2>Please Login</h2>
                            <p>You need to be logged in to view your bookings</p>
                        </div>
                        <button onclick="window.App.navigateTo('login')" class="btn-primary">Login to Continue</button>
                    </div>
                </div>
            `;
        }
        
        // Show loading state
        let bookingsHtml = `
            <div class="container">
                <h1>My Bookings</h1>
                <div class="loading-spinner" style="text-align: center; padding: 3rem;"></div>
            </div>
        `;
        
        try {
            const bookings = await bookingService.getUserBookings();
            
            if (!bookings || bookings.length === 0) {
                return `
                    <div class="container">
                        <h1>My Bookings</h1>
                        <div class="empty-state">
                            <div class="empty-state-icon">✈️</div>
                            <h3>No Bookings Yet</h3>
                            <p>You haven't booked any flights yet. Start your journey with us!</p>
                            <button onclick="window.App.navigateTo('flights')" class="btn-primary">Browse Flights</button>
                        </div>
                    </div>
                `;
            }
            
            let bookingsListHtml = `
                <div class="container">
                    <div class="bookings-header">
                        <h1>My Bookings</h1>
                        <p class="bookings-count">You have ${bookings.length} booking${bookings.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div class="bookings-list">
            `;
            
            bookings.forEach((booking, index) => {
                const statusColor = booking.status === 'confirmed' ? '#10B981' : '#EF4444';
                const paymentColor = booking.payment_status === 'paid' ? '#10B981' : '#F59E0B';
                const departureDate = new Date(booking.departure_time);
                const arrivalDate = new Date(booking.arrival_time);
                const bookingDate = new Date(booking.booking_date);
                
                bookingsListHtml += `
                    <div class="booking-card" data-booking-id="${booking.id}">
                        <div class="booking-header">
                            <div class="booking-reference">
                                <span class="ref-label">Booking Reference</span>
                                <span class="ref-value">${booking.booking_reference}</span>
                            </div>
                            <div class="booking-status">
                                <span class="status-badge status-${booking.status}">${booking.status}</span>
                                <span class="payment-badge payment-${booking.payment_status}">${booking.payment_status}</span>
                            </div>
                        </div>
                        
                        <div class="booking-route">
                            <div class="route-cities">
                                <div class="origin">
                                    <span class="city-code">${booking.origin_code}</span>
                                    <span class="city-name">${booking.origin_city || ''}</span>
                                </div>
                                <div class="route-line">
                                    <span>✈️</span>
                                    <div class="line"></div>
                                </div>
                                <div class="destination">
                                    <span class="city-code">${booking.dest_code}</span>
                                    <span class="city-name">${booking.dest_city || ''}</span>
                                </div>
                            </div>
                            <div class="flight-info">
                                <div class="info-item">
                                    <span class="info-label">Airline</span>
                                    <span class="info-value">${booking.airline || 'SkyLink Airways'}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">Flight Number</span>
                                    <span class="info-value">${booking.flight_number}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="booking-datetime">
                            <div class="datetime-item">
                                <span class="datetime-label">Departure</span>
                                <span class="datetime-value">${departureDate.toLocaleDateString()} at ${departureDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div class="datetime-item">
                                <span class="datetime-label">Arrival</span>
                                <span class="datetime-value">${arrivalDate.toLocaleDateString()} at ${arrivalDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                        </div>
                        
                        <div class="booking-passengers">
                            <div class="passengers-header">
                                <span>👥 Passengers</span>
                                <span class="passenger-count">${booking.passengers?.length || 1} passenger${booking.passengers?.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div class="passengers-list">
                                ${booking.passengers && booking.passengers.map(p => `
                                    <div class="passenger-item">
                                        <span class="passenger-name">${p.name}</span>
                                        <span class="passenger-details">Age: ${p.age} | Passport: ${p.passport}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="booking-footer">
                            <div class="booking-price">
                                <span class="price-label">Total Price</span>
                                <span class="price-value">$${parseFloat(booking.total_price).toFixed(2)}</span>
                            </div>
                            <div class="booking-date">
                                <span class="date-label">Booked on</span>
                                <span class="date-value">${bookingDate.toLocaleDateString()}</span>
                            </div>
                            ${booking.status === 'confirmed' ? `
                                <button onclick="window.cancelBooking(${booking.id})" class="btn-cancel">
                                    Cancel Booking
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
            
            bookingsListHtml += `
                    </div>
                </div>
            `;
            
            // Make cancel function global
            window.cancelBooking = async (bookingId) => {
                if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
                    // Show loading state on the button
                    const cancelBtn = document.querySelector(`.booking-card[data-booking-id="${bookingId}"] .btn-cancel`);
                    if (cancelBtn) {
                        cancelBtn.textContent = 'Cancelling...';
                        cancelBtn.disabled = true;
                    }
                    
                    try {
                        await bookingService.cancelBooking(bookingId);
                        alert('✅ Booking cancelled successfully');
                        window.App.navigateTo('my-bookings');
                        window.location.reload();
                    } catch (error) {
                        console.error('Error cancelling booking:', error);
                        alert('❌ Failed to cancel booking. Please try again.');
                        if (cancelBtn) {
                            cancelBtn.textContent = 'Cancel Booking';
                            cancelBtn.disabled = false;
                        }
                    }
                }
            };
            
            return bookingsListHtml;
            
        } catch (error) {
            console.error('Error loading bookings:', error);
            return `
                <div class="container">
                    <div class="error-state">
                        <div class="error-icon">⚠️</div>
                        <h3>Unable to Load Bookings</h3>
                        <p>There was an error loading your bookings. Please try again.</p>
                        <button onclick="window.location.reload()" class="btn-primary">Retry</button>
                    </div>
                </div>
            `;
        }
    }
};

export default MyBookings;