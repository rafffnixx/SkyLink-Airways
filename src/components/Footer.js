const Footer = {
    render() {
        return `
            <footer class="footer">
                <div class="footer-content">
                    <div>
                        <h3>SkyLink Airways</h3>
                        <p>Connecting the world with excellence and care since 2024.</p>
                    </div>
                    <div>
                        <h4>Quick Links</h4>
                        <p><a href="#" onclick="event.preventDefault(); window.App.navigateTo('flights')">Book a Flight</a></p>
                        <p><a href="#" onclick="event.preventDefault(); window.App.navigateTo('home')">Home</a></p>
                    </div>
                    <div>
                        <h4>Contact</h4>
                        <p>📞 +1 (555) 123-4567</p>
                        <p>✉️ info@skylinkairways.com</p>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2024 SkyLink Airways. All rights reserved.</p>
                </div>
            </footer>
        `;
    }
};

export default Footer;