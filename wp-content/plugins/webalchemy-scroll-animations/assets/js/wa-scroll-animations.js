(() => {
    'use strict';

    const settings = window.WA_SCROLL_ANIMATIONS_SETTINGS || {};
    const prefersReducedMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const featureEnabled = (key) =>
        (typeof settings[key] === 'undefined' ? true : !!settings[key]);
        
    function waIsDesktop() {
        return !window.matchMedia
            ? true
            : window.matchMedia('(min-width: 1024px)').matches;
    }
        
        // === Глобальный мягкий скролл (вне .wa-section) ===
    function initSoftScrollOnce() {
        if (prefersReducedMotion) return;

        // на тач-устройствах оставляем нативный скролл
        if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;

        if (window.__waSoftScrollInitialized) return;
        window.__waSoftScrollInitialized = true;

        function SoftScroll(options) {
            options = options || {};
            this.ease      = (typeof options.ease === 'number') ? options.ease : 0.08;
            this.current   = window.scrollY || window.pageYOffset || 0;
            this.target    = this.current;
            this.maxScroll = this._getMaxScroll();
            this.enabled   = false;
            this.isRunning = false;

            this._selfScroll     = false;
            this._onWheel        = this._onWheel.bind(this);
            this._onResize       = this._onResize.bind(this);
            this._onNativeScroll = this._onNativeScroll.bind(this);
            this._raf            = this._raf.bind(this);
        }

        SoftScroll.prototype._getMaxScroll = function () {
            var doc = document.documentElement;
            return Math.max(0, (doc.scrollHeight - window.innerHeight) || 0);
        };

        SoftScroll.prototype.enable = function () {
            if (this.enabled) return;
            this.enabled = true;

            this.current   = window.scrollY || window.pageYOffset || 0;
            this.target    = this.current;
            this.maxScroll = this._getMaxScroll();

            window.addEventListener('wheel', this._onWheel, { passive: false });
            window.addEventListener('resize', this._onResize);
            window.addEventListener('scroll', this._onNativeScroll, { passive: true });

            this._raf();
        };

        SoftScroll.prototype.disable = function () {
            if (!this.enabled) return;
            this.enabled = false;

            window.removeEventListener('wheel', this._onWheel);
            window.removeEventListener('resize', this._onResize);
            window.removeEventListener('scroll', this._onNativeScroll);
            this.isRunning = false;
        };

        SoftScroll.prototype._onResize = function () {
            this.maxScroll = this._getMaxScroll();
            if (this.target > this.maxScroll) {
                this.target = this.maxScroll;
            }
        };

        SoftScroll.prototype._onNativeScroll = function () {
            if (!this.enabled) return;

            // свои же scrollTo игнорируем
            if (this._selfScroll) {
                this._selfScroll = false;
                return;
            }

            // любое “чужое” изменение позиции — считаем новым базовым состоянием
            var y = window.pageYOffset || document.documentElement.scrollTop;
            this.current = y;
            this.target  = y;
        };

        SoftScroll.prototype._onWheel = function (e) {
            if (!this.enabled) return;
            if (prefersReducedMotion) return;

            // если уже кто-то (горизонтальные/стековые карточки или snap) забрал событие
            if (e.defaultPrevented) return;

            var t = e.target;

            if (t && t.closest) {
                // ⛔ не вмешиваемся в горизонтальные/стековые карточки — там свой wheel
                if (t.closest('.wa-hcards-wrapper')) return;
                if (t.closest('[data-wa-anim="horizontal-cards"]')) return;
                if (t.closest('[data-wa-anim="horizontal-stack"]')) return;
            }

            // синхронизация с реальной позицией перед новым движением
            var realY = window.pageYOffset || document.documentElement.scrollTop;
            this.current = realY;
            this.target  = realY;

            e.preventDefault();

            var delta = e.deltaY;
            if (typeof delta !== 'number') {
                delta = (e.wheelDelta ? -e.wheelDelta : 0);
            }

            this.target += delta;
            if (this.target < 0) this.target = 0;
            if (this.target > this.maxScroll) this.target = this.maxScroll;

            if (!this.isRunning) {
                this._raf();
            }
        };

        SoftScroll.prototype._raf = function () {
            if (!this.enabled) return;

            this.isRunning = true;

            this.current += (this.target - this.current) * this.ease;

            if (Math.abs(this.target - this.current) < 0.1) {
                this.current = this.target;
            }

            this._selfScroll = true;
            window.scrollTo(0, this.current);

            if (this.current !== this.target) {
                requestAnimationFrame(this._raf);
            } else {
                this.isRunning = false;
            }
        };

        var inst = new SoftScroll({ ease: 0.1 }); // поиграешься: 0.05 мягче, 0.12 жёстче
        inst.enable();

        window.WASoftScroll = inst; // вдруг пригодится в консоли
    }

    function initRevealChildren(root, targetClass) {
        if (!featureEnabled('enable_reveal_children') || prefersReducedMotion) return;
        if (!root) return;
    
        const selector = targetClass ? '.' + targetClass : null;
        const children = selector
            ? root.querySelectorAll(selector)
            : root.children;
    
        if (!children.length) return;
    
        // навешиваем класс и задержки
        let delay = 100;
        children.forEach(child => {
            child.classList.add('wa-anim-reveal-child');
            child.style.setProperty('--wa-anim-delay', delay + 'ms');
            delay += 100;
        });
    
        // фолбек: если нет IntersectionObserver — сразу показываем
        if (!('IntersectionObserver' in window)) {
            children.forEach(child => {
                child.classList.add('is-visible');
            });
            return;
        }
    
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
    
                const el = entry.target;
                el.classList.add('is-visible');
                obs.unobserve(el);
            });
        }, {
            root: null,
            threshold: 0.15,
            rootMargin: '0px 0px -10% 0px'
        });
    
        // наблюдаем КАЖДОГО ребёнка
        children.forEach(child => observer.observe(child));
    }

    function initSectionSnapOnce() {
        if ((!featureEnabled('enable_section_snap') || prefersReducedMotion)) return;
        //if (!window.matchMedia || !window.matchMedia('(min-width: 1024px)').matches) return;
        if (window.__waSectionSnapInitialized) return;
        window.__waSectionSnapInitialized = true;

        const sections = Array.from(document.querySelectorAll('.wa-section'));
        if (sections.length < 2) return;

        let isAnimating  = false;
        let currentIndex = 0;
        const EDGE_TOLERANCE = 50; // px — зона у края секции
        const SCROLL_DURATION = 700; // мс
        const SNAP_OFFSET = 50;

        const clampIndex = (i) => Math.max(0, Math.min(sections.length - 1, i));

        function smoothScrollTo(targetY, cb) {
            const startY = window.pageYOffset || document.documentElement.scrollTop;
        
            // хотим остановиться чуть выше секции
            const finalY = Math.max(0, targetY - SNAP_OFFSET);
            const distance = finalY - startY;
        
            const startTime = performance.now();
        
            function frame(now) {
                const t = Math.min(1, (now - startTime) / SCROLL_DURATION);
                const eased = 0.5 - Math.cos(t * Math.PI) / 2;
                window.scrollTo(0, startY + distance * eased);
        
                if (t < 1) {
                    requestAnimationFrame(frame);
                } else {
                    if (typeof cb === 'function') cb();
                }
            }
        
            requestAnimationFrame(frame);
        }


        const scrollToSection = (index) => {
            index = clampIndex(index);
            const target = sections[index];
            if (!target) return;

            currentIndex = index;
            isAnimating  = true;

            smoothScrollTo(target.offsetTop, () => {
                isAnimating = false;
            });
        };
        const isHorizontalCardsSection = (sec) => {
            if (!sec) return false;
            return (
                sec.getAttribute('data-wa-anim') === 'horizontal-cards' ||
                sec.classList.contains('wa-anim-horizontal-cards') || sec.getAttribute('data-wa-anim') === 'horizontal-stack'
            );
        };

        const updateCurrentIndex = () => {
            const rawY = window.pageYOffset || document.documentElement.scrollTop;
            const scrollY = rawY + SNAP_OFFSET; // логический "глаз" на 50px ниже
        
            let indexByRange = -1;
        
            for (let i = 0; i < sections.length; i++) {
                const sec    = sections[i];
                const top    = sec.offsetTop;
                const bottom = top + sec.offsetHeight;
        
                if (scrollY >= top && scrollY < bottom) {
                    indexByRange = i;
                    break;
                }
            }
        
            if (indexByRange !== -1) {
                currentIndex = indexByRange;
                return;
            }
        
            // запасной вариант — ближайшая секция
            let nearest = 0;
            let minDist = Infinity;
        
            sections.forEach((sec, i) => {
                const dist = Math.abs(sec.offsetTop - scrollY);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = i;
                }
            });
        
            currentIndex = nearest;
        };

        let rafId = null;
        window.addEventListener('scroll', () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(updateCurrentIndex);
        });

        const wheelHandler = (e) => {
            const delta = e.deltaY || e.wheelDelta || 0;

            // мелкие движения – не трогаем
            if (Math.abs(delta) < 60) return;

            const sec = sections[currentIndex];
            if (!sec) return;

            const vh = window.innerHeight || document.documentElement.clientHeight;

            // измеряем именно контент секции
            const measureEl = sec.querySelector('.wa-section__inner') || sec;
            const box = measureEl.getBoundingClientRect();
            const contentHeight = box.height;

            // если уже идёт анимация – блокируем нативный скролл
            if (isAnimating) {
                e.preventDefault();
                return;
            }

            // 🔼 ВВЕРХ — всегда обычный скролл (кроме случая выше)
            if (delta < 0) {
                return;
            }

            // 🔽 ВНИЗ

            // ЕСЛИ ЭТО СЕКЦИЯ С ГОРИЗОНТАЛЬНЫМИ КАРТОЧКАМИ —
            // НИЧЕГО НЕ ПЕРЕХВАТЫВАЕМ, ДАЁМ НАТИВНЫЙ СКРОЛЛ ДО СЛЕДУЮЩЕЙ СЕКЦИИ
            if (isHorizontalCardsSection(sec)) {
                return;
            }

            // ЕСЛИ ЭТО ПОСЛЕДНЯЯ СЕКЦІЯ — НИКАКОГО SNAP, ДАЁМ ДОЕХАТЬ ДО ФУТЕРА
            if (currentIndex === sections.length - 1) {
                return; // просто нативный скролл
            }

            // длинная секция – даём скроллить внутри,
            // пока нижний край контента далеко от низа окна
            if (contentHeight > vh + EDGE_TOLERANCE) {
                if (box.bottom > vh + EDGE_TOLERANCE) {
                    // ещё не дошли до конца – не вмешиваемся
                    return;
                }
                // мы уже почти у низа – можно перелистывать
            }

            // здесь либо секция короткая, либо мы почти у её низа
            e.preventDefault(); // блокируем обычный скролл

            // теперь точно есть следующая секция (мы проверили выше)
            scrollToSection(currentIndex + 1);
        };

        window.addEventListener('wheel', wheelHandler, { passive: false });

        // стартовое определение активной секции
        updateCurrentIndex();
    }

    function initSimpleFade(root, targetClass, direction) {
        if (!featureEnabled('enable_misc_effects') || prefersReducedMotion) return;

        const container = root.querySelector('.wa-section__inner') || root;
        const selector  = targetClass ? '.' + targetClass : null;
        const nodeList  = selector ? container.querySelectorAll(selector) : container.children;
        const items     = Array.prototype.slice.call(nodeList);

        if (!items.length) return;

        // нормализуем название класса по направлению
        const dirClass = (function (dir) {
            switch (dir) {
                case 'fade-up':    return 'wa-fade-up';
                case 'fade-down':  return 'wa-fade-down';
                case 'fade-left':  return 'wa-fade-left';
                case 'fade-right': return 'wa-fade-right';
                default:           return '';
            }
        })(direction);

        // помечаем элементы
        items.forEach(function (el) {
            el.classList.add('wa-fade-item');
            if (dirClass) {
                el.classList.add(dirClass);
            }
        });

        const io = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                root.classList.add('wa-fade-active');
                obs.unobserve(root);
            });
        }, { threshold: 0.3 });

        io.observe(root);
    }
    
    function initVerticalStackCardsMobile(root, targetClass) {
        if (typeof prefersReducedMotion !== 'undefined' && prefersReducedMotion) return;
        if (root.dataset.waVcardsInit === '1') return;
        root.dataset.waVcardsInit = '1';
    
        // Мобилка-only
        const isDesktop = (typeof waIsDesktop === 'function') ? waIsDesktop() : false;
        const isMobile  = !isDesktop;
    
        if (!isMobile) {
            root.style.display = 'none';
            return;
        }
    
        // -----------------------------
        // Параметры активации
        // -----------------------------
        const ACTIVATION_Y = 100;       // линия от верха, куда “ставим” блок при активации
        const VISIBILITY_RATIO = 0.7;   // сколько секции должно быть видно, чтобы включить режим
        const GRACE_MS = 600;           // защита от мгновенного повторного захвата после выхода
    
        // -----------------------------
        // Глобальное состояние
        // -----------------------------
        if (!window.__waVcards) {
            window.__waVcards = {
                sections: [],
                listenersAttached: false,
                activeSection: null,
                scrollRAF: 0,
                io: null
            };
        }
        const API = window.__waVcards;
    
        // -----------------------------
        // Подготовка DOM (inner -> track -> item -> card)
        // -----------------------------
        const container = root.querySelector('.wa-section__inner') || root;
        const selector  = targetClass ? '.' + targetClass : null;
        const nodeList  = selector ? container.querySelectorAll(selector) : container.children;
        const rawCards  = Array.prototype.slice.call(nodeList);
        if (!rawCards.length) return;
    
        const track = document.createElement('div');
        track.className = 'wa-hcards-track wa-vcards-track';
    
        rawCards.forEach((card, index) => {
            const item = document.createElement('div');
            item.className = 'wa-hcards-item wa-vcards-item';
            item.appendChild(card);
            track.appendChild(item);
    
            item.style.position = 'absolute';
            item.style.inset = '0';
            item.style.willChange = 'opacity, transform';
            item.style.transition = 'opacity 0.35s ease-out, transform 0.35s ease-out';
            item.style.zIndex = String(index + 1);
        });
    
        const inner = document.createElement('div');
        inner.className = 'wa-hcards-inner wa-vcards-inner';
        inner.style.position = 'relative';
    
        while (container.firstChild) container.removeChild(container.firstChild);
        inner.appendChild(track);
        container.appendChild(inner);
    
        root.classList.add('wa-vcards-wrapper');
    
        // Убираем внутренний скролл у обёрток (иначе будет “полоса справа”)
        root.style.overflow = 'hidden';
        container.style.overflow = 'hidden';
        inner.style.overflow = 'hidden';
        track.style.overflow = 'hidden';
    
        // -----------------------------
        // Секция: состояние
        // -----------------------------
        const section = {
            root,
            container,
            inner,
            track,
            items: Array.prototype.slice.call(track.children),
            currentIndex: 0,
            isActive: false,
            isCentering: false,
            lastUnlockTime: 0,
            snappedOnce: false,
    
            // swipe
            swipeStartX: 0,
            swipeStartY: 0,
            swipeStartTime: 0,
            swipeMoved: false,
        };
    
        function nowTs() {
            return (window.performance && performance.now) ? performance.now() : Date.now();
        }
    
        function getVH() {
            if (window.visualViewport && window.visualViewport.height) return window.visualViewport.height;
            return window.innerHeight || document.documentElement.clientHeight || 0;
        }
    
        // -----------------------------
        // Высота стека (absolute не задаёт высоту родителю)
        // -----------------------------
        function updateStackHeight() {
            let maxH = 0;
            section.items.forEach((item) => {
                const card = item.firstElementChild || item;
                const h = Math.ceil(card.scrollHeight || card.getBoundingClientRect().height || 0);
                if (h > maxH) maxH = h;
            });
    
            maxH = Math.max(240, maxH);
            inner.style.height = maxH + 'px';
            track.style.height = maxH + 'px';
        }
    
        updateStackHeight();
        requestAnimationFrame(updateStackHeight);
        window.addEventListener('load', updateStackHeight, { passive: true });
        window.addEventListener('resize', updateStackHeight, { passive: true });
        section.items.forEach((item) => {
            item.querySelectorAll('img').forEach((img) => {
                if (img.complete) return;
                img.addEventListener('load', updateStackHeight, { passive: true });
            });
        });
    
        // -----------------------------
        // Показ карточки
        // -----------------------------
        function showCard(idx) {
            const count = section.items.length;
            idx = Math.max(0, Math.min(count - 1, idx));
    
            section.items.forEach((item, i) => {
                if (i === idx) {
                    item.style.opacity = '1';
                    item.style.transform = 'translate3d(0,0,0)';
                    item.style.pointerEvents = 'auto';
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translate3d(0, 20px, 0)';
                    item.style.pointerEvents = 'none';
                }
            });
    
            section.currentIndex = idx;
        }
        showCard(0);
    
        // -----------------------------
        // iOS-safe scroll lock: body fixed
        // -----------------------------
        function lockScroll() {
            const y = window.pageYOffset || document.documentElement.scrollTop || 0;
            document.body.dataset.waLockY = String(y);
    
            document.body.style.position = 'fixed';
            document.body.style.top = (-y) + 'px';
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.width = '100%';
        }
    
        function unlockScroll() {
            const y = parseInt(document.body.dataset.waLockY || '0', 10) || 0;
    
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.width = '';
            delete document.body.dataset.waLockY;
    
            window.scrollTo(0, y);
        }
    
        // -----------------------------
        // Центрирование секции (ставим верх секции на ACTIVATION_Y)
        // -----------------------------
        function snapSectionToLine(cb) {
            const rect = root.getBoundingClientRect();
            const doc  = document.documentElement;
            const startY = window.pageYOffset || doc.scrollTop;
    
            // хотим, чтобы rect.top стал == ACTIVATION_Y
            const targetY = Math.max(0, Math.round(startY + (rect.top - ACTIVATION_Y)));
    
            if (Math.abs(targetY - startY) < 2) {
                cb && cb();
                return;
            }
    
            const duration = 420;
            const startTime = performance.now();
            section.isCentering = true;
    
            function step(tNow) {
                const t = Math.min(1, (tNow - startTime) / duration);
                const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                window.scrollTo(0, startY + (targetY - startY) * eased);
    
                if (t < 1) requestAnimationFrame(step);
                else {
                    section.isCentering = false;
                    cb && cb();
                }
            }
            requestAnimationFrame(step);
        }
    
        // -----------------------------
        // Условия активации (надёжно)
        // -----------------------------
        function visibleRatio() {
            const rect = root.getBoundingClientRect();
            const vh = getVH();
    
            const top = Math.max(0, rect.top);
            const bottom = Math.min(vh, rect.bottom);
            const visible = Math.max(0, bottom - top);
            const h = Math.max(1, rect.height);
    
            return visible / h;
        }
    
        function shouldActivateNow() {
            const rect = root.getBoundingClientRect();
            const vh = getVH();
    
            // хоть немного в кадре
            if (rect.bottom <= 0 || rect.top >= vh) return false;
    
            // либо секция “в основном видна”
            if (visibleRatio() >= VISIBILITY_RATIO) return true;
    
            // либо верх секции пересёк нашу линию активации (на случай быстрого скролла)
            if (rect.top <= ACTIVATION_Y && rect.bottom > ACTIVATION_Y) return true;
    
            return false;
        }
    
        // -----------------------------
        // Активация/деактивация
        // -----------------------------
        function activate(fromExternalScroll) {
            if (section.isActive) return;
    
            const t = nowTs();
            if (section.lastUnlockTime && (t - section.lastUnlockTime < GRACE_MS)) return;
    
            section.isActive = true;
            API.activeSection = section;
    
            // Всегда снапаем к линии и только потом лочим
            snapSectionToLine(() => {
                lockScroll();
            });
        }
    
        function deactivate() {
            if (!section.isActive) return;
    
            section.isActive = false;
            section.lastUnlockTime = nowTs();
    
            if (API.activeSection === section) API.activeSection = null;
            unlockScroll();
        }
    
        // -----------------------------
        // Свайпы (длинный вертикальный)
        // -----------------------------
        const SWIPE_MIN_DISTANCE = 90;
        const SWIPE_MAX_TIME = 1400;
        const SWIPE_DIR_RATIO = 1.25;
    
        section._touchStart = function(e) {
            if (!section.isActive) return;
            if (e.touches.length !== 1) return;
    
            const touch = e.touches[0];
            section.swipeStartX = touch.clientX;
            section.swipeStartY = touch.clientY;
            section.swipeStartTime = nowTs();
            section.swipeMoved = false;
    
            if (e.cancelable) e.preventDefault();
        };
    
        section._touchMove = function(e) {
            if (!section.isActive) return;
            if (e.touches.length !== 1) return;
    
            const touch = e.touches[0];
            const dx = touch.clientX - section.swipeStartX;
            const dy = touch.clientY - section.swipeStartY;
    
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) section.swipeMoved = true;
    
            if (e.cancelable) e.preventDefault();
        };
    
        section._touchEnd = function(e) {
            if (!section.isActive) return;
    
            const dt = nowTs() - section.swipeStartTime;
            if (!section.swipeMoved || dt > SWIPE_MAX_TIME) return;
    
            const touch = (e.changedTouches && e.changedTouches[0]) || null;
            if (!touch) return;
    
            const dx = touch.clientX - section.swipeStartX;
            const dy = touch.clientY - section.swipeStartY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
    
            if (absDy < SWIPE_MIN_DISTANCE) return;
            if (absDy < absDx * SWIPE_DIR_RATIO) return;
    
            if (dy < 0) {
                const next = section.currentIndex + 1;
                if (next < section.items.length) showCard(next);
                else deactivate(); // за последнюю — отдаём скролл
            } else {
                const prev = section.currentIndex - 1;
                if (prev >= 0) showCard(prev);
                else deactivate(); // выше первой — отдаём скролл
            }
    
            if (e.cancelable) e.preventDefault();
        };
    
        // -----------------------------
        // Регистрация секции + глобальные слушатели
        // -----------------------------
        API.sections.push(section);
    
        section._onScrollHook = function() {
            if (section.isCentering || section.isActive) return;
    
            // “жёсткий” захват даже при инерции
            if (shouldActivateNow()) {
                // можно липнуть много раз, но не сразу после выхода
                activate(true);
            }
        };
    
        if (!API.listenersAttached) {
            API.listenersAttached = true;
    
            document.addEventListener('touchstart', function(e) {
                const s = API.activeSection;
                if (!s) return;
                s._touchStart(e);
            }, { passive: false, capture: true });
    
            document.addEventListener('touchmove', function(e) {
                const s = API.activeSection;
                if (!s) return;
                s._touchMove(e);
            }, { passive: false, capture: true });
    
            document.addEventListener('touchend', function(e) {
                const s = API.activeSection;
                if (!s) return;
                s._touchEnd(e);
            }, { passive: false, capture: true });
    
            // scroll (через rAF)
            document.addEventListener('scroll', function() {
                if (API.scrollRAF) return;
                API.scrollRAF = requestAnimationFrame(() => {
                    API.scrollRAF = 0;
                    API.sections.forEach(s => {
                        if (typeof s._onScrollHook === 'function') s._onScrollHook();
                    });
                });
            }, { passive: true });
    
            // IntersectionObserver (ловит даже “сверх-флики” лучше, чем scroll)
            if ('IntersectionObserver' in window) {
                API.io = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        const s = entry.target.__waVcardsSection;
                        if (!s || s.isActive || s.isCentering) return;
    
                        // Когда сильно видно — активируем
                        if (entry.isIntersecting && entry.intersectionRatio >= VISIBILITY_RATIO) {
                            activate(true);
                        }
                    });
                }, { threshold: [0, 0.25, 0.5, 0.7, 0.85, 1] });
            }
        }
    
        // подписываемся в IO (если есть)
        if (API.io) {
            root.__waVcardsSection = section;
            API.io.observe(root);
        }
    
        // И сразу проверяем на стартовой позиции
        if (shouldActivateNow()) {
            activate(true);
        }
    }

    function initHorizontalCards(root, targetClass) {
        if (!featureEnabled('enable_horizontal_cards') || prefersReducedMotion) return;
        if (root.dataset.waHorizontalInit === '1') return;
        root.dataset.waHorizontalInit = '1';
    
        const isDesktop = (typeof waIsDesktop === 'function') ? waIsDesktop() : true;
    
        const container = root.querySelector('.wa-section__inner') || root;
    
        const selector  = targetClass ? '.' + targetClass : null;
        const nodeList  = selector ? container.querySelectorAll(selector) : container.children;
        const cards     = Array.prototype.slice.call(nodeList);
        if (!cards.length) return;
    
        // Оборачиваем карточки
        const track = document.createElement('div');
        track.className = 'wa-hcards-track';
    
        cards.forEach(card => {
            const item = document.createElement('div');
            item.className = 'wa-hcards-item';
            item.appendChild(card);
            track.appendChild(item);
        });
    
        const inner = document.createElement('div');
        inner.className = 'wa-hcards-inner';
        inner.appendChild(track);
    
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        container.appendChild(inner);
    
        root.classList.add('wa-hcards-wrapper');
        if (!isDesktop) {
            root.classList.add('wa-hcards-wrapper--slider');
        }
    
        function isInViewport() {
            const rect = root.getBoundingClientRect();
            const vh   = window.innerHeight || document.documentElement.clientHeight;
            return rect.bottom > 0 && rect.top < vh;
        }
    
        function centerSection() {
            const vh   = window.innerHeight || document.documentElement.clientHeight;
            const rect = root.getBoundingClientRect();
            const targetTop = window.scrollY + rect.top - (vh - rect.height) / 2;
            window.scrollTo({ top: targetTop, behavior: 'auto' });
        }
    
        // ========================================================================
        // DESKTOP
        // ========================================================================
        if (isDesktop) {
            let hPos = 0;          // 0..1
            let displayPos = 0;
            let maxTranslate = 0;
            const wheelSpeed = 0.00015;
            const easeFactor = 0.12;
    
            let rafIdTrack = null;
            let sectionCenteredDesktop = false;
    
            function animateTrack() {
                rafIdTrack = null;
                displayPos += (hPos - displayPos) * easeFactor;
                const p  = Math.max(0, Math.min(1, displayPos));
                const tx = -maxTranslate * p;
                track.style.transform = 'translate3d(' + tx + 'px, 0, 0)';
    
                if (Math.abs(hPos - displayPos) > 0.001) {
                    rafIdTrack = requestAnimationFrame(animateTrack);
                }
            }
    
            function applyTransform() {
                if (!rafIdTrack) {
                    rafIdTrack = requestAnimationFrame(animateTrack);
                }
            }
    
            // const recalcDesktop = () => {
            //     Array.prototype.forEach.call(track.children, it => {
            //         it.style.width = '';
            //         it.style.flex  = '0 0 auto';
            //     });
    
            //     const hostWidth  = container.clientWidth || root.clientWidth;
            //     maxTranslate     = Math.max(0, track.scrollWidth - hostWidth);
    
            //     applyTransform();
            // };
            
            const recalcDesktop = () => {
                const hostWidth  = container.clientWidth || root.clientWidth;
                const visibleFraction = 0.8; // 0.8 = 80% ширины контейнера, видно часть следующей карты
                const itemWidth = hostWidth * visibleFraction;
            
                Array.prototype.forEach.call(track.children, it => {
                    it.style.flex  = '0 0 ' + itemWidth + 'px';
                    it.style.width = itemWidth + 'px';
                });
            
                // после обновления ширин пересчитываем максимально возможный сдвиг
                maxTranslate = Math.max(0, track.scrollWidth - hostWidth);
            
                applyTransform();
            };

    
            recalcDesktop();
            window.addEventListener('resize', recalcDesktop);
    
            function handleDesktopDelta(delta, e) {
                if (prefersReducedMotion) return false;
                if (!maxTranslate) return false;
                if (!isInViewport()) return false;
                if (!delta) return false;
    
                // При первом входе в горизонтальный режим — центрируем секцию
                if (!sectionCenteredDesktop) {
                    centerSection();
                    sectionCenteredDesktop = true;
                }
    
                const atFirst = (hPos <= 0.0001);
                const atLast  = (hPos >= 0.9999);
                const movingForward = delta > 0; // вниз
                const movingBack    = delta < 0; // вверх
    
                let newPos = hPos + delta * wheelSpeed;
                if (newPos < 0) newPos = 0;
                if (newPos > 1) newPos = 1;
    
                // если уже на краю и тянем дальше "наружу" — отдаём событие странице
                if ((movingForward && atLast  && newPos >= 1) ||
                    (movingBack    && atFirst && newPos <= 0)) {
                    hPos = newPos;
                    applyTransform();
                    return false;
                }
    
                hPos = newPos;
    
                if (e && e.cancelable && typeof e.preventDefault === 'function') {
                    e.preventDefault();
                }
                applyTransform();
                return true;
            }
    
            function onWheel(e) {
                const delta = e.deltaY || e.deltaX || 0;
                handleDesktopDelta(delta, e);
            }
    
            // На десктопе достаточно слушать колесо на самой секции
            root.addEventListener('wheel', onWheel, { passive: false });
    
            let touchStartY = null;
    
            root.addEventListener('touchstart', e => {
                if (e.touches.length !== 1) return;
                touchStartY = e.touches[0].clientY;
            }, { passive: true });
    
            root.addEventListener('touchmove', e => {
                if (touchStartY == null) return;
                const y = e.touches[0].clientY;
                const deltaY = touchStartY - y;
                touchStartY = y;
    
                handleDesktopDelta(deltaY * 0.7, e);
            }, { passive: false });
    
            root.addEventListener('touchend', () => {
                touchStartY = null;
            });
    
            return;
        }
    
        // ========================================================================
        // MOBILE / TOUCH
        // ========================================================================
        let slideWidth   = 0;
        let currentIndex = 0;
        let displayIndex = 0;
        const maxIndex   = cards.length - 1;
    
        let rafId        = null;
        let deltaAccum   = 0;
        let gestureLocked = false;
    
        let sectionCenteredMobile = false; // секция центрирована по вьюпорту
        let sliderActive          = false; // горизонтальный режим активен
        let sliderUnlocked        = false; // после 2 сек на краю — больше не перехватываем
        let unlockTimer           = null;
    
        const originalTouchAction = root.style.touchAction || '';
        const SLIDE_THRESHOLD     = 110;
        const UNLOCK_DELAY_MS     = 2000;
    
        function applyMobileTransform() {
            rafId = null;
            displayIndex += (currentIndex - displayIndex) * 0.12;
            const tx = -slideWidth * displayIndex;
            track.style.transform = 'translate3d(' + tx + 'px, 0, 0)';
    
            if (Math.abs(currentIndex - displayIndex) > 0.001) {
                rafId = requestAnimationFrame(applyMobileTransform);
            }
        }
    
        function startUnlockTimerIfEdge() {
            const atEdge = (currentIndex === 0 || currentIndex === maxIndex);
            if (!atEdge) {
                if (unlockTimer) {
                    clearTimeout(unlockTimer);
                    unlockTimer = null;
                }
                return;
            }
    
            if (unlockTimer || sliderUnlocked) return;
    
            unlockTimer = setTimeout(() => {
                sliderUnlocked        = true;
                sliderActive          = false;
                sectionCenteredMobile = false;
                unlockTimer           = null;
                root.style.touchAction = originalTouchAction;
            }, UNLOCK_DELAY_MS);
        }
    
        function setIndex(idx) {
            const clamped = Math.max(0, Math.min(maxIndex, idx));
            if (clamped === currentIndex) return;
            currentIndex = clamped;
            startUnlockTimerIfEdge();
            if (!rafId) {
                rafId = requestAnimationFrame(applyMobileTransform);
            }
        }
    
        const recalcMobile = () => {
            const hostWidth = container.clientWidth || root.clientWidth || window.innerWidth || 320;
            slideWidth      = hostWidth;
    
            Array.prototype.forEach.call(track.children, it => {
                it.style.width = slideWidth + 'px';
                it.style.flex  = '0 0 ' + slideWidth + 'px';
            });
    
            track.style.width = (slideWidth * cards.length) + 'px';
    
            const tx = -slideWidth * currentIndex;
            track.style.transform = 'translate3d(' + tx + 'px, 0, 0)';
            displayIndex = currentIndex;
        };
    
        recalcMobile();
        window.addEventListener('resize', recalcMobile);
    
        function handleTouchDelta(delta, e) {
            if (!delta) return;
            if (!isInViewport()) return;
            if (sliderUnlocked) return; // больше не перехватываем — секцию уже "прошли"
    
            // при первой активации горизонтального режима — центрируем секцию
            if (!sectionCenteredMobile) {
                centerSection();
                sectionCenteredMobile = true;
                // следующий delta уже пойдёт в горизонталь
                deltaAccum   = 0;
                gestureLocked = false;
                return;
            }
    
            if (!sliderActive) {
                sliderActive = true;
                root.style.touchAction = 'none';
            }
    
            if (e && e.cancelable && typeof e.preventDefault === 'function') {
                e.preventDefault();
            }
    
            const atFirst = (currentIndex === 0);
            const atLast  = (currentIndex === maxIndex);
    
            if (gestureLocked) {
                // карточка уже перелистнута в рамках этого жеста — просто блокируем вертикаль
                return;
            }
    
            deltaAccum += delta;
            const abs = Math.abs(deltaAccum);
    
            if (abs >= SLIDE_THRESHOLD) {
                if (deltaAccum > 0 && !atLast) {
                    setIndex(currentIndex + 1);
                    gestureLocked = true;
                } else if (deltaAccum < 0 && !atFirst) {
                    setIndex(currentIndex - 1);
                    gestureLocked = true;
                } else {
                    // уже на краю и пытаемся тянуть дальше — таймер уже поставится
                    startUnlockTimerIfEdge();
                }
                deltaAccum = 0;
            }
        }
    
        function onWheel(e) {
            if (prefersReducedMotion) return;
            const delta = e.deltaY || e.deltaX || 0;
            handleTouchDelta(delta, e);
        }
    
        // На мобильных тачпадах колесо тоже может прилетать
        root.addEventListener('wheel', onWheel, { passive: false });
    
        let lastY = null;
    
        root.addEventListener('touchstart', e => {
            if (e.touches.length !== 1) return;
    
            lastY         = e.touches[0].clientY;
            deltaAccum    = 0;
            gestureLocked = false;
    
            // если уже разблокировали — ведём себя как обычная секция
            root.style.touchAction = sliderUnlocked ? originalTouchAction : 'auto';
        }, { passive: true });
    
        root.addEventListener('touchmove', e => {
            if (prefersReducedMotion) return;
            if (lastY == null) return;
    
            const y = e.touches[0].clientY;
            const delta = lastY - y;
            lastY = y;
    
            handleTouchDelta(delta, e);
    
            if (sliderActive && !sliderUnlocked) {
                root.style.touchAction = 'none';
            }
        }, { passive: false });
    
        root.addEventListener('touchend', () => {
            lastY         = null;
            deltaAccum    = 0;
            gestureLocked = false;
    
            if (sliderUnlocked) {
                root.style.touchAction = originalTouchAction;
            } else if (sliderActive) {
                // остаёмся в горизонтальном режиме до разблокировки
                root.style.touchAction = 'none';
            } else {
                root.style.touchAction = originalTouchAction;
            }
        });
    }
    
    // Попытка 3
    
    function initHorizontalStackCards(root, targetClass) {
        if (!featureEnabled('enable_horizontal_cards') || prefersReducedMotion) return;
        if (root.dataset.waHorizontalStackInit === '1') return;
        root.dataset.waHorizontalStackInit = '1';
    
        const isDesktop = (typeof waIsDesktop === 'function') ? waIsDesktop() : true;
    
        // -----------------------------------------------------------------
        // Глобальное состояние
        // -----------------------------------------------------------------
        if (!window.__waHcards) {
            window.__waHcards = {
                sections: [],
                listenersAttached: false,
                touchY: null
            };
        }
        const API = window.__waHcards;
    
        // -----------------------------------------------------------------
        // Подготовка DOM
        // -----------------------------------------------------------------
        const container = root.querySelector('.wa-section__inner') || root;
    
        const selector = targetClass ? '.' + targetClass : null;
        const nodeList = selector ? container.querySelectorAll(selector) : container.children;
        const cards = Array.prototype.slice.call(nodeList);
        if (!cards.length) return;
    
        const track = document.createElement('div');
        track.className = 'wa-hcards-track';
    
        cards.forEach((card, index) => {
            const item = document.createElement('div');
            item.className = 'wa-hcards-item';
            item.appendChild(card);
            track.appendChild(item);
    
            card.style.position = card.style.position || 'relative';
            card.style.willChange = 'transform, opacity';
            card.style.zIndex = 100 + index;
            card.style.opacity = card.style.opacity || '1';
        });
    
        const inner = document.createElement('div');
        inner.className = 'wa-hcards-inner';
        inner.appendChild(track);
    
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        container.appendChild(inner);
    
        root.classList.add('wa-hcards-wrapper');
        if (!isDesktop) {
            root.classList.add('wa-hcards-wrapper--stack');
        }
    
        // -----------------------------------------------------------------
        // Секция
        // -----------------------------------------------------------------
        const section = {
            root,
            cards,
            isDesktop,
            baseOffsets: [],
            segmentDistances: [],
            progress: 0,
            targetProgress: 0,
            rafId: null,
            isHorizontalActive: false,
            unlockTimer: null,
            lastUnlockTime: 0,
            lastStepTime: 0,                               // время последнего шага
            minStepInterval: isDesktop ? 70 : 90,          // минимальный интервал между шагами, мс
            progressStep: isDesktop ? 0.055 : 0.038        // маленький шаг прогресса
        };

    
        function clamp01(v) {
            return v < 0 ? 0 : (v > 1 ? 1 : v);
        }
    
        function getViewportHeight() {
            if (window.visualViewport && window.visualViewport.height) {
                return window.visualViewport.height;
            }
            return window.innerHeight || document.documentElement.clientHeight || 0;
        }
    
        section.applyStack = function(p) {
            p = clamp01(p);
            const cards = section.cards;
            const segmentDistances = section.segmentDistances;
            if (!segmentDistances.length) return;
    
            const overlap = section.isDesktop ? 0.2 : 0;
            const phases = segmentDistances.length;
            const t = p * phases;
    
            cards.forEach((card, i) => {
                if (i === 0) {
                    card.style.transform = 'translate3d(0,0,0)';
                } else {
                    let totalShift = 0;
                    for (let k = 0; k < i && k < segmentDistances.length; k++) {
                        let x = t - k;
                        let a = x <= 0 ? 0 : (x >= 1 ? 1 : x);
                        const d = segmentDistances[k] * (1 - overlap) * a;
                        totalShift += d;
                    }
                    card.style.transform = 'translate3d(' + (-totalShift) + 'px, 0, 0)';
                }
    
                let opacity = 1;
                if (i < cards.length - 1) {
                    // Каждая карточка исчезает, только когда появляется следующая после следующей
                    // (i -> скрывается при появлении i+2).
                    const startSegment = Math.min(i + 1, phases - 1);
                    const x = t - startSegment;

                    if (x <= 0) {
                        opacity = 1;
                    } else if (x >= 1) {
                        opacity = 0;
                    } else {
                        opacity = 1 - x;
                    }
                }
                card.style.opacity = opacity;
            });
        };
    
        section.recalcOffsets = function() {
            const cards = section.cards;
            if (!cards.length) return;
    
            cards.forEach(card => {
                card.style.transform = 'translate3d(0,0,0)';
            });
    
            const firstRect = cards[0].getBoundingClientRect();
            const firstCenter = firstRect.left + firstRect.width / 2;
    
            section.baseOffsets = cards.map(card => {
                const r = card.getBoundingClientRect();
                const c = r.left + r.width / 2;
                return c - firstCenter;
            });
    
            section.segmentDistances = [];
            for (let i = 0; i < section.baseOffsets.length - 1; i++) {
                section.segmentDistances[i] = section.baseOffsets[i + 1] - section.baseOffsets[i];
            }
    
            section.applyStack(section.progress);
        };
    
        section.animate = function() {
            section.rafId = null;
            const diff = section.targetProgress - section.progress;
            if (Math.abs(diff) < 0.001) {
                section.progress = section.targetProgress;
                section.applyStack(section.progress);
                return;
            }
            section.progress += diff * 0.08;
            section.applyStack(section.progress);
            section.rafId = requestAnimationFrame(section.animate);
        };
    
        section.setTargetProgress = function(step) {
            const prevTarget = section.targetProgress;
            section.targetProgress = clamp01(section.targetProgress + step);
            if (section.targetProgress === prevTarget) {
                return { changed: false, prevTarget, newTarget: section.targetProgress };
            }
            if (!section.rafId) {
                section.rafId = requestAnimationFrame(section.animate);
            }
            return { changed: true, prevTarget, newTarget: section.targetProgress };
        };
    
        section.cancelUnlockTimer = function() {
            if (!section.unlockTimer) return;
            clearTimeout(section.unlockTimer);
            section.unlockTimer = null;
        };
    
        section.scheduleUnlock = function() {
            if (!section.isHorizontalActive) return;
            if (section.unlockTimer) return;
    
            section.unlockTimer = setTimeout(() => {
                section.unlockTimer = null;
                section.isHorizontalActive = false;
                section.root.classList.remove('wa-hcards-wrapper--active');
                section.lastUnlockTime = (window.performance && performance.now) ? performance.now() : Date.now();
            }, 1000); // 1 сек после упора в край
        };
    
        section.handleDelta = function(rawDelta) {
            if (!rawDelta) return;
        
            const now = (window.performance && performance.now) ? performance.now() : Date.now();
        
            // ограничиваем частоту шагов: не чаще, чем раз в minStepInterval мс
            if (section.lastStepTime && (now - section.lastStepTime) < section.minStepInterval) {
                return;
            }
            section.lastStepTime = now;
        
            const dir = rawDelta > 0 ? 1 : -1;
        
            if (!section.isHorizontalActive) {
                section.isHorizontalActive = true;
                section.root.classList.add('wa-hcards-wrapper--active');
                section.cancelUnlockTimer();
            }
        
            const res = section.setTargetProgress(dir * section.progressStep);
            const changed    = res.changed;
            const prevTarget = res.prevTarget;
            const newTarget  = res.newTarget;
        
            const wasMiddle = prevTarget > 0 && prevTarget < 1;
            const isMiddle  = newTarget > 0 && newTarget < 1;
        
            if (!changed) {
                section.scheduleUnlock();
                return;
            }
        
            if (isMiddle || wasMiddle) {
                section.cancelUnlockTimer();
            }
        
            if (section.isHorizontalActive && (newTarget === 0 || newTarget === 1)) {
                section.scheduleUnlock();
            } else {
                section.cancelUnlockTimer();
            }
        };
    
        API.sections.push(section);
    
        // -----------------------------------------------------------------
        // Поиск активной секции
        // -----------------------------------------------------------------
        function findActiveSection() {
            const sections = API.sections;
            if (!sections.length) return null;
    
            const vh = getViewportHeight();
            const now = (window.performance && performance.now) ? performance.now() : Date.now();
    
            const ACTIVATION_Y   = 50; // линия активации (100px от верха)
            const ACTIVATION_ZONE = 10; // допуск по топу
    
            let best = null;
            let bestDist = Infinity;
    
            for (let i = 0; i < sections.length; i++) {
                const s = sections[i];
                const rect = s.root.getBoundingClientRect();
    
                // хоть немного виден
                if (rect.bottom <= 0 || rect.top >= vh) continue;
    
                const inGrace =
                    !s.isHorizontalActive &&
                    s.lastUnlockTime &&
                    (now - s.lastUnlockTime < 700);
    
                if (inGrace) continue;
    
                // если секция уже в горизонтальном режиме — она приоритетная
                if (s.isHorizontalActive) {
                    return s;
                }
    
                // логика в обе стороны: при скролле сверху вниз и снизу вверх
                // считаем, что секция "в зоне", когда её верх около 100px от верха
                const distTop = Math.abs(rect.top - ACTIVATION_Y);
                if (distTop > ACTIVATION_ZONE) continue; // если уже сильно ушла вверх/вниз — не трогаем
    
                if (distTop < bestDist) {
                    bestDist = distTop;
                    best = s;
                }
            }
    
            return best;
        }
    
        // -----------------------------------------------------------------
        // Глобальные слушатели
        // -----------------------------------------------------------------
        if (!API.listenersAttached) {
            API.listenersAttached = true;
    
            // WHEEL
            document.addEventListener('wheel', function(e) {
                if (prefersReducedMotion) return;
    
                const deltaY = e.deltaY || e.wheelDelta || e.detail || 0;
                if (Math.abs(deltaY) < 1) return;
    
                const sec = findActiveSection();
                if (!sec) return;
    
                // Сначала режем вертикальную прокрутку,
                // чтобы не было "чуть вертикально, чуть горизонтально"
                if (e.cancelable) {
                    e.preventDefault();
                }
    
                sec.handleDelta(deltaY);
            }, { passive: false, capture: true });
    
            // TOUCH
            document.addEventListener('touchstart', function(e) {
                if (e.touches.length !== 1) return;
                API.touchY = e.touches[0].clientY;
            }, { passive: true, capture: true });
    
            document.addEventListener('touchmove', function(e) {
                if (prefersReducedMotion) return;
                if (API.touchY == null) return;
    
                const y = e.touches[0].clientY;
                const deltaY = API.touchY - y;
    
                if (Math.abs(deltaY) < 2) return; // отсечь микрошум
                API.touchY = y;
    
                const sec = findActiveSection();
                if (!sec) return;
    
                // Жёстко режем вертикальный скролл, если секция решила "съесть" жест
                if (e.cancelable) {
                    e.preventDefault();
                }
    
                sec.handleDelta(deltaY);
            }, { passive: false, capture: true });
    
            document.addEventListener('touchend', function() {
                API.touchY = null;
            }, { passive: true, capture: true });
        }
    
        // -----------------------------------------------------------------
        // Старт
        // -----------------------------------------------------------------
        section.recalcOffsets();
        window.addEventListener('resize', section.recalcOffsets, { passive: true });
    }

    // Попытка к скроллу привязать
    // function initHorizontalStackCards(root, targetClass) {
    //     if (!featureEnabled('enable_horizontal_cards') || prefersReducedMotion) return;
    //     if (root.dataset.waHorizontalStackInit === '1') return;
    //     root.dataset.waHorizontalStackInit = '1';
    
    //     const isDesktop = (typeof waIsDesktop === 'function') ? waIsDesktop() : true;
    
    //     const container = root.querySelector('.wa-section__inner') || root;
    
    //     // карточки
    //     const selector  = targetClass ? '.' + targetClass : null;
    //     const nodeList  = selector ? container.querySelectorAll(selector) : container.children;
    //     const cards     = Array.prototype.slice.call(nodeList);
    //     if (!cards.length) return;
    
    //     // трек + inner
    //     const track = document.createElement('div');
    //     track.className = 'wa-hcards-track';
    
    //     cards.forEach((card, index) => {
    //         const item = document.createElement('div');
    //         item.className = 'wa-hcards-item';
    //         item.appendChild(card);
    //         track.appendChild(item);
    
    //         card.style.position   = card.style.position || 'relative';
    //         card.style.willChange = 'transform, opacity';
    //         card.style.zIndex     = 100 + index; // правая карта выше левой
    //         card.style.opacity    = card.style.opacity || '1';
    //     });
    
    //     const inner = document.createElement('div');
    //     inner.className = 'wa-hcards-inner';
    //     inner.appendChild(track);
    
    //     while (container.firstChild) {
    //         container.removeChild(container.firstChild);
    //     }
    //     container.appendChild(inner);
    
    //     root.classList.add('wa-hcards-wrapper');
    //     if (!isDesktop) {
    //         root.classList.add('wa-hcards-wrapper--stack');
    //     }
    
    //     // ====================== Служебные переменные ======================
    
    //     let baseOffsets = [];
    //     let segmentDistances = [];
    
    //     let progress       = 0;   // фактический прогресс 0..1
    //     let targetProgress = 0;   // целевой прогресс 0..1
    //     let rafId          = null;
    
    //     function clamp01(v) {
    //         return v < 0 ? 0 : (v > 1 ? 1 : v);
    //     }
    
    //     // ====================== Пересчёт оффсетов =========================
    
    //     function recalcOffsets() {
    //         if (!cards.length) return;
    
    //         // на время измерения убираем transform
    //         cards.forEach(card => {
    //             card.style.transform = 'translate3d(0,0,0)';
    //         });
    
    //         const firstRect   = cards[0].getBoundingClientRect();
    //         const firstCenter = firstRect.left + firstRect.width / 2;
    
    //         baseOffsets = cards.map(card => {
    //             const r = card.getBoundingClientRect();
    //             const c = r.left + r.width / 2;
    //             return c - firstCenter; // у первой = 0
    //         });
    
    //         segmentDistances = [];
    //         for (let i = 0; i < baseOffsets.length - 1; i++) {
    //             segmentDistances[i] = baseOffsets[i + 1] - baseOffsets[i];
    //         }
    
    //         applyStack(progress);
    //     }
    
    //     // ====================== Логика «наезжания» + прозрачность =========
    
    //     function applyStack(p) {
    //         p = clamp01(p);
    //         if (!segmentDistances.length) return;
    
    //         // десктоп: частичное перекрытие; мобилка: одна карта на экране
    //         const overlap = isDesktop ? 0.2 : 0;
    //         const phases  = segmentDistances.length;
    //         const t       = p * phases; // глобальная фаза: 0..phases
    
    //         cards.forEach((card, i) => {
    //             // --- сдвиг как было ---
    //             if (i === 0) {
    //                 card.style.transform = 'translate3d(0,0,0)';
    //             } else {
    //                 let totalShift = 0;
    
    //                 for (let k = 0; k < i && k < segmentDistances.length; k++) {
    //                     let x = t - k;
    //                     let a = x <= 0 ? 0 : (x >= 1 ? 1 : x); // 0..1
    
    //                     const d = segmentDistances[k] * (1 - overlap) * a;
    //                     totalShift += d;
    //                 }
    
    //                 card.style.transform = 'translate3d(' + (-totalShift) + 'px, 0, 0)';
    //             }
    
    //             // --- прозрачность: когда следующая карта «наезжает», предыдущая исчезает ---
    //             let opacity = 1;
    
    //             // у последней карты нет следующей — она остаётся непрозрачной
    //             if (i < cards.length - 1) {
    //                 const x = t - i; // прогресс перехода от i к i+1
    
    //                 if (x <= 0) {
    //                     opacity = 1;          // ещё не начали наезжать
    //                 } else if (x >= 1) {
    //                     opacity = 0;          // следующая полностью накрыла
    //                 } else {
    //                     opacity = 1 - x;      // линейно 1 → 0
    //                 }
    //             }
    
    //             card.style.opacity = opacity;
    //         });
    //     }
    
    //     function animate() {
    //         rafId = null;
    //         const diff = targetProgress - progress;
    
    //         if (Math.abs(diff) < 0.001) {
    //             progress = targetProgress;
    //             applyStack(progress);
    //             return;
    //         }
    
    //         progress += diff * 0.08;
    //         applyStack(progress);
    //         rafId = requestAnimationFrame(animate);
    //     }
    
    //     // ====================== Scroll-driven прогресс =====================
    
    //     function updateScrollDrivenTarget() {
    //         const rect = root.getBoundingClientRect();
    //         const vh   = window.innerHeight || document.documentElement.clientHeight;
    
    //         // Секция пересекается с вьюпортом?
    //         const inViewport = rect.bottom > 0 && rect.top < vh;
    //         if (!inViewport) {
    //             // Если мы ниже секции — держим 0, если уже проскроллили выше — 1
    //             const below = rect.top >= vh;
    //             targetProgress = below ? 0 : 1;
    //         } else {
    //             // Классический scroll-driven mapping:
    //             // t = 0 — секция только заходит снизу,
    //             // t ≈ 0.5 — секция примерно по центру,
    //             // t = 1 — секция ушла вверх.
    //             const raw = (vh - rect.top) / (vh + rect.height);
    //             targetProgress = clamp01(raw);
    //         }
    
    //         if (!rafId) {
    //             rafId = requestAnimationFrame(animate);
    //         }
    //     }
    
    //     function onScroll() {
    //         if (prefersReducedMotion) return;
    //         updateScrollDrivenTarget();
    //     }
    
    //     // ====================== Слушатели =====================
    
    //     recalcOffsets();
    //     updateScrollDrivenTarget();
    
    //     window.addEventListener('resize', function() {
    //         recalcOffsets();
    //         updateScrollDrivenTarget();
    //     }, { passive: true });
    
    //     window.addEventListener('scroll', onScroll, { passive: true });
    // }
    
    // Оригинал
    
    // function initHorizontalStackCards(root, targetClass) {
    //     if (!featureEnabled('enable_horizontal_cards') || prefersReducedMotion) return;
    //     if (root.dataset.waHorizontalStackInit === '1') return;
    //     root.dataset.waHorizontalStackInit = '1';
    
    //     const isDesktop = (typeof waIsDesktop === 'function') ? waIsDesktop() : true;
    
    //     const container = root.querySelector('.wa-section__inner') || root;
    
    //     // карточки
    //     const selector  = targetClass ? '.' + targetClass : null;
    //     const nodeList  = selector ? container.querySelectorAll(selector) : container.children;
    //     const cards     = Array.prototype.slice.call(nodeList);
    //     if (!cards.length) return;
    
    //     // трек + inner
    //     const track = document.createElement('div');
    //     track.className = 'wa-hcards-track';
    
    //     cards.forEach((card, index) => {
    //         const item = document.createElement('div');
    //         item.className = 'wa-hcards-item';
    //         item.appendChild(card);
    //         track.appendChild(item);
    
    //         card.style.position   = card.style.position || 'relative';
    //         card.style.willChange = 'transform';
    //         card.style.zIndex     = 100 + index; // правая карта выше левой
    //     });
    
    //     const inner = document.createElement('div');
    //     inner.className = 'wa-hcards-inner';
    //     inner.appendChild(track);
    
    //     while (container.firstChild) {
    //         container.removeChild(container.firstChild);
    //     }
    //     container.appendChild(inner);
    
    //     root.classList.add('wa-hcards-wrapper');
    //     if (!isDesktop) {
    //         root.classList.add('wa-hcards-wrapper--stack');
    //     }
    
    //     // ====================== Служебные переменные ======================
    
    //     let baseOffsets = [];
    //     let segmentDistances = [];
    
    //     let progress       = 0;   // фактический прогресс 0..1
    //     let targetProgress = 0;   // целевой прогресс 0..1
    //     let rafId          = null;
    
    //     // состояние "горизонтального режима"
    //     let isHorizontalActive = false;
    //     let unlockTimer = null;
    
    //     const wheelSpeedDesktop = 0.0005;
    //     const wheelSpeedMobile  = 0.0001;  // ещё медленнее на тачах
    //     const wheelSpeed        = isDesktop ? wheelSpeedDesktop : wheelSpeedMobile;
    
    //     function clamp01(v) {
    //         return v < 0 ? 0 : (v > 1 ? 1 : v);
    //     }
    
    //     // ====================== Пересчёт оффсетов =========================
    
    //     function recalcOffsets() {
    //         if (!cards.length) return;
    
    //         // на время измерения убираем transform
    //         cards.forEach(card => {
    //             card.style.transform = 'translate3d(0,0,0)';
    //         });
    
    //         const firstRect   = cards[0].getBoundingClientRect();
    //         const firstCenter = firstRect.left + firstRect.width / 2;
    
    //         baseOffsets = cards.map(card => {
    //             const r = card.getBoundingClientRect();
    //             const c = r.left + r.width / 2;
    //             return c - firstCenter; // у первой = 0
    //         });
    
    //         segmentDistances = [];
    //         for (let i = 0; i < baseOffsets.length - 1; i++) {
    //             segmentDistances[i] = baseOffsets[i + 1] - baseOffsets[i];
    //         }
    
    //         applyStack(progress);
    //     }
    
    //     // ====================== Логика «наезжания» ========================
    
    //     function applyStack(p) {
    //         p = clamp01(p);
    //         if (!segmentDistances.length) return;
    
    //         // десктоп: частичное перекрытие; мобилка: одна карта на экране
    //         const overlap = isDesktop ? 0.2 : 0;
    //         const phases  = segmentDistances.length;
    //         const t       = p * phases;
    
    //         cards.forEach((card, i) => {
    //             if (i === 0) {
    //                 card.style.transform = 'translate3d(0,0,0)';
    //                 return;
    //             }
    
    //             let totalShift = 0;
    
    //             for (let k = 0; k < i && k < segmentDistances.length; k++) {
    //                 let x = t - k;
    //                 let a = x <= 0 ? 0 : (x >= 1 ? 1 : x); // 0..1
    
    //                 const d = segmentDistances[k] * (1 - overlap) * a;
    //                 totalShift += d;
    //             }
    
    //             card.style.transform = 'translate3d(' + (-totalShift) + 'px, 0, 0)';
    //         });
    //     }
    
    //     function animate() {
    //         rafId = null;
    //         const diff = targetProgress - progress;
    
    //         if (Math.abs(diff) < 0.001) {
    //             progress = targetProgress;
    //             applyStack(progress);
    //             return;
    //         }
    
    //         progress += diff * 0.08;
    //         applyStack(progress);
    //         rafId = requestAnimationFrame(animate);
    //     }
    
    //     function setTargetProgress(delta) {
    //         const prevTarget = targetProgress;
    //         targetProgress = clamp01(targetProgress + delta);
    
    //         if (targetProgress === prevTarget) return { changed: false, prevTarget, newTarget: targetProgress };
    
    //         if (!rafId) {
    //             rafId = requestAnimationFrame(animate);
    //         }
    
    //         return { changed: true, prevTarget, newTarget: targetProgress };
    //     }
    
    //     function isInViewport() {
    //         const rect = root.getBoundingClientRect();
    //         const vh   = window.innerHeight || document.documentElement.clientHeight;
    //         return rect.bottom > 0 && rect.top < vh;
    //     }
    
    //     function cancelUnlockTimer() {
    //         if (!unlockTimer) return;
    //         clearTimeout(unlockTimer);
    //         unlockTimer = null;
    //     }
    
    //     function scheduleUnlock() {
    //         if (!isHorizontalActive) return;
    //         if (unlockTimer) return;
    
    //         unlockTimer = setTimeout(() => {
    //             unlockTimer = null;
    //             isHorizontalActive = false;
    //             root.classList.remove('wa-hcards-wrapper--active');
    //             // после выхода — вертикальный скролл снова обычный
    //         }, 1000);
    //     }
    
    //     // ====================== Обработка wheel/touch =====================
    
    //     function handleDelta(delta, e) {
    //         if (!delta) return;
    //         if (!isInViewport()) return;
    
    //         const { changed, prevTarget, newTarget } = setTargetProgress(delta * wheelSpeed);
    
    //         if (!changed) {
    //             // прогресс не изменился = уже в упоре
    //             if (isHorizontalActive) {
    //                 // запускаем отсчёт на выход
    //                 scheduleUnlock();
    //                 e.preventDefault();
    //             }
    //             return;
    //         }
    
    //         const wasMiddle = prevTarget > 0 && prevTarget < 1;
    //         const isMiddle  = newTarget > 0 && newTarget < 1;
    
    //         // как только попали в середину диапазона — активируем горизонтальный режим
    //         if (isMiddle) {
    //             isHorizontalActive = true;
    //             root.classList.add('wa-hcards-wrapper--active');
    //             cancelUnlockTimer();
    //         }
    
    //         if (isHorizontalActive || isMiddle || wasMiddle) {
    //             // пока мы в горизонтальном сценарии (или только что вошли/выходим) — режем вертикальный скролл
    //             e.preventDefault();
    //         }
    
    //         // если теперь встали в край (0 или 1) — пускаем таймер на выход
    //         if (isHorizontalActive && (newTarget === 0 || newTarget === 1)) {
    //             scheduleUnlock();
    //         } else {
    //             cancelUnlockTimer();
    //         }
    //     }
    
    //     function onWheel(e) {
    //         if (prefersReducedMotion) return;
    //         const delta = e.deltaY || e.wheelDelta || e.detail || 0;
    //         handleDelta(delta, e);
    //     }
    
    //     // Ловим события по всей секции, даже если внутри картинка/текст
    //     root.addEventListener('wheel', onWheel, { passive: false, capture: true });
    
    //     let touchStartY = null;
    
    //     root.addEventListener('touchstart', function(e) {
    //         if (e.touches.length !== 1) return;
    //         touchStartY = e.touches[0].clientY;
    //     }, { passive: true, capture: true });
    
    //     root.addEventListener('touchmove', function(e) {
    //         if (prefersReducedMotion) return;
    //         if (touchStartY == null) return;
    
    //         const y = e.touches[0].clientY;
    //         const deltaY = touchStartY - y;
    
    //         handleDelta(deltaY, e); // очень медленный из-за малого wheelSpeedMobile
    //     }, { passive: false, capture: true });
    
    //     root.addEventListener('touchend', function() {
    //         touchStartY = null;
    //     }, { passive: true, capture: true });
    
    //     recalcOffsets();
    //     window.addEventListener('resize', recalcOffsets);
    // }
    
    // С прозрачностью
    
    // function initHorizontalStackCards(root, targetClass) {
    //     if (!featureEnabled('enable_horizontal_cards') || prefersReducedMotion) return;
    //     if (root.dataset.waHorizontalStackInit === '1') return;
    //     root.dataset.waHorizontalStackInit = '1';
    
    //     const isDesktop = (typeof waIsDesktop === 'function') ? waIsDesktop() : true;
    
    //     const container = root.querySelector('.wa-section__inner') || root;
    
    //     // карточки
    //     const selector  = targetClass ? '.' + targetClass : null;
    //     const nodeList  = selector ? container.querySelectorAll(selector) : container.children;
    //     const cards     = Array.prototype.slice.call(nodeList);
    //     if (!cards.length) return;
    
    //     // трек + inner
    //     const track = document.createElement('div');
    //     track.className = 'wa-hcards-track';
    
    //     cards.forEach((card, index) => {
    //         const item = document.createElement('div');
    //         item.className = 'wa-hcards-item';
    //         item.appendChild(card);
    //         track.appendChild(item);
    
    //         card.style.position   = card.style.position || 'relative';
    //         card.style.willChange = 'transform, opacity';
    //         card.style.zIndex     = 100 + index; // правая карта выше левой
    //         card.style.opacity    = card.style.opacity || '1';
    //     });
    
    //     const inner = document.createElement('div');
    //     inner.className = 'wa-hcards-inner';
    //     inner.appendChild(track);
    
    //     while (container.firstChild) {
    //         container.removeChild(container.firstChild);
    //     }
    //     container.appendChild(inner);
    
    //     root.classList.add('wa-hcards-wrapper');
    //     if (!isDesktop) {
    //         root.classList.add('wa-hcards-wrapper--stack');
    //     }
    
    //     // ====================== Служебные переменные ======================
    
    //     let baseOffsets = [];
    //     let segmentDistances = [];
    
    //     let progress       = 0;   // фактический прогресс 0..1
    //     let targetProgress = 0;   // целевой прогресс 0..1
    //     let rafId          = null;
    
    //     // состояние "горизонтального режима"
    //     let isHorizontalActive = false;
    //     let unlockTimer = null;
    
    //     const wheelSpeedDesktop = 0.0005;
    //     const wheelSpeedMobile  = 0.0001;  // ещё медленнее на тачах
    //     const wheelSpeed        = isDesktop ? wheelSpeedDesktop : wheelSpeedMobile;
    
    //     function clamp01(v) {
    //         return v < 0 ? 0 : (v > 1 ? 1 : v);
    //     }
    
    //     // ====================== Пересчёт оффсетов =========================
    
    //     function recalcOffsets() {
    //         if (!cards.length) return;
    
    //         // на время измерения убираем transform
    //         cards.forEach(card => {
    //             card.style.transform = 'translate3d(0,0,0)';
    //         });
    
    //         const firstRect   = cards[0].getBoundingClientRect();
    //         const firstCenter = firstRect.left + firstRect.width / 2;
    
    //         baseOffsets = cards.map(card => {
    //             const r = card.getBoundingClientRect();
    //             const c = r.left + r.width / 2;
    //             return c - firstCenter; // у первой = 0
    //         });
    
    //         segmentDistances = [];
    //         for (let i = 0; i < baseOffsets.length - 1; i++) {
    //             segmentDistances[i] = baseOffsets[i + 1] - baseOffsets[i];
    //         }
    
    //         applyStack(progress);
    //     }
    
    //     // ====================== Логика «наезжания» + прозрачность =========
    
    //     function applyStack(p) {
    //         p = clamp01(p);
    //         if (!segmentDistances.length) return;
    
    //         // десктоп: частичное перекрытие; мобилка: одна карта на экране
    //         const overlap = isDesktop ? 0.2 : 0;
    //         const phases  = segmentDistances.length;
    //         const t       = p * phases; // глобальная фаза: 0..phases
    
    //         cards.forEach((card, i) => {
    //             // --- сдвиг как было ---
    //             if (i === 0) {
    //                 card.style.transform = 'translate3d(0,0,0)';
    //             } else {
    //                 let totalShift = 0;
    
    //                 for (let k = 0; k < i && k < segmentDistances.length; k++) {
    //                     let x = t - k;
    //                     let a = x <= 0 ? 0 : (x >= 1 ? 1 : x); // 0..1
    
    //                     const d = segmentDistances[k] * (1 - overlap) * a;
    //                     totalShift += d;
    //                 }
    
    //                 card.style.transform = 'translate3d(' + (-totalShift) + 'px, 0, 0)';
    //             }
    
    //             // --- прозрачность: когда следующая карта «наезжает», предыдущая исчезает ---
    //             let opacity = 1;
    
    //             // у последней карты нет следующей — она остаётся непрозрачной
    //             if (i < cards.length - 1) {
    //                 const x = t - i; // прогресс перехода от i к i+1
    
    //                 if (x <= 0) {
    //                     opacity = 1;          // ещё не начали наезжать
    //                 } else if (x >= 1) {
    //                     opacity = 0;          // следующая полностью накрыла
    //                 } else {
    //                     opacity = 1 - x;      // линейно 1 → 0
    //                 }
    //             }
    
    //             card.style.opacity = opacity;
    //         });
    //     }
    
    //     function animate() {
    //         rafId = null;
    //         const diff = targetProgress - progress;
    
    //         if (Math.abs(diff) < 0.001) {
    //             progress = targetProgress;
    //             applyStack(progress);
    //             return;
    //         }
    
    //         progress += diff * 0.08;
    //         applyStack(progress);
    //         rafId = requestAnimationFrame(animate);
    //     }
    
    //     function setTargetProgress(delta) {
    //         const prevTarget = targetProgress;
    //         targetProgress = clamp01(targetProgress + delta);
    
    //         if (targetProgress === prevTarget) return { changed: false, prevTarget, newTarget: targetProgress };
    
    //         if (!rafId) {
    //             rafId = requestAnimationFrame(animate);
    //         }
    
    //         return { changed: true, prevTarget, newTarget: targetProgress };
    //     }
    
    //     // --- проверка видимости секции ---
    //     function isPartiallyInViewport() {
    //         const rect = root.getBoundingClientRect();
    //         const vh   = window.innerHeight || document.documentElement.clientHeight;
    //         return rect.bottom > 0 && rect.top < vh;
    //     }
    
    //     // полностью в вьюпорте (с небольшим допуском)
    //     function isFullyInViewport() {
    //         const rect = root.getBoundingClientRect();
    //         const vh   = window.innerHeight || document.documentElement.clientHeight;
    //         const tol  = 8; // px
    //         // если блок выше по высоте, чем экран, то считаем «почти полностью» видимым
    //         if (rect.height > vh + tol) {
    //             return rect.top >= -tol && rect.bottom <= vh + tol;
    //         }
    //         return rect.top >= -tol && rect.bottom <= vh + tol;
    //     }
    
    //     function cancelUnlockTimer() {
    //         if (!unlockTimer) return;
    //         clearTimeout(unlockTimer);
    //         unlockTimer = null;
    //     }
    
    //     function scheduleUnlock() {
    //         if (!isHorizontalActive) return;
    //         if (unlockTimer) return;
    
    //         unlockTimer = setTimeout(() => {
    //             unlockTimer = null;
    //             isHorizontalActive = false;
    //             root.classList.remove('wa-hcards-wrapper--active');
    //             // после выхода — вертикальный скролл снова обычный
    //         }, 1000);
    //     }
    
    //     // ====================== Обработка wheel/touch =====================
    
    //     function handleDelta(delta, e) {
    //         if (!delta) return;
        
    //         const rect = root.getBoundingClientRect();
    //         const vh   = window.innerHeight || document.documentElement.clientHeight;
        
    //         // Секция хотя бы частично в кадре?
    //         const intersecting = rect.bottom > 0 && rect.top < vh;
        
    //         if (!intersecting) {
    //             // Вышли из зоны — сбрасываем горизонтальный режим
    //             if (isHorizontalActive) {
    //                 isHorizontalActive = false;
    //                 root.classList.remove('wa-hcards-wrapper--active');
    //                 cancelUnlockTimer();
    //             }
    //             return;
    //         }
        
    //         // "полностью видима" — достаточно строго, без толеранса
    //         const fullyVisible = rect.top >= 0 && rect.bottom <= vh;
        
    //         // Пока секция ещё не полностью видна и режим ещё не активирован —
    //         // вообще не трогаем прогресс, даём обычный вертикальный скролл.
    //         if (!fullyVisible && !isHorizontalActive) {
    //             return;
    //         }
        
    //         const { changed, prevTarget, newTarget } = setTargetProgress(delta * wheelSpeed);
        
    //         if (!changed) {
    //             // Уже упёрлись в край, но горизонтальный активен — всё равно режем вертикаль,
    //             // чтобы таймер успел отработать.
    //             if (isHorizontalActive && e && e.cancelable) {
    //                 e.preventDefault();
    //             }
    //             scheduleUnlock();
    //             return;
    //         }
        
    //         const wasMiddle = prevTarget > 0 && prevTarget < 1;
    //         const isMiddle  = newTarget > 0 && newTarget < 1;
        
    //         // При первом входе в середину, когда секция полностью видна — включаем режим
    //         if (fullyVisible && isMiddle && !isHorizontalActive) {
    //             isHorizontalActive = true;
    //             root.classList.add('wa-hcards-wrapper--active');
    //             cancelUnlockTimer();
    //         }
        
    //         // Пока горизонтальный режим активен — режем вертикальный скролл всегда
    //         if (isHorizontalActive && e && e.cancelable) {
    //             e.preventDefault();
    //         }
        
    //         // Если дошли до начала или конца — запускаем таймер выхода
    //         if (isHorizontalActive && (newTarget === 0 || newTarget === 1)) {
    //             scheduleUnlock();
    //         } else {
    //             cancelUnlockTimer();
    //         }
    //     }
    
    //     function onWheel(e) {
    //         if (prefersReducedMotion) return;
    //         const delta = e.deltaY || e.wheelDelta || e.detail || 0;
    //         handleDelta(delta, e);
    //     }
    
    //     // Ловим события по всей секции, даже если внутри картинка/текст
    //     root.addEventListener('wheel', onWheel, { passive: false, capture: true });
    
    //     let touchStartY = null;
    
    //     root.addEventListener('touchstart', function(e) {
    //         if (e.touches.length !== 1) return;
    //         touchStartY = e.touches[0].clientY;
    //     }, { passive: true, capture: true });
    
    //     root.addEventListener('touchmove', function(e) {
    //         if (prefersReducedMotion) return;
    //         if (touchStartY == null) return;
    
    //         const y = e.touches[0].clientY;
    //         const deltaY = touchStartY - y;
    
    //         handleDelta(deltaY, e); // очень медленный из-за малого wheelSpeedMobile
    //     }, { passive: false, capture: true });
    
    //     root.addEventListener('touchend', function() {
    //         touchStartY = null;
    //     }, { passive: true, capture: true });
    
    //     recalcOffsets();
    //     window.addEventListener('resize', recalcOffsets);
    // }

    function initParallax(root, targetClass) {
        if (!featureEnabled('enable_misc_effects') || prefersReducedMotion) return;

        const selector = targetClass ? '.' + targetClass : '.wa-parallax-layer';
        const layers = root.querySelectorAll(selector);
        if (!layers.length) return;

        const update = () => {
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            const rect = root.getBoundingClientRect();
            const center = rect.top + rect.height / 2 + scrollY;
            const delta = (scrollY - center) * 0.35;

            layers.forEach((layer, i) => {
                const depth = (i + 1) / (layers.length + 1);
                const translateY = delta * depth * -1;
                layer.style.transform = `translate3d(0, ${translateY}px, 0)`;
            });
        };

        let rafId = null;
        const onScroll = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(update);
        };

        window.addEventListener('scroll', onScroll);
        update();
    }

    function initAnimations() {
        const roots = document.querySelectorAll('[data-wa-anim]');
        roots.forEach(root => {
            if (root.dataset.waInitialized === '1') return;
            root.dataset.waInitialized = '1';

            const id = root.getAttribute('data-wa-anim');
            const targetClass = root.getAttribute('data-wa-anim-target') || '';

            switch (id) {
                case 'reveal-children':
                    initRevealChildren(root, targetClass);
                    break;

                case 'horizontal-cards':
                    initHorizontalCards(root, targetClass);
                    break;

                case 'horizontal-fade':
                    initVerticalStackCardsMobile(root, targetClass);
                    break;

                case 'parallax-soft':
                    initParallax(root, targetClass);
                    break;
                    
                case 'horizontal-stack':
                    initHorizontalStackCards(root, targetClass);
                    break;

                case 'fade-up':
                case 'fade-down':
                case 'fade-left':
                case 'fade-right':
                    initSimpleFade(root, targetClass, id); // ← сюда попадают все fade-*
                    break;

                default:
                    // можно добавлять другие ID
                    break;
            }
        });
    }
    // 🔥 Глобальний snap / soft scroll
    if (!prefersReducedMotion) {
        if (featureEnabled('enable_section_snap')) {
            // только snap-секции, без глобального мягкого скролла
            initSectionSnapOnce();
        } else if (featureEnabled('enable_soft_scroll')) {
            // только глобальный мягкий скролл
            initSoftScrollOnce();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnimations);
    } else {
        initAnimations();
    }

    // На будущее (если будет ajax в WordPress)
    window.WAAnimations = { init: initAnimations };
})();
