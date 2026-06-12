import { bookingService, authService } from '../services/api.js';

const MyBookings = {
    async render() {
        if (!authService.isAuthenticated()) {
            return `
                <div class="container">
                    <div class="auth-container">
                        <h2>Please Login</h2>
                        <p>You need to be logged in to view your bookings.</p>
                        <button onclick="window.App.navigateTo('login')" class="btn-primary">Login</button>
                    </div>
                </div>
            `;
        }
        
        try {
            const bookings = await bookingService.getUserBookings();
            
            if (bookings.length === 0) {
                return `
                    <div class="container">
                        <h1>My Bookings</h1>
                        <div class="auth-container">
                            <p>You have no bookings yet.</p>
                            <button onclick="window.App.navigateTo('flights')" class="btn-primary">Book a Flight</button>
                        </div>
                    </div>
                `;
            }
            
            let bookingsHtml = `
                <div class="container">
                    <h1>My Bookings</h1>
                    <div style="margin-top: 2rem;">
            `;
            
            bookings.forEach(booking => {
                bookingsHtml += `
                    <div class="flight-card">
                        <div class="flight-card-content">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div>
                                    <h3>Booking Reference: ${booking.booking_reference}</h3>
                                    <p><strong>Status:</strong> <span style="color: ${booking.status === 'confirmed' ? '#10B981' : '#EF4444'}">${booking.status}</span></p>
                                    <p><strong>Payment:</strong> <span style="color: ${booking.payment_status === 'paid' ? '#10B981' : '#F59E0B'}">${booking.payment_status}</span></p>
                                </div>
                                <div style="text-align: right;">
                                    <p><strong>Total Price:</strong> <span class="price">$${parseFloat(booking.total_price).toFixed(2)}</span></p>
                                    <p><strong>Booked on:</strong> ${new Date(booking.booking_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div class="flight-details">
                                <div>
                                    <strong>Flight</strong><br>
                                    ${booking.origin_code} → ${booking.dest_code}
                                </div>
                                <div>
                                    <strong>Flight Number</strong><br>
                                    ${booking.flight_number}
                                </div>
                                <div>
                                    <strong>Departure</strong><br>
                                    ${new Date(booking.departure_time).toLocaleString()}
                                </div>
                                <div>
                                    <strong>Arrival</strong><br>
                                    ${new Date(booking.arrival_time).toLocaleString()}
                                </div>
                            </div>
                            <div style="margin-top: 1rem;">
                                <h4>Passengers:</h4>
                                <ul>
                                    ${booking.passengers && booking.passengers.map(p => 
                                        `<li>${p.name} (Age: ${p.age}, Passport: ${p.passport})</li>`
                                    ).join('')}
                                </ul>
                            </div>
                            ${booking.status === 'confirmed' ? `
                                <div style="margin-top: 1rem;">
                                    <button onclick="window.cancelBooking(${booking.id})" class="btn-book" style="background: #EF4444;">Cancel Booking</button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
            
            bookingsHtml += `</div></div>`;
            
            // Make cancel function global
            window.cancelBooking = async (bookingId) => {
                if (confirm('Are you sure you want to cancel this booking?')) {
                    try {
                        await bookingService.cancelBooking(bookingId);
                        alert('Booking cancelled successfully');
                        window.App.navigateTo('my-bookings');
                    } catch (error) {
                        console.error('Error cancelling booking:', error);
                        alert('Failed to cancel booking. Please try again.');
                    }
                }
            };
            
            return bookingsHtml;
        } catch (error) {
            console.error('Error loading bookings:', error);
            return `
                <div class="container">
                    <div class="auth-container">
                        <h2>Error</h2>
                        <p>Unable to load your bookings. Please try again.</p>
                        <button onclick="window.location.reload()" class="btn-primary">Retry</button>
                    </div>
                </div>
            `;
        }
    }
};

export default MyBookings;