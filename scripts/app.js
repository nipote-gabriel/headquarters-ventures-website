/**
 * Headquarters Ventures Website JavaScript
 * Handles loading and displaying podcast episodes and blog posts
 */

class HQVSite {
    constructor() {
        this.config = null;
        this.episodes = null;
        this.posts = null;
        
        this.init();
    }

    async init() {
        try {
            // Load configuration and data
            await this.loadConfig();
            await this.loadEpisodes();
            await this.loadPosts();
            
            // Initialize UI components
            this.setupNavigation();
            this.setupLiveIndicator();
            this.setupPlatformLinks();
            this.loadLatestEpisodes();
            this.loadRecentPosts();
            this.setupNewsletterSignup();
            this.setupFooterLinks();
            this.setupPortfolioTracker();
            this.setupStockTicker();
            
        } catch (error) {
            console.error('Error initializing site:', error);
        }
    }

    async loadConfig() {
        try {
            const response = await fetch('/data/config.json');
            this.config = await response.json();
        } catch (error) {
            console.error('Error loading config:', error);
            // Fallback config
            this.config = {
                site_name: "Headquarters Ventures",
                tagline: "Business, comedy, and the occasional bad idea.",
                accent_color: "#FFD200",
                on_air: false,
                social: { x: "#", youtube: "#", spotify: "#", apple: "#" }
            };
        }
    }

    async loadEpisodes() {
        try {
            const response = await fetch('/data/episodes.json');
            const data = await response.json();
            this.episodes = data.episodes;
        } catch (error) {
            console.error('Error loading episodes:', error);
            this.episodes = [];
        }
    }

    async loadPosts() {
        try {
            const response = await fetch('/data/posts.json');
            const data = await response.json();
            this.posts = data.posts.filter(post => post.published);
        } catch (error) {
            console.error('Error loading posts:', error);
            this.posts = [];
        }
    }

    setupNavigation() {
        // Mobile menu toggle
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const mobileOverlay = document.querySelector('.mobile-menu-overlay');
        const mobileClose = document.querySelector('.mobile-menu-close');

        if (mobileToggle && mobileOverlay) {
            mobileToggle.addEventListener('click', () => {
                mobileOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }

        if (mobileClose && mobileOverlay) {
            mobileClose.addEventListener('click', () => {
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', (e) => {
                if (e.target === mobileOverlay) {
                    mobileOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }

        // Active nav link highlighting
        const currentPage = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage || 
                (currentPage === '/index.html' && link.getAttribute('href') === '/') ||
                (currentPage === '/' && link.getAttribute('href') === '/')) {
                link.classList.add('active');
            }
        });
    }

    setupLiveIndicator() {
        const liveIndicator = document.getElementById('live-indicator');
        if (liveIndicator && this.config?.on_air) {
            liveIndicator.style.display = 'flex';
        }
    }

    setupPlatformLinks() {
        if (!this.config?.social) return;

        // Update platform links in subscribe section
        const platformLinks = document.querySelectorAll('.platform-link');
        platformLinks.forEach(link => {
            const platform = link.dataset.platform;
            if (this.config.social[platform] && this.config.social[platform] !== '#') {
                link.href = this.config.social[platform];
            }
        });
    }

    loadLatestEpisodes() {
        const container = document.getElementById('latest-episodes');
        if (!container || !this.episodes) return;

        // Show latest 3 episodes
        const latestEpisodes = this.episodes
            .filter(ep => ep.featured)
            .slice(0, 3);

        if (latestEpisodes.length === 0) {
            container.innerHTML = '<div class="loading">No episodes available yet.</div>';
            return;
        }

        const episodeCards = latestEpisodes.map(episode => this.createEpisodeCard(episode));
        container.innerHTML = episodeCards.join('');
    }

    createEpisodeCard(episode) {
        const date = new Date(episode.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
            <div class="episode-card">
                <div class="episode-number">Episode ${episode.number}</div>
                <h3 class="episode-title">${episode.title}</h3>
                <p class="episode-description">${episode.description}</p>
                <div class="episode-meta">
                    <span>${date}</span>
                    <span>${episode.duration}</span>
                </div>
                ${episode.guest ? `<div class="episode-guest">Guest: ${episode.guest}</div>` : ''}
            </div>
        `;
    }

    loadRecentPosts() {
        const container = document.getElementById('recent-posts');
        if (!container || !this.posts) return;

        // Show latest 3 posts
        const recentPosts = this.posts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);

        if (recentPosts.length === 0) {
            container.innerHTML = '<div class="loading">No blog posts available yet.</div>';
            return;
        }

        const postCards = recentPosts.map(post => this.createPostCard(post));
        container.innerHTML = postCards.join('');
    }

    createPostCard(post) {
        const date = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const postUrl = post.url || `/post.html?id=${post.id}`;
        const linkTarget = post.url ? '_blank' : '_self';

        return `
            <article class="post-card">
                <div class="post-content">
                    <div class="post-date">${date}</div>
                    <h3 class="post-title">
                        <a href="${postUrl}" target="${linkTarget}">${post.title}</a>
                    </h3>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <div class="post-category">${post.category}</div>
                </div>
            </article>
        `;
    }

    setupNewsletterSignup() {
        const container = document.getElementById('newsletter-signup');
        if (!container || !this.config?.subscribe_embed) return;

        // Only show if there's actual embed code (not the placeholder comment)
        if (this.config.subscribe_embed.includes('<!-- Paste your')) {
            container.style.display = 'none';
        } else {
            container.innerHTML = this.config.subscribe_embed;
        }
    }

    setupFooterLinks() {
        if (!this.config?.social) return;

        // Update footer social links
        const footerLinks = {
            'footer-x': this.config.social.x,
            'footer-youtube': this.config.social.youtube,
            'footer-spotify': this.config.social.spotify,
            'footer-apple': this.config.social.apple
        };

        Object.entries(footerLinks).forEach(([id, url]) => {
            const link = document.getElementById(id);
            if (link && url && url !== '#') {
                link.href = url;
            }
        });
    }

    // Utility methods
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    truncateText(text, maxLength = 150) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    setupPortfolioTracker() {
        // Portfolio holdings - diversified across major stocks
        this.portfolioHoldings = [
            { symbol: 'AAPL', name: 'Apple Inc.', shares: 12, price: 175.50 },
            { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 8, price: 410.25 },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 15, price: 140.80 },
            { symbol: 'AMZN', name: 'Amazon.com Inc.', shares: 6, price: 180.45 },
            { symbol: 'TSLA', name: 'Tesla Inc.', shares: 20, price: 250.90 },
            { symbol: 'NVDA', name: 'NVIDIA Corp.', shares: 3, price: 880.60 },
            { symbol: 'META', name: 'Meta Platforms', shares: 10, price: 320.15 },
            { symbol: 'NFLX', name: 'Netflix Inc.', shares: 4, price: 450.30 },
            { symbol: 'V', name: 'Visa Inc.', shares: 7, price: 260.40 },
            { symbol: 'JPM', name: 'JPMorgan Chase', shares: 9, price: 145.25 }
        ];

        // Calculate total portfolio value
        let totalValue = this.portfolioHoldings.reduce((sum, holding) => 
            sum + (holding.shares * holding.price), 0);

        // Mock performance data
        let previousValue = totalValue * 0.985; // Simulate 1.5% gain
        let change = totalValue - previousValue;
        let changePercent = (change / previousValue) * 100;

        // Generate mock chart data
        const chartData = this.generateMockChartData(previousValue, totalValue);

        // Update portfolio display
        this.updatePortfolioDisplay(change, changePercent, totalValue);
        this.updatePortfolioHoldings(totalValue);

        // Draw chart
        this.drawPortfolioChart(chartData);

        // Simulate real-time updates every 30 seconds
        setInterval(() => {
            // Simulate price fluctuations for each holding
            this.portfolioHoldings.forEach(holding => {
                const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% price movement
                holding.price *= (1 + fluctuation);
            });

            // Recalculate totals
            totalValue = this.portfolioHoldings.reduce((sum, holding) => 
                sum + (holding.shares * holding.price), 0);
            change = totalValue - previousValue;
            changePercent = (change / previousValue) * 100;

            this.updatePortfolioDisplay(change, changePercent, totalValue);
            this.updatePortfolioHoldings(totalValue);
            
            // Update chart data and redraw
            chartData.push(totalValue);
            if (chartData.length > 20) chartData.shift(); // Keep only last 20 points
            this.drawPortfolioChart(chartData);
        }, 30000);
    }

    updatePortfolioHoldings(totalValue) {
        const holdingsContainer = document.getElementById('portfolio-holdings');
        if (!holdingsContainer) return;

        // Filter holdings that account for >10% of portfolio
        const keyHoldings = this.portfolioHoldings
            .map(holding => ({
                ...holding,
                value: holding.shares * holding.price,
                percentage: ((holding.shares * holding.price) / totalValue) * 100
            }))
            .filter(holding => holding.percentage > 10)
            .sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending

        const holdingsHtml = keyHoldings.map(holding => `
            <div class="key-holding-item">
                <div class="holding-info">
                    <div class="holding-symbol">${holding.symbol}</div>
                    <div class="holding-name">${holding.name}</div>
                </div>
                <div class="holding-details">
                    <div class="holding-value">$${holding.value.toFixed(2)}</div>
                    <div class="holding-percentage">${holding.percentage.toFixed(1)}%</div>
                </div>
            </div>
        `).join('');

        holdingsContainer.innerHTML = holdingsHtml;
    }

    generateMockChartData(startPrice, endPrice) {
        const points = 20;
        const data = [];
        const step = (endPrice - startPrice) / points;
        
        for (let i = 0; i <= points; i++) {
            const noise = (Math.random() - 0.5) * 2; // Add some randomness
            data.push(startPrice + (step * i) + noise);
        }
        
        return data;
    }

    updatePortfolioDisplay(change, changePercent, totalValue) {
        const statusIndicator = document.getElementById('status-indicator');
        const statusValue = document.getElementById('status-value');
        const aaplValue = document.getElementById('aapl-value');
        const totalValueEl = document.getElementById('total-value');

        const isPositive = change >= 0;
        
        // Update status indicator
        if (statusIndicator) {
            statusIndicator.textContent = isPositive ? '▲' : '▼';
            statusIndicator.className = `status-indicator ${isPositive ? 'positive' : 'negative'}`;
        }

        // Update status value
        if (statusValue) {
            const sign = isPositive ? '+' : '';
            statusValue.textContent = `${sign}$${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
            statusValue.className = `status-value ${isPositive ? 'positive' : 'negative'}`;
        }

        // Update holding value
        if (aaplValue) {
            aaplValue.textContent = `$${totalValue.toFixed(2)}`;
        }

        // Update total value
        if (totalValueEl) {
            totalValueEl.textContent = `$${totalValue.toFixed(2)}`;
        }
    }

    drawPortfolioChart(data) {
        const canvas = document.getElementById('portfolio-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        if (data.length < 2) return;

        // Find min/max for scaling
        const minPrice = Math.min(...data);
        const maxPrice = Math.max(...data);
        const range = maxPrice - minPrice || 1;

        // Set up drawing
        ctx.strokeStyle = data[data.length - 1] >= data[0] ? '#00ff88' : '#ff4757';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw line
        ctx.beginPath();
        data.forEach((price, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((price - minPrice) / range) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Fill area under curve
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    async setupStockTicker() {
        // Top stocks for the ticker - reduced to ~30 for better performance
        const stocks = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 
            'JPM', 'BAC', 'V', 'MA', 'JNJ', 'UNH', 'PG', 'HD',
            'WMT', 'DIS', 'KO', 'PEP', 'NKE', 'MCD', 'COST', 'SBUX',
            'BA', 'CAT', 'XOM', 'CVX', 'SPY', 'QQQ'
        ];

        const stockTicker = document.getElementById('stock-ticker');
        if (!stockTicker) return;

        const tickerContent = stockTicker.querySelector('.ticker-content');
        
        // Start with immediate mock data so ticker begins scrolling right away
        this.generateMockStockData(stocks, tickerContent);
        
        // Then fetch real data and replace it (async, non-blocking)
        this.updateStockData(stocks, tickerContent);
        
        // Update every 2 minutes (to respect API rate limits)
        setInterval(() => {
            this.updateStockData(stocks, tickerContent);
        }, 120000);
    }

    async updateStockData(stocks, tickerContent) {
        try {
            // Using a free financial API - you can replace with your preferred service
            // For demo, we'll use a fallback to mock data since we need an API key
            const stockData = await this.fetchStockData(stocks);
            
            const tickerItems = stockData.map(stock => {
                const isPositive = stock.change >= 0;
                const sign = isPositive ? '+' : '';
                const color = isPositive ? '#00ff88' : '#ff4757';
                
                return `<span class="ticker-item" style="color: ${color}">${stock.symbol} $${stock.price.toFixed(2)} ${sign}${stock.change.toFixed(2)} (${sign}${stock.changePercent.toFixed(2)}%)</span>`;
            });

            if (tickerContent) {
                tickerContent.innerHTML = tickerItems.join('');
            }
        } catch (error) {
            console.error('Error updating stock data:', error);
            // Fallback to mock data if API fails
            this.generateMockStockData(stocks, tickerContent);
        }
    }

    async fetchStockData(symbols) {
        const API_KEY = 'd31lo2pr01qsprr1j1pgd31lo2pr01qsprr1j1q0';
        const stockData = [];
        
        try {
            // Fetch real data from Finnhub API
            const promises = symbols.map(async (symbol) => {
                try {
                    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`);
                    const data = await response.json();
                    
                    // Finnhub returns: c (current price), d (change), dp (percent change)
                    if (data.c && data.c > 0) {
                        return {
                            symbol,
                            price: data.c,
                            change: data.d || 0,
                            changePercent: data.dp || 0
                        };
                    } else {
                        // Fallback if API returns invalid data
                        return this.getMockStockData(symbol);
                    }
                } catch (error) {
                    console.warn(`Error fetching ${symbol}:`, error);
                    return this.getMockStockData(symbol);
                }
            });
            
            const results = await Promise.all(promises);
            return results.filter(Boolean); // Remove any null results
            
        } catch (error) {
            console.error('Error fetching stock data:', error);
            // Return mock data as fallback
            return symbols.map(symbol => this.getMockStockData(symbol));
        }
    }
    
    getMockStockData(symbol) {
        // Realistic base prices for fallback
        const basePrices = {
            'AAPL': 175, 'MSFT': 410, 'GOOGL': 140, 'AMZN': 180, 'TSLA': 250,
            'NVDA': 880, 'META': 320, 'NFLX': 450, 'JPM': 145, 'BAC': 35,
            'V': 260, 'MA': 410, 'JNJ': 160, 'UNH': 520, 'PG': 155,
            'HD': 330, 'WMT': 165, 'DIS': 95, 'KO': 60, 'PEP': 170,
            'NKE': 105, 'MCD': 290, 'COST': 720, 'SBUX': 95, 'BA': 210,
            'CAT': 340, 'XOM': 110, 'CVX': 155, 'SPY': 480, 'QQQ': 390
        };
        
        const basePrice = basePrices[symbol] || Math.random() * 300 + 50;
        const volatility = Math.random() * 0.05 + 0.01; // 1-6% daily volatility
        const change = (Math.random() - 0.5) * basePrice * volatility;
        const price = basePrice + change;
        const changePercent = (change / basePrice) * 100;
        
        return {
            symbol,
            price,
            change,
            changePercent
        };
    }

    generateMockStockData(stocks, tickerContent) {
        const tickerItems = stocks.map(symbol => {
            const basePrice = Math.random() * 500 + 50;
            const change = (Math.random() - 0.5) * 20;
            const percentChange = (change / basePrice) * 100;
            const isPositive = change >= 0;
            const sign = isPositive ? '+' : '';
            const color = isPositive ? '#00ff88' : '#ff4757';
            
            return `<span class="ticker-item" style="color: ${color}">${symbol} $${basePrice.toFixed(2)} ${sign}${change.toFixed(2)} (${sign}${percentChange.toFixed(2)}%)</span>`;
        });

        if (tickerContent) {
            tickerContent.innerHTML = tickerItems.join('');
        }
    }

}

// Analytics and tracking
class Analytics {
    static trackEvent(category, action, label = null) {
        // Google Analytics 4 tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label
            });
        }

        // Alternative analytics tracking can be added here
        console.log(`Analytics: ${category} - ${action}${label ? ` - ${label}` : ''}`);
    }

    static trackPageView(page = null) {
        const currentPage = page || window.location.pathname;
        
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_path: currentPage
            });
        }

        console.log(`Page view: ${currentPage}`);
    }
}

// Smooth scroll for anchor links
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Track navigation events
                Analytics.trackEvent('Navigation', 'Anchor Click', this.getAttribute('href'));
            }
        });
    });
}

// Platform link tracking
function setupPlatformTracking() {
    document.querySelectorAll('.platform-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const platform = e.currentTarget.dataset.platform;
            Analytics.trackEvent('Subscribe', 'Platform Click', platform);
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main site functionality
    window.hqvSite = new HQVSite();
    
    // Setup additional features
    setupSmoothScroll();
    setupPlatformTracking();
    
    // Track initial page view
    Analytics.trackPageView();
    
    // Add CSS variable for accent color from config
    setTimeout(() => {
        if (window.hqvSite?.config?.accent_color) {
            document.documentElement.style.setProperty('--accent-color', window.hqvSite.config.accent_color);
        }
    }, 100);
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Newsletter subscription function
function subscribeToNewsletter() {
    const emailInput = document.getElementById('newsletter-email');
    const email = emailInput.value.trim();
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    if (!email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Open beehiiv subscription page with email pre-filled if possible
    const subscribeUrl = `https://in-competence-we-trust.beehiiv.com/subscribe?email=${encodeURIComponent(email)}`;
    window.open(subscribeUrl, '_blank');
    
    // Clear the input
    emailInput.value = '';
    
    // Track subscription attempt
    Analytics.trackEvent('Newsletter', 'Subscribe Attempt', email);
}

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HQVSite, Analytics };
}