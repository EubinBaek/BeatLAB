// 로그인 세션이 없으면 index.html 로 리다이렉트, 있으면 User ID + 아바타 표시
(async function () {
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) {
      window.location.replace('index.html');
      return;
    }

    const el = document.getElementById('nav-user-id');

    // 1) metadata 우선 (RLS 영향 없음)
    const metaNick = session.user.user_metadata?.nickname;
    if (metaNick && el) {
      el.textContent = metaNick;
      el.setAttribute('data-text', metaNick);
    }

    // 2) profiles 조회 → nickname(fallback) + avatar_url
    const { data: profile } = await sb
      .from('profiles')
      .select('nickname, avatar_url')
      .eq('id', session.user.id)
      .single();

    if (profile?.nickname && !metaNick && el) {
      el.textContent = profile.nickname;
      el.setAttribute('data-text', profile.nickname);
    }

    // 3) 아바타 이미지가 있으면 nav-profile-icon 안의 SVG를 이미지로 교체
    if (profile?.avatar_url) {
      const iconEl = document.querySelector('.nav-profile-icon');
      if (iconEl) {
        iconEl.innerHTML = '';
        const img = document.createElement('img');
        img.src = profile.avatar_url;
        img.alt = 'Profile';
        img.style.cssText = 'width:100%; height:100%; object-fit:cover; border-radius:50%;';
        img.onerror = function () {
          // 이미지 로드 실패 시 기본 SVG 복원
          iconEl.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`;
        };
        iconEl.appendChild(img);
      }
    }
  } catch (_) {
    // 세션 확인 실패 시 안전하게 로그인 페이지로 이동
    window.location.replace('index.html');
  }
})();
