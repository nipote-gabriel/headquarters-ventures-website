// Headquarters Ventures — site behaviour

(function () {
    'use strict';

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    // ---------- Header ----------

    function setupHeader() {
        const header = $('.site-header');
        const toggle = $('.menu-toggle');
        if (!header) return;

        const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        if (toggle) {
            toggle.addEventListener('click', () => {
                const open = document.body.classList.toggle('menu-open');
                toggle.setAttribute('aria-expanded', String(open));
            });
            $$('.nav a').forEach((a) => a.addEventListener('click', () => {
                document.body.classList.remove('menu-open');
                toggle.setAttribute('aria-expanded', 'false');
            }));
        }
    }

    // ---------- Ventures data ----------

    let venturesPromise;
    function loadVentures() {
        if (!venturesPromise) {
            venturesPromise = fetch('/data/ventures.json')
                .then((r) => {
                    if (!r.ok) throw new Error(`HTTP ${r.status}`);
                    return r.json();
                })
                .then((d) => d.ventures || [])
                .catch((err) => {
                    console.warn('Could not load ventures:', err);
                    return [];
                });
        }
        return venturesPromise;
    }

    // "3.1M" / "410K" -> number
    function parseAudience(str) {
        const m = /^([\d.]+)\s*([KMB])?$/i.exec(String(str).trim());
        if (!m) return 0;
        const mult = { K: 1e3, M: 1e6, B: 1e9 }[(m[2] || '').toUpperCase()] || 1;
        return parseFloat(m[1]) * mult;
    }

    function formatAudience(n) {
        if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
        if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
        if (n >= 1e3) return `${Math.round(n / 1e3)}K`;
        return String(n);
    }

    function ventureCard(v) {
        const status = v.status && v.status !== 'Active'
            ? `<span class="tag-status">${escapeHtml(v.status)}</span>`
            : `<span>${escapeHtml(v.stage)}</span>`;
        return `
            <button class="venture" type="button" data-slug="${escapeHtml(v.slug)}" aria-haspopup="dialog">
                <div class="venture-cover" style="--c:${escapeHtml(v.color)}">
                    <div class="venture-badge"><span>${escapeHtml(v.category)}</span>${status}</div>
                    <div class="venture-cover-name">${escapeHtml(v.name)}</div>
                </div>
                <div class="venture-body">
                    <p>${escapeHtml(v.tagline)}</p>
                    <div class="venture-meta">
                        <span>${escapeHtml(v.handle)}</span>
                        <span>${escapeHtml(v.audience)} audience</span>
                        <span>Since ${escapeHtml(v.year)}</span>
                    </div>
                </div>
            </button>`;
    }

    // ---------- Venture dialog ----------

    function setupDialog(ventures) {
        let dialog = $('#venture-dialog');
        if (!dialog) {
            dialog = document.createElement('dialog');
            dialog.id = 'venture-dialog';
            dialog.className = 'venture-dialog';
            dialog.setAttribute('aria-labelledby', 'venture-dialog-title');
            document.body.appendChild(dialog);
        }

        const open = (slug) => {
            const v = ventures.find((x) => x.slug === slug);
            if (!v) return;
            dialog.innerHTML = `
                <div class="dialog-grid">
                    <div class="venture-cover" style="--c:${escapeHtml(v.color)}">
                        <div class="venture-badge"><span>${escapeHtml(v.category)}</span><span>${escapeHtml(v.stage)}</span></div>
                        <div class="venture-cover-name">${escapeHtml(v.name)}</div>
                    </div>
                    <div class="dialog-body">
                        <div class="eyebrow">${escapeHtml(v.handle)}</div>
                        <h2 class="display" id="venture-dialog-title">${escapeHtml(v.name)}</h2>
                        <p class="founder">${escapeHtml(v.founder)}</p>
                        <p class="lede">${escapeHtml(v.tagline)}</p>
                        <dl class="facts">
                            <div><dt>Stage</dt><dd>${escapeHtml(v.stage)}</dd></div>
                            <div><dt>Status</dt><dd>${escapeHtml(v.status)}</dd></div>
                            <div><dt>Audience</dt><dd>${escapeHtml(v.audience)}</dd></div>
                            <div><dt>Backed</dt><dd>${escapeHtml(v.year)}</dd></div>
                            <div style="grid-column:1/-1"><dt>Platforms</dt><dd>${escapeHtml((v.platforms || []).join(', '))}</dd></div>
                        </dl>
                        <h3>Why we backed it</h3>
                        <p>${escapeHtml(v.thesis)}</p>
                        <h3>What we do</h3>
                        <p>${escapeHtml(v.role)}</p>
                    </div>
                </div>
                <button class="dialog-close" type="button" aria-label="Close">&times;</button>`;
            $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
            if (typeof dialog.showModal === 'function') dialog.showModal();
            else dialog.setAttribute('open', '');
        };

        // click on backdrop closes
        dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

        document.addEventListener('click', (e) => {
            const card = e.target.closest('.venture[data-slug]');
            if (card) open(card.dataset.slug);
        });
    }

    // ---------- Home ----------

    async function setupHome() {
        const featured = $('#featured-ventures');
        const marquee = $('#venture-marquee');
        if (!featured && !marquee) return;

        const ventures = await loadVentures();
        if (!ventures.length) return;

        if (featured) {
            const picks = ventures.filter((v) => v.status === 'Active').slice(0, 6);
            featured.innerHTML = picks.map(ventureCard).join('');
        }

        if (marquee) {
            const names = ventures.map((v) => `<span>${escapeHtml(v.name)}</span>`).join('');
            // duplicated once so the -50% keyframe loops seamlessly
            marquee.innerHTML = names + names.replace(/<span>/g, '<span aria-hidden="true">');
        }

        fillStats(ventures);
        setupDialog(ventures);
    }

    function fillStats(ventures) {
        const total = ventures.reduce((sum, v) => sum + parseAudience(v.audience), 0);
        const exits = ventures.filter((v) => v.stage === 'Exited').length;
        const set = (key, val) => $$(`[data-stat="${key}"]`).forEach((el) => { el.textContent = val; });
        set('count', ventures.length);
        set('audience', formatAudience(total));
        set('exits', exits);
    }

    // ---------- Portfolio ----------

    async function setupPortfolio() {
        const grid = $('#portfolio-grid');
        if (!grid) return;

        const ventures = await loadVentures();
        const filtersEl = $('#portfolio-filters');
        const stageEl = $('#portfolio-stage');
        const countEl = $('#portfolio-count');

        if (!ventures.length) {
            grid.innerHTML = '<p class="empty">The portfolio is loading, or our money is. Try refreshing.</p>';
            return;
        }

        fillStats(ventures);

        const categories = [...new Set(ventures.map((v) => v.category))].sort();
        const stages = [...new Set(ventures.map((v) => v.stage))];
        const params = new URLSearchParams(location.search);
        let category = categories.includes(params.get('category')) ? params.get('category') : 'All';
        let stage = stages.includes(params.get('stage')) ? params.get('stage') : 'All';

        const countFor = (cat) => ventures.filter((v) => cat === 'All' || v.category === cat).length;

        filtersEl.innerHTML = ['All', ...categories].map((cat) => `
            <button class="chip" type="button" data-category="${escapeHtml(cat)}" aria-pressed="${cat === category}">
                ${escapeHtml(cat)}<span class="count">${countFor(cat)}</span>
            </button>`).join('');

        stageEl.innerHTML = ['All', ...stages].map((s) =>
            `<option value="${escapeHtml(s)}"${s === stage ? ' selected' : ''}>${s === 'All' ? 'All stages' : escapeHtml(s)}</option>`
        ).join('');

        const render = () => {
            const list = ventures.filter((v) =>
                (category === 'All' || v.category === category) &&
                (stage === 'All' || v.stage === stage));
            grid.innerHTML = list.length
                ? list.map(ventureCard).join('')
                : '<p class="empty">Nothing here yet. We\'re probably at a party looking for one.</p>';
            countEl.textContent = `${list.length} ${list.length === 1 ? 'venture' : 'ventures'}`;

            const q = new URLSearchParams();
            if (category !== 'All') q.set('category', category);
            if (stage !== 'All') q.set('stage', stage);
            history.replaceState(null, '', q.toString() ? `?${q}` : location.pathname);
        };

        filtersEl.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (!chip) return;
            category = chip.dataset.category;
            $$('.chip', filtersEl).forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
            render();
        });

        stageEl.addEventListener('change', () => { stage = stageEl.value; render(); });

        render();
        setupDialog(ventures);
    }

    // ---------- Reveal on scroll ----------

    function setupReveal() {
        if (!('IntersectionObserver' in window)) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const targets = $$('[data-reveal]');
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-in');
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px' });

        targets.forEach((el) => {
            // only hide things that start below the fold, so nothing flashes on load
            if (el.getBoundingClientRect().top > window.innerHeight) {
                el.classList.add('reveal');
                io.observe(el);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupHeader();
        setupHome();
        setupPortfolio();
        setupReveal();
        $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
    });
})();
