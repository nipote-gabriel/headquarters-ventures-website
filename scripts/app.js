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