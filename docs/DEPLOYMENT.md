# DEPLOYMENT.md - CI/CD 및 배포 파이프라인

## 1. 배포 개요

| 항목 | 내용 |
|---|---|
| 배포 대상 | 정적 SPA (Single Page Application) |
| 빌드 도구 | Vite |
| CI/CD | GitHub Actions |
| 호스팅 | Vercel (주) 또는 GitHub Pages (보조) |
| 빌드 결과물 | `dist/` 디렉토리 |
| 도메인 | Vercel 기본 도메인 또는 커스텀 도메인 |

---

## 2. CI/CD 파이프라인

### 2.1 파이프라인 구조

```
PR / push → CI (ci.yml)        → type-check → lint → build
main push → Deploy (deploy.yml) → type-check → build → Vercel 프로덕션 배포
```

### 2.2 CI 워크플로우 (`.github/workflows/ci.yml`)

**트리거**: `main`, `develop` 브랜치에 대한 push 및 PR

| 단계 | 명령 | 설명 |
|---|---|---|
| Install | `npm ci` | lock 파일 기반 정확한 의존성 설치 |
| Type Check | `npm run type-check` | TypeScript strict 모드 검사 |
| Lint | `npm run lint` | ESLint 코드 품질 검사 |
| Build | `npm run build` | Vite 프로덕션 빌드 검증 |

- `concurrency` 설정으로 동일 브랜치의 이전 CI 실행을 자동 취소
- PR 머지 조건으로 CI 통과를 필수로 설정 권장 (Branch Protection Rules)

### 2.3 Deploy 워크플로우 (`.github/workflows/deploy.yml`)

**트리거**: `main` 브랜치 push만

| 단계 | 설명 |
|---|---|
| Type Check + Build | 빌드 검증 |
| Vercel Deploy | `amondnet/vercel-action@v25`로 프로덕션 배포 |

- `cancel-in-progress: false`로 배포 중 취소 방지

### 2.4 GitHub Secrets 설정

Repository → Settings → Secrets and variables → Actions에서 다음 시크릿을 등록한다:

| Secret | 용도 | 필수 |
|---|---|---|
| `VITE_VWORLD_API_KEY` | V-World 타일맵 API 키 | CI + Deploy |
| `VERCEL_TOKEN` | Vercel 개인 액세스 토큰 | Deploy |
| `VERCEL_ORG_ID` | Vercel Organization ID | Deploy |
| `VERCEL_PROJECT_ID` | Vercel Project ID | Deploy |

**Vercel 토큰 발급 방법:**
1. [Vercel Dashboard](https://vercel.com/account/tokens) → "Create Token"
2. Scope: 해당 프로젝트에 접근 가능한 범위로 설정

**Vercel Org/Project ID 확인 방법:**
```bash
# Vercel CLI 설치 후 프로젝트 루트에서 실행
npx vercel link
# → .vercel/project.json 파일에 orgId, projectId 자동 생성
```

### 2.5 Branch Protection Rules (권장)

GitHub → Settings → Branches → `main` 브랜치:

- [x] Require a pull request before merging
- [x] Require status checks to pass before merging
  - 필수 체크: `ci`
- [x] Require branches to be up to date before merging

---

## 3. 프로덕션 빌드

### 3.1 빌드 실행

```bash
npm run build
```

### 3.2 빌드 결과 확인

```bash
npm run preview
# → http://localhost:4173 에서 프로덕션 빌드 미리보기
```

### 3.3 빌드 산출물 구조

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js        # 메인 번들
│   ├── vendor-[hash].js       # 라이브러리 청크
│   ├── worker-[hash].js       # Web Worker 번들
│   └── index-[hash].css       # 스타일시트
└── data/
    └── routes/                # 사전 추출된 경로 JSON
        ├── vehicle-001.json
        └── ...
```

---

## 4. Vercel 배포 (권장)

### 4.1 초기 설정

1. [Vercel](https://vercel.com)에 GitHub 계정으로 로그인
2. "New Project" → GitHub 저장소 연결
3. 프레임워크 프리셋: **Vite** 자동 감지
4. 빌드 설정 확인:

| 설정 | 값 |
|---|---|
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 4.2 환경변수 설정

Vercel 대시보드 → Settings → Environment Variables:

| 변수명 | 환경 | 비고 |
|---|---|---|
| `VITE_VWORLD_API_KEY` | Production, Preview | V-World API 키 |

> `KAKAO_REST_API_KEY`는 빌드 타임 스크립트 전용이므로 Vercel에 등록할 필요 없음 (경로 데이터는 이미 JSON으로 커밋됨).

### 4.3 배포 트리거

| 트리거 | 동작 |
|---|---|
| `main` 브랜치 push | 프로덕션 배포 자동 실행 |
| PR 생성/업데이트 | Preview 배포 자동 생성 |
| `develop` 브랜치 push | Preview 배포 (선택) |

### 4.4 도메인 설정

- 기본 제공: `logi-twin-web.vercel.app`
- 커스텀 도메인: Vercel Domains에서 설정 가능

---

## 5. GitHub Pages 배포 (대안)

### 5.1 Vite 설정

`vite.config.ts`에 base 경로 추가:

```typescript
export default defineConfig({
  base: '/logi-twin-web/',  // 저장소명과 일치
  // ...
});
```

### 5.2 GitHub Actions 워크플로우

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npm run build
        env:
          VITE_VWORLD_API_KEY: ${{ secrets.VITE_VWORLD_API_KEY }}

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

### 5.3 GitHub Secrets 설정

Repository → Settings → Secrets and variables → Actions:
- `VITE_VWORLD_API_KEY`: V-World API 키

---

## 6. 배포 전 체크리스트

```
□ npm run type-check → TypeScript 에러 없음
□ npm run lint → ESLint 경고/에러 없음
□ npm run build → 빌드 성공
□ npm run preview → 로컬 프리뷰 정상 동작
□ 환경변수 설정 완료 (Vercel 또는 GitHub Secrets)
□ public/data/routes/ 에 경로 JSON 파일 존재
□ Lighthouse Performance ≥ 80
□ WebGL 렌더링 정상 (3D 맵, 차량, 경로)
```

---

## 7. 성능 모니터링

### 7.1 Vercel Analytics (무료)

- Vercel 대시보드에서 Web Vitals 자동 수집
- FCP, LCP, CLS, TTFB 모니터링

### 7.2 수동 점검

| 도구 | 검사 항목 |
|---|---|
| Chrome Lighthouse | Performance, Accessibility, Best Practices |
| Chrome DevTools Performance | 프레임 레이트, Long Tasks |
| Chrome DevTools Memory | 힙 사이즈, GC 빈도 |
| WebPageTest | 네트워크 워터폴, 번들 사이즈 |

---

## 8. 롤백 절차

### Vercel
- Vercel 대시보드 → Deployments → 이전 배포 선택 → "Promote to Production"
- 즉시 이전 버전으로 전환 (다운타임 없음)

### GitHub Pages
- `main` 브랜치를 이전 커밋으로 revert → push → 자동 재배포
