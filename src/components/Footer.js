const Footer = {
    render() {
        const currentYear = new Date().getFullYear();
        
        return `
            <footer class="footer">
                <div class="footer-container">
                    <div class="footer-grid">
                        <!-- About Section -->
                        <div class="footer-section">
                            <h3>SkyLink <span>Airways</span></h3>
                            <p class="footer-description">
                                Connecting the world with excellence and care since 2024. 
                                Experience luxury travel at affordable prices with SkyLink Airways.
                            </p>
                            <div class="footer-social">
                                <a href="#" class="social-link" aria-label="Facebook">📘</a>
                                <a href="#" class="social-link" aria-label="Twitter">🐦</a>
                                <a href="#" class="social-link" aria-label="Instagram">📷</a>
                                <a href="#" class="social-link" aria-label="LinkedIn">🔗</a>
                            </div>
                        </div>
                        
                        <!-- Quick Links -->
                        <div class="footer-section">
                            <h4>Quick Links</h4>
                            <ul class="footer-links">
                                <li><a href="#" onclick="event.preventDefault(); window.App.navigateTo('home')">🏠 Home</a></li>
                                <li><a href="#" onclick="event.preventDefault(); window.App.navigateTo('flights')">✈️ Book a Flight</a></li>
                                <li><a href="#" onclick="event.preventDefault(); window.App.navigateTo('my-bookings')">📋 My Bookings</a></li>
                                <li><a href="#" onclick="event.preventDefault(); window.App.navigateTo('login')">🔐 Login / Register</a></li>
                            </ul>
                        </div>
                        
                        <!-- Support -->
                        <div class="footer-section">
                            <h4>Support</h4>
                            <ul class="footer-links">
                                <li><a href="#">❓ FAQ</a></li>
                                <li><a href="#">📖 Help Center</a></li>
                                <li><a href="#">📝 Terms & Conditions</a></li>
                                <li><a href="#">🔒 Privacy Policy</a></li>
                            </ul>
                        </div>
                        
                        <!-- Contact Info -->
                        <div class="footer-section">
                            <h4>Contact Us</h4>
                            <div class="contact-info">
                                <p class="contact-item">
                                    <span class="contact-icon">📍</span>
                                    <span>123 Aviation Boulevard,<br>Nairobi, Kenya</span>
                                </p>
                                <p class="contact-item">
                                    <span class="contact-icon">📞</span>
                                    <span>+1 (555) 123-4567</span>
                                </p>
                                <p class="contact-item">
                                    <span class="contact-icon">✉️</span>
                                    <span>info@skylinkairways.com</span>
                                </p>
                                <p class="contact-item">
                                    <span class="contact-icon">⏰</span>
                                    <span>24/7 Customer Support</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer-bottom">
                        <div class="footer-bottom-content">
                            <p>&copy; ${currentYear} SkyLink Airways. All rights reserved.</p>
                            <p class="footer-credit">Designed with ❤️ for seamless travel</p>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
};

export default Footer;