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
            this.setupInfohubScrolling();
            this.setupSponsorCarousel();
            
        } catch (error) {
            console.error('Error initializing site:', error);
            this.displayError('Error initializing site. Please try again later.');
        }
    }

    displayError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
    }

    async loadConfig() {
        try {
            const response = await fetch('/data/config.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.config = await response.json();
        } catch (error) {
            console.error('Error loading config:', error);
            this.displayError('Could not load site configuration.');
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
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.episodes = data.episodes;
        } catch (error) {
            console.error('Error loading episodes:', error);
            this.displayError('Could not load episodes.');
            this.episodes = [];
        }
    }

    async loadPosts() {
        try {
            const response = await fetch('/data/posts.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.posts = data.posts.filter(post => post.published);
        } catch (error) {
            console.error('Error loading posts:', error);
            this.displayError('Could not load posts.');
            this.posts = [];
        }
    }

    setupNavigation() {
        // Mobile menu toggle
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const mobileOverlay = document.querySelector('.mobile-menu-overlay');
        const mobileClose = document.querySelector('.mobile-menu-close');
        const navMenu = document.querySelector('.nav-menu');

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
            // Using mock data to avoid CORS issues with financial APIs
            // Generate realistic-looking stock data for demonstration
            const stockData = stocks.map(symbol => this.getMockStockData(symbol));

            const tickerItems = this.insertSponsorAds(stockData.map(stock => {
                const isPositive = stock.change >= 0;
                const sign = isPositive ? '+' : '';
                const cssClass = isPositive ? 'ticker-item' : 'ticker-item negative';

                return `<span class="${cssClass}">${stock.symbol} $${stock.price.toFixed(2)} ${sign}${stock.change.toFixed(2)} (${sign}${stock.changePercent.toFixed(2)}%)</span>`;
            }));

            if (tickerContent) {
                const newContent = tickerItems.join('');
                // Only update if content actually changed to avoid animation restart
                if (tickerContent.innerHTML !== newContent) {
                    // Store current animation state
                    const computedStyle = window.getComputedStyle(tickerContent);
                    const animationName = computedStyle.animationName;
                    const animationDuration = computedStyle.animationDuration;
                    const animationTimingFunction = computedStyle.animationTimingFunction;
                    const animationIterationCount = computedStyle.animationIterationCount;
                    const animationDelay = computedStyle.animationDelay;

                    // Temporarily pause animation
                    tickerContent.style.animationPlayState = 'paused';

                    // Update content
                    tickerContent.innerHTML = newContent;

                    // Force reflow
                    tickerContent.offsetHeight;

                    // Resume animation
                    tickerContent.style.animationPlayState = 'running';
                }
            }
        } catch (error) {
            console.error('Error updating stock data:', error);
            // Fallback to mock data if API fails
            this.generateMockStockData(stocks, tickerContent);
        }
    }

    async fetchStockData(symbols) {
        // Real Finnhub API key - will fallback to mock data if out of tokens or API fails
        const API_KEY = 'd31lo2pr01qsprr1j1pgd31lo2pr01qsprr1j1q0';

        try {
            const promises = symbols.map(async (symbol) => {
                try {
                    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`);

                    // Handle API rate limit or quota exceeded
                    if (response.status === 429) {
                        console.warn('Finnhub API rate limit reached, using mock data');
                        return this.getMockStockData(symbol);
                    }

                    // Handle quota exceeded or other API limits
                    if (response.status === 403) {
                        console.warn('Finnhub API quota exceeded, using mock data');
                        return this.getMockStockData(symbol);
                    }

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();

                    // Check if API returned valid data
                    if (data.c && data.c > 0) {
                        return {
                            symbol,
                            price: Number(data.c.toFixed(2)),
                            change: Number((data.d || 0).toFixed(2)),
                            changePercent: Number((data.dp || 0).toFixed(2))
                        };
                    } else {
                        // API returned empty/invalid data, use mock
                        console.warn(`Invalid data for ${symbol}, using mock data`);
                        return this.getMockStockData(symbol);
                    }
                } catch (error) {
                    // Network error or other issue, silently fallback to mock data
                    console.warn(`Error fetching ${symbol}, using mock data:`, error.message);
                    return this.getMockStockData(symbol);
                }
            });

            return Promise.all(promises);
        } catch (error) {
            // Fallback to all mock data if there's a general error
            console.warn('General API error, using all mock data:', error.message);
            return symbols.map(symbol => this.getMockStockData(symbol));
        }
    }
    
    getMockStockData(symbol) {
        // Realistic base prices for fallback
        const basePrices = {
            'AAPL': 195, 'MSFT': 430, 'GOOGL': 175, 'AMZN': 185, 'TSLA': 245,
            'NVDA': 950, 'META': 385, 'NFLX': 485, 'JPM': 165, 'BAC': 38,
            'V': 285, 'MA': 450, 'JNJ': 165, 'UNH': 565, 'PG': 165,
            'HD': 385, 'WMT': 175, 'DIS': 115, 'KO': 62, 'PEP': 175,
            'NKE': 98, 'MCD': 295, 'COST': 785, 'SBUX': 108, 'BA': 185,
            'CAT': 385, 'XOM': 120, 'CVX': 165, 'SPY': 515, 'QQQ': 435
        };

        const basePrice = basePrices[symbol] || 100;
        // Smaller, more realistic daily changes
        const change = (Math.random() - 0.5) * 6; // -$3 to +$3
        const changePercent = (change / basePrice) * 100;

        return {
            symbol,
            price: Number((basePrice + change).toFixed(2)),
            change: Number(change.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2))
        };
    }

    generateMockStockData(stocks, tickerContent) {
        const tickerItems = stocks.map(symbol => {
            const basePrice = Math.random() * 500 + 50;
            const change = (Math.random() - 0.5) * 20;
            const percentChange = (change / basePrice) * 100;
            const isPositive = change >= 0;
            const sign = isPositive ? '+' : '';
            const cssClass = isPositive ? 'ticker-item' : 'ticker-item negative';

            return `<span class="${cssClass}">${symbol} $${basePrice.toFixed(2)} ${sign}${change.toFixed(2)} (${sign}${percentChange.toFixed(2)}%)</span>`;
        });

        const tickerItemsWithAds = this.insertSponsorAds(tickerItems);

        if (tickerContent) {
            const newContent = tickerItemsWithAds.join('');
            // Only update if content actually changed to avoid animation restart
            if (tickerContent.innerHTML !== newContent) {
                // Temporarily pause animation
                tickerContent.style.animationPlayState = 'paused';

                // Update content
                tickerContent.innerHTML = newContent;

                // Force reflow
                tickerContent.offsetHeight;

                // Resume animation
                tickerContent.style.animationPlayState = 'running';
            }
        }
    }

    insertSponsorAds(stockItems) {
        const sponsorAds = [
            '🚀 Lockheed Martin - Advancing Defense Technology',
            '⚡ Raytheon - Innovation in Aerospace & Defense',
            '🎯 Boeing - Connecting the World Through Aerospace',
            '🔮 Palantir - Data-Driven Intelligence Solutions',
            '🛡️ Department of Defense - Protecting Our Nation',
            '⭐ Northrop Grumman - Defining the Future of Defense',
            '🚬 Marlboro - The Taste of Freedom',
            '💨 Juul - Vapor Technology Innovation'
        ];

        const result = [];
        stockItems.forEach((item, index) => {
            result.push(item);

            // Insert sponsor ad after every 10 stocks
            if ((index + 1) % 10 === 0) {
                const randomAd = sponsorAds[Math.floor(Math.random() * sponsorAds.length)];
                result.push(`<span class="ticker-item sponsor-ad">${randomAd}</span>`);
            }
        });

        return result;
    }

    setupInfohubScrolling() {
        // Synchronized scrolling - infohub scrolls when user scrolls anywhere on page
        const infoColumn = document.querySelector('.info-column');
        if (!infoColumn) return;

        const videoContainer = document.querySelector('.hero-video-container');
        let overlay = null;
        let wheelEventListeners = [];

        if (videoContainer) {
            // Make sure the video container is relatively positioned
            if (getComputedStyle(videoContainer).position === 'static') {
                videoContainer.style.position = 'relative';
            }

            function createOverlay() {
                if (overlay) return; // Already exists

                // Create a transparent overlay over the video
                overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10;
                    pointer-events: auto;
                    background: transparent;
                `;
                overlay.className = 'video-scroll-overlay';

                videoContainer.appendChild(overlay);

                // Add wheel listener to the overlay
                const wheelHandler = (event) => {
                    event.preventDefault();

                    // Check if infohub has scrollable content
                    const infoScrollHeight = infoColumn.scrollHeight - infoColumn.clientHeight;
                    if (infoScrollHeight <= 0) return;

                    // Scroll the infohub
                    const scrollAmount = event.deltaY;
                    const currentScrollTop = infoColumn.scrollTop;
                    const newScrollTop = Math.max(0, Math.min(currentScrollTop + scrollAmount, infoScrollHeight));

                    infoColumn.scrollTop = newScrollTop;
                };

                overlay.addEventListener('wheel', wheelHandler, { passive: false });
                wheelEventListeners.push({ element: overlay, handler: wheelHandler });
            }

            function removeOverlay() {
                if (overlay) {
                    overlay.remove();
                    overlay = null;
                }
            }

            function updateOverlayVisibility() {
                const isMobile = window.innerWidth <= 768;

                if (isMobile) {
                    removeOverlay();
                } else {
                    createOverlay();
                }
            }

            // Initial setup
            updateOverlayVisibility();

            // Listen for window resize to toggle overlay
            window.addEventListener('resize', updateOverlayVisibility);
        }

        // Document wheel listener - also needs to be responsive
        let documentWheelHandler = null;

        function addDocumentWheelListener() {
            if (documentWheelHandler) return; // Already added

            documentWheelHandler = (event) => {
                const isOverInfohub = infoColumn.contains(event.target);
                const isOverVideo = videoContainer && videoContainer.contains(event.target);

                // Only handle if not over infohub (let infohub handle its own scrolling)
                if (!isOverInfohub && !isOverVideo) {
                    event.preventDefault();

                    const infoScrollHeight = infoColumn.scrollHeight - infoColumn.clientHeight;
                    if (infoScrollHeight > 0) {
                        const scrollAmount = event.deltaY;
                        const currentScrollTop = infoColumn.scrollTop;
                        const newScrollTop = Math.max(0, Math.min(currentScrollTop + scrollAmount, infoScrollHeight));
                        infoColumn.scrollTop = newScrollTop;
                    }
                }
            };

            document.addEventListener('wheel', documentWheelHandler, { passive: false });
        }

        function removeDocumentWheelListener() {
            if (documentWheelHandler) {
                document.removeEventListener('wheel', documentWheelHandler);
                documentWheelHandler = null;
            }
        }

        function updateDocumentWheelListener() {
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                removeDocumentWheelListener();
            } else {
                addDocumentWheelListener();
            }
        }

        // Initial setup
        updateDocumentWheelListener();

        // Listen for window resize to toggle document wheel listener
        window.addEventListener('resize', updateDocumentWheelListener);

        // Remove smooth scroll behavior for immediate response
        infoColumn.style.scrollBehavior = 'auto';
    }

    setupSponsorCarousel() {
        const sponsorsTrack = document.querySelector('.sponsors-track');
        if (!sponsorsTrack) return;

        // Ensure smooth animation by pausing and restarting when needed
        sponsorsTrack.addEventListener('animationiteration', () => {
            // Reset transform to prevent accumulating transforms
            sponsorsTrack.style.transform = 'translateX(0)';
        });

        // Add CSS to ensure smooth animation
        sponsorsTrack.style.willChange = 'transform';
        sponsorsTrack.style.backfaceVisibility = 'hidden';
        sponsorsTrack.style.perspective = '1000px';
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

// Service Worker registration removed to eliminate 404 errors
// Can be re-enabled when sw.js file is created

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