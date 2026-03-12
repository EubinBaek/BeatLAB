// ── 언어 드롭다운 & 번역 ──────────────────────────────────────
const TRANSLATE_URL = 'https://gjhzjsojyesthrmwopkl.supabase.co/functions/v1/translate';

const LANG_NAMES = {
  en: 'English', es: 'Español', fr: 'Français',
  ko: '한국어', zh: '中文', ja: '日本語', de: 'Deutsch'
};

const TRANSLATING_TEXT = {
  en: 'Translating...', es: 'Traduciendo...', fr: 'Traduction...',
  ko: '번역 중...', zh: '翻译中...', ja: '翻訳中...', de: 'Übersetzen...'
};

// 페이지 원본 언어 (영어)
const ORIGINAL_LANG = 'en';

// 특정 텍스트 번역 오버라이드 (API 번역 결과를 덮어씀)
const CUSTOM_TRANSLATIONS = {
  ko: {
    'Practice Journal': '악보 일지',
    "Track the songs you've saved, practiced, and completed.": '저장한 곡, 연습 중인 곡, 완료한 곡을 관리하세요.',
    'Filters': '필터',
    'All': '전체',
    'Progress': '진행 상태',
    'Saved': '저장됨',
    'In Progress': '연습 중',
    'Completed': '완료',
    'Difficulty Level': '난이도',
    'Beginner': '초급',
    'Intermediate': '중급',
    'Advanced': '고급',
    'Title / Artist': '곡 제목 / 아티스트',
    'Genre': '장르',
    'Level': '레벨',
    'Upload Score': '악보 업로드',
    'Save Practice Journal': '악보 일지 저장',
  },
  es: {
    'Practice Journal': 'Diario de Práctica',
    "Track the songs you've saved, practiced, and completed.": 'Haz seguimiento de las canciones que has guardado, practicado y completado.',
    'Filters': 'Filtros',
    'All': 'Todos',
    'Progress': 'Progreso',
    'Saved': 'Guardado',
    'In Progress': 'En progreso',
    'Completed': 'Completado',
    'Difficulty Level': 'Nivel de dificultad',
    'Beginner': 'Principiante',
    'Intermediate': 'Intermedio',
    'Advanced': 'Avanzado',
    'Title / Artist': 'Título / Artista',
    'Genre': 'Género',
    'Level': 'Nivel',
    'Upload Score': 'Subir Partitura',
    'Save Practice Journal': 'Guardar Diario de Práctica',
  },
  fr: {
    'Practice Journal': 'Journal de Pratique',
    "Track the songs you've saved, practiced, and completed.": 'Suivez les chansons que vous avez sauvegardées, pratiquées et terminées.',
    'Filters': 'Filtres',
    'All': 'Tous',
    'Progress': 'Progression',
    'Saved': 'Sauvegardé',
    'In Progress': 'En cours',
    'Completed': 'Terminé',
    'Difficulty Level': 'Niveau de difficulté',
    'Beginner': 'Débutant',
    'Intermediate': 'Intermédiaire',
    'Advanced': 'Avancé',
    'Title / Artist': 'Titre / Artiste',
    'Genre': 'Genre',
    'Level': 'Niveau',
    'Upload Score': 'Télécharger une partition',
    'Save Practice Journal': 'Enregistrer le Journal',
  },
  zh: {
    'Practice Journal': '练习记录',
    "Track the songs you've saved, practiced, and completed.": '追踪你保存、练习和完成的歌曲。',
    'Filters': '筛选',
    'All': '全部',
    'Progress': '进度',
    'Saved': '已保存',
    'In Progress': '练习中',
    'Completed': '已完成',
    'Difficulty Level': '难度等级',
    'Beginner': '初级',
    'Intermediate': '中级',
    'Advanced': '高级',
    'Title / Artist': '歌曲 / 艺术家',
    'Genre': '类型',
    'Level': '等级',
    'Upload Score': '上传乐谱',
    'Save Practice Journal': '保存练习记录',
  },
  ja: {
    'Practice Journal': '練習ジャーナル',
    "Track the songs you've saved, practiced, and completed.": '保存した曲、練習中の曲、完了した曲を管理しましょう。',
    'Filters': 'フィルター',
    'All': 'すべて',
    'Progress': '進行状況',
    'Saved': '保存済み',
    'In Progress': '練習中',
    'Completed': '完了',
    'Difficulty Level': '難易度',
    'Beginner': '初級',
    'Intermediate': '中級',
    'Advanced': '上級',
    'Title / Artist': '曲名 / アーティスト',
    'Genre': 'ジャンル',
    'Level': 'レベル',
    'Upload Score': '楽譜をアップロード',
    'Save Practice Journal': 'ジャーナルを保存',
  },
  de: {
    'Practice Journal': 'Übungsjournal',
    "Track the songs you've saved, practiced, and completed.": 'Verfolge die Songs, die du gespeichert, geübt und abgeschlossen hast.',
    'Filters': 'Filter',
    'All': 'Alle',
    'Progress': 'Fortschritt',
    'Saved': 'Gespeichert',
    'In Progress': 'In Bearbeitung',
    'Completed': 'Abgeschlossen',
    'Difficulty Level': 'Schwierigkeitsgrad',
    'Beginner': 'Anfänger',
    'Intermediate': 'Mittelstufe',
    'Advanced': 'Fortgeschritten',
    'Title / Artist': 'Titel / Künstler',
    'Genre': 'Genre',
    'Level': 'Level',
    'Upload Score': 'Partitur hochladen',
    'Save Practice Journal': 'Übungsjournal speichern',
  },
};

// ── 번역 대상 셀렉터 ──────────────────────────────────────────
const TRANSLATE_SELECTORS = [
  // 공통 제목/문단
  'h1', 'h2', 'h3', 'h4', 'p',
  // 버튼 (lang-btn·card-plus-btn 제외)
  '.btn:not(.lang-btn)',
  '.nav-journal',
  '.more-recs-btn',
  // 업로드 페이지
  '.upload-desc', '.drop-text', '.radio-item',
  '.page-title', '.section-sub',
  // 결과 페이지
  '.ai-comment-text', '.rec-mode-bar strong', '.rec-description', '.best-label',
  '.diff-value', '.diff-label', '.tech-item', '.bpm-label', '.bpm-value',
  '.back-section-label', '.back-ai-badge', '.back-score-label',
  '.back-reason',
  // 태그 / 레벨 버튼
  '.tag-btn', '.level-btn',
  // 테크닉 태그 (분석 결과)
  '.tech-tag',
  // 분석 중 화면
  '.analyzing-letters',
  // 저널 — 필터 텍스트 전용 span (카운트 span과 분리됨)
  '.filter-label-text',
  '.sidebar-heading', '.filter-group-label',
  '.table-header span',
  '.progress-pill', '.detail-tag-source',
  '.detail-edit-label', '.status-chip',
  '.detail-save-btn', '.detail-delete-btn',
  '.detail-field label',
  '.journal-empty p', '.journal-header p',
  '.journal-save-btn', '.journal-upload-link',
  // 프로필 페이지
  '.logout-btn', '.section-card-title',
  '.logout-modal-title', '.logout-modal-desc',
  '.logout-cancel-btn', '.logout-confirm-btn',
  '.toast-msg', '.modal-add',
];

// ── 번역 제외 클래스/ID (노래 제목·아티스트·데이터 값) ──────────
const EXCLUDE_SELECTORS = [
  // 노래 제목
  '.row-title', '.front-title', '.detail-title',
  '#res-title', '#res-artist',
  // 아티스트
  '.row-artist-sm', '.front-artist', '.detail-artist',
  // 네비게이션 User ID (닉네임)
  '#nav-user-id', '.nav-profile-id',
  // 데이터 값 (BPM, 장르값, 난이도값 등)
  '.row-genre-tag', '.row-source',
  '#res-genre', '#res-bpm', '#res-time', '#res-pbpm', '#res-diff2',
  '#detail-genre', '#detail-bpm', '#detail-diff',
  // 악보 구매 링크 텍스트
  '.back-score-link',
  // 숫자 카운트
  '.filter-count',
  // 드럼 테크닉 태그 (back 카드)
  '.back-tech-tag',
  // 앨범 커버 alt
  'img',
];

let originalTexts = null;
let currentLang = ORIGINAL_LANG;
let pendingTranslateController = null;
let langBtnTextNode = null;
let translateSeq = 0;

// 번역 대상 노드 수집
function collectNodes() {
  const nodes = [];
  const seen = new WeakSet();

  // 제외 대상 미리 수집
  const excludeSet = new WeakSet();
  EXCLUDE_SELECTORS.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => excludeSet.add(el));
  });

  TRANSLATE_SELECTORS.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (seen.has(el)) return;
      if (excludeSet.has(el)) return;
      // 제외 요소의 하위이거나, 언어 드롭다운/스크립트/스타일 내부 제외
      if (el.closest('.lang-dropdown')) return;
      if (el.closest('script') || el.closest('style')) return;
      // 상위 중에 제외 대상이 있으면 건너뜀
      let ancestor = el.parentElement;
      let skip = false;
      while (ancestor) {
        if (excludeSet.has(ancestor)) { skip = true; break; }
        ancestor = ancestor.parentElement;
      }
      if (skip) return;

      const text = el.textContent.trim();
      if (!text || /^\d+$/.test(text)) return; // 숫자만이거나 빈 경우 제외
      if (text === '?' || text === '–' || text === '-') return; // 아이콘/빈값 제외
      seen.add(el);
      nodes.push(el);
    });
  });
  return nodes;
}

// 버튼의 텍스트 노드만 업데이트 (SVG 유지)
function setLangBtnLabel(label) {
  const btn = document.querySelector('.lang-btn');
  if (!btn) return;
  if (!langBtnTextNode) {
    // 공백이 아닌 실제 텍스트 노드를 찾음
    langBtnTextNode = [...btn.childNodes].find(
      node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
    ) || null;
  }
  if (langBtnTextNode) {
    langBtnTextNode.textContent = label;
  }
}

// ── 네비게이션 레이아웃 고정 (언어에 따라 흔들리지 않도록) ──
// 페이지 로드 후 현재 크기를 min-width로 고정
function lockNavWidths() {
  const btn = document.querySelector('.lang-btn');
  const journal = document.querySelector('.nav-journal');
  if (btn && !btn.style.minWidth) {
    btn.style.minWidth = btn.offsetWidth + 'px';
  }
  if (journal && !journal.style.minWidth) {
    journal.style.minWidth = journal.offsetWidth + 'px';
    journal.style.textAlign = 'center';
  }
}

async function translatePage(langCode) {
  if (!langCode || langCode === currentLang) return;
  const seq = ++translateSeq;

  // 영어(원본)로 돌아가는 경우 → 원본 텍스트 복원
  if (langCode === ORIGINAL_LANG) {
    if (originalTexts) {
      originalTexts.forEach(({ el, text }) => {
        el.textContent = text;
        if (el.classList.contains('nav-journal')) el.dataset.text = text;
      });
    }
    currentLang = ORIGINAL_LANG;
    setLangBtnLabel(LANG_NAMES[ORIGINAL_LANG]);
    return;
  }

  const nodes = collectNodes();
  if (!nodes.length) return;

  // 원본 저장 (최초 1회)
  if (!originalTexts) {
    originalTexts = nodes.map(el => ({ el, text: el.textContent.trim() }));
  }

  const overrides = CUSTOM_TRANSLATIONS[langCode] || {};

  // CUSTOM_TRANSLATIONS만으로 처리 가능한 노드는 즉시 적용
  function applyOverrides(nodeList, cached) {
    nodeList.forEach((el, i) => {
      const original = originalTexts?.[i]?.text ?? el.textContent.trim();
      if (overrides[original] !== undefined) {
        el.textContent = overrides[original];
        if (el.classList.contains('nav-journal')) el.dataset.text = overrides[original];
      } else if (cached && cached[i]) {
        el.textContent = cached[i];
        if (el.classList.contains('nav-journal')) el.dataset.text = cached[i];
      }
    });
  }

  // 캐시 확인 (노드 수가 일치해야만 사용 — 불일치 시 자동 무효화)
  const cacheKey = `bl_trans_${langCode}_${location.pathname}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      const translations = JSON.parse(cached);
      if (translations.length === nodes.length) {
        applyOverrides(nodes, translations);
        currentLang = langCode;
        setLangBtnLabel(LANG_NAMES[langCode] || langCode);
        return;
      }
    } catch(e) {}
    // 노드 수 불일치 → 캐시 무효화 후 재번역
    sessionStorage.removeItem(cacheKey);
  }

  // 로딩 표시 (선택한 언어로)
  setLangBtnLabel(TRANSLATING_TEXT[langCode] || '번역 중...');

  try {
    if (pendingTranslateController) pendingTranslateController.abort();
    pendingTranslateController = new AbortController();

    const texts = nodes.map(el => el.textContent.trim());

    const res = await fetch(TRANSLATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'apikey': SUPABASE_ANON,
      },
      body: JSON.stringify({ texts, target_lang: langCode }),
      signal: pendingTranslateController.signal,
    });

    const raw = await res.text();

    let data;
    try { data = JSON.parse(raw); } catch(e) {
      throw new Error('JSON 파싱 실패: ' + raw.slice(0, 200));
    }

    if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);

    let translations = data.translations;
    if (!Array.isArray(translations)) {
      translations = Object.values(data.translations || data);
    }

    if (!translations.length) throw new Error('번역 결과가 비어있어요');

    // DOM 적용 (커스텀 오버라이드 우선)
    applyOverrides(nodes, translations);

    sessionStorage.setItem(cacheKey, JSON.stringify(translations));
    currentLang = langCode;

  } catch (err) {
    if (err.name === 'AbortError') return;
    console.error('Translation error:', err);
    alert('번역 오류: ' + err.message);
    if (originalTexts) {
      originalTexts.forEach(({ el, text }) => { el.textContent = text; });
    }
  } finally {
    if (seq === translateSeq) {
      pendingTranslateController = null;
      setLangBtnLabel(LANG_NAMES[langCode] || langCode);
    }
  }
}

function toggleLang() {
  const dd = document.getElementById('langDropdown');
  dd.classList.toggle('open');
}

function setLang(code, label, el) {
  if (code === currentLang) {
    document.getElementById('langDropdown').classList.remove('open');
    return;
  }
  document.querySelectorAll('.lang-menu a').forEach(a => a.classList.remove('active'));
  el.classList.add('active');
  localStorage.setItem('bl_lang', code);
  // 이전 캐시 무효화 (셀렉터 변경 반영)
  Object.keys(sessionStorage).filter(k => k.startsWith('bl_trans_')).forEach(k => sessionStorage.removeItem(k));
  // originalTexts 초기화 (노드 순서 변경 대응)
  originalTexts = null;
  document.getElementById('langDropdown').classList.remove('open');
  translatePage(code);
}

// 스키마 버전 — 셀렉터/번역 변경 시 올려서 구 캐시 자동 무효화
const CACHE_VERSION = 'v4';
(function () {
  const stored = sessionStorage.getItem('bl_trans_version');
  if (stored !== CACHE_VERSION) {
    Object.keys(sessionStorage).filter(k => k.startsWith('bl_trans_')).forEach(k => sessionStorage.removeItem(k));
    sessionStorage.setItem('bl_trans_version', CACHE_VERSION);
  }
})();

// 저장된 언어 복원
(function () {
  const saved = localStorage.getItem('bl_lang') || ORIGINAL_LANG;
  const label = LANG_NAMES[saved] || LANG_NAMES[ORIGINAL_LANG];

  // 버튼 텍스트를 저장된 언어로 즉시 업데이트
  document.addEventListener('DOMContentLoaded', () => {
    setLangBtnLabel(label);
    document.querySelectorAll('.lang-menu a').forEach(a => {
      a.classList.toggle('active', a.textContent.trim() === label);
    });
  });

  if (saved !== ORIGINAL_LANG) {
    window.addEventListener('load', () => translatePage(saved));
  } else {
    currentLang = ORIGINAL_LANG;
  }
})();

// 바깥 클릭 시 닫기
document.addEventListener('click', (e) => {
  const dd = document.getElementById('langDropdown');
  if (dd && !dd.contains(e.target)) dd.classList.remove('open');
});

// 네비게이션 너비 고정 (DOM 로드 완료 후)
document.addEventListener('DOMContentLoaded', lockNavWidths);
window.addEventListener('resize', () => requestAnimationFrame(lockNavWidths));

// ── 전역 번역 헬퍼 (동적 렌더링 요소용) ─────────────────────────
// 사용법: translateText('Beginner') → 현재 언어의 번역 반환
window.translateText = function(text) {
  if (!text || currentLang === ORIGINAL_LANG) return text;
  const overrides = CUSTOM_TRANSLATIONS[currentLang] || {};
  return overrides[text] !== undefined ? overrides[text] : text;
};
