// ── Supabase 설정 ──────────────────────────────────────────────
// Supabase 대시보드 Settings → API 에서 복사해서 붙여넣기
const SUPABASE_URL  = 'https://gjhzjsojyesthrmwopkl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqaHpqc29qeWVzdGhybXdvcGtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxODk5NjMsImV4cCI6MjA4ODc2NTk2M30.R4rs4dVlUE_YWIae9IDQh5JHJzg9B-ps1wPx9wOAKDA';

// Supabase CDN 클라이언트 (supabase-js v2)
// 각 HTML 파일에서 이 파일보다 먼저 CDN 스크립트를 로드해야 함:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);
