(function () {
  'use strict';

  // ── 오버레이 (배경이 준비될 때까지 화면을 가림) ──────────────
  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position:      'fixed',
    inset:         '0',
    zIndex:        '9999',
    background:    '#F3EDD8',
    opacity:       '1',
    pointerEvents: 'none',
    willChange:    'opacity',
  });
  document.body.appendChild(overlay);

  // ── 페이지 콘텐츠: 즉시 숨겨서 페이드인 전 노출 방지 ────────
  // (background.js보다 뒤에 로드되므로 .page 는 이미 존재)
  const contentEl = document.querySelector('.page');
  if (contentEl) {
    contentEl.style.opacity   = '0';
    contentEl.style.transform = 'translateY(16px)';
  }

  // ── 페이드인 ─────────────────────────────────────────────────
  let fadeInStarted = false;
  let navigating = false;

  function startFadeIn() {
    if (fadeInStarted) return;
    fadeInStarted = true;

    // ① 오버레이를 먼저 페이드 아웃 → 배경 드러남
    overlay.style.transition = 'opacity 0.48s cubic-bezier(0.4, 0, 0.2, 1)';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.opacity = '0';
      });
    });

    // ② 콘텐츠는 오버레이보다 살짝 늦게 페이드인 + 위로 올라오는 슬라이드
    //    → 배경이 먼저 나오고, 그 위로 콘텐츠가 자연스럽게 올라오는 느낌
    setTimeout(() => {
      if (contentEl) {
        contentEl.style.transition =
          'opacity 0.60s cubic-bezier(0.4, 0, 0.2, 1), ' +
          'transform 0.60s cubic-bezier(0.4, 0, 0.2, 1)';
        contentEl.style.opacity   = '1';
        contentEl.style.transform = 'translateY(0)';
      }
    }, 160);

    setTimeout(() => { overlay.style.display = 'none'; }, 560);
  }

  // background.js 의 첫 렌더 완료 신호 대기 + 폴백
  const fallback = setTimeout(startFadeIn, 700);
  document.addEventListener('bg-ready', () => {
    clearTimeout(fallback);
    startFadeIn();
  }, { once: true });

  // ── 페이드아웃 후 이동 ────────────────────────────────────────
  function goTo(href) {
    if (!fadeInStarted || navigating) return;
    navigating = true;

    // 콘텐츠 위로 사라지기 + 오버레이 덮기
    if (contentEl) {
      contentEl.style.transition =
        'opacity 0.32s cubic-bezier(0.4, 0, 0.6, 1), ' +
        'transform 0.32s cubic-bezier(0.4, 0, 0.6, 1)';
      contentEl.style.opacity   = '0';
      contentEl.style.transform = 'translateY(-10px)';
    }

    overlay.style.display     = '';
    overlay.style.pointerEvents = 'all';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.transition = 'opacity 0.38s cubic-bezier(0.4, 0, 0.6, 1)';
        overlay.style.opacity    = '1';
        setTimeout(() => { window.location.href = href; }, 400);
      });
    });
  }

  window.navigateTo = goTo;

  // ── <a href> 클릭 가로채기 ───────────────────────────────────
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('http') || href.startsWith('//') ||
        href.startsWith('#')    || href.startsWith('mailto:') ||
        href.startsWith('tel:')) return;
    e.preventDefault();
    goTo(href);
  }, true);
})();
