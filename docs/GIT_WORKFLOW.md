# GIT_WORKFLOW.md - Git 협업 규칙

## 1. 브랜치 전략

### 1.1 브랜치 구조

```
main              ← 프로덕션 배포 브랜치 (항상 배포 가능 상태)
  └── develop     ← 통합 개발 브랜치
       ├── feat/xxx    ← 기능 개발
       ├── fix/xxx     ← 버그 수정
       ├── refactor/xxx← 리팩토링
       ├── perf/xxx    ← 성능 최적화
       └── docs/xxx    ← 문서 작업
```

### 1.2 브랜치 네이밍 규칙

```
<type>/<간결한-설명>
```

| 접두사 | 용도 | 예시 |
|---|---|---|
| `feat/` | 새로운 기능 | `feat/vehicle-detail-panel` |
| `fix/` | 버그 수정 | `fix/worker-memory-leak` |
| `refactor/` | 코드 구조 개선 | `refactor/layer-abstraction` |
| `perf/` | 성능 최적화 | `perf/interpolation-typed-array` |
| `docs/` | 문서 작업 | `docs/api-setup-guide` |
| `chore/` | 빌드/설정 변경 | `chore/vite-config-update` |

**규칙:**
- 영문 소문자 + 하이픈(`-`) 구분
- 최대 40자 이내
- 이슈 번호가 있으면 포함: `feat/123-vehicle-layer`

---

## 2. 커밋 메시지 컨벤션

### 2.1 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 2.2 Type

| 타입 | 설명 |
|---|---|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 기능 변경 없는 코드 구조 개선 |
| `perf` | 성능 개선 |
| `style` | 포맷팅, 세미콜론 등 (코드 동작 변화 없음) |
| `docs` | 문서 변경 |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드 스크립트, 패키지 설정 등 |
| `ci` | CI/CD 설정 변경 |

### 2.3 Scope (선택)

| 스코프 | 대상 |
|---|---|
| `map` | MapView, 베이스맵 관련 |
| `layer` | Deck.gl 레이어 |
| `worker` | Web Worker |
| `store` | Zustand 스토어 |
| `ui` | React UI 컴포넌트 |
| `api` | API 통신 레이어 |
| `script` | 빌드 스크립트 |

### 2.4 예시

```bash
# 기능 추가
feat(layer): add TripsLayer for vehicle route animation

# 버그 수정
fix(worker): resolve memory leak in interpolation loop

# 성능 개선
perf(worker): switch to SharedArrayBuffer for position data transfer

# 리팩토링
refactor(store): split monolithic store into ui and simulation stores

# 문서
docs: update API key setup instructions in DEVELOPMENT.md
```

### 2.5 규칙
- subject는 **영문 소문자**로 시작, 마침표 없음
- subject는 **50자 이내**, 명령형(imperative) 어조
- body는 선택 사항, **72자** 줄 바꿈
- 이슈 참조: footer에 `Closes #123` 또는 `Refs #456`

---

## 3. 작업 흐름

### 3.1 기능 개발 플로우

```
1. develop 브랜치에서 새 브랜치 생성
   git checkout develop
   git pull origin develop
   git checkout -b feat/vehicle-detail-panel

2. 작업 수행 및 커밋
   git add <files>
   git commit -m "feat(ui): add vehicle detail panel component"

3. develop에 머지 (PR 권장)
   git checkout develop
   git merge feat/vehicle-detail-panel

4. 브랜치 정리
   git branch -d feat/vehicle-detail-panel
```

### 3.2 릴리스 플로우

```
1. develop → main 머지
   git checkout main
   git merge develop

2. 태그 생성
   git tag v0.1.0
   git push origin main --tags
```

---

## 4. 태그/버전 규칙

**Semantic Versioning (SemVer)** 적용:

```
v<major>.<minor>.<patch>
```

| 단계 | 버전 | 내용 |
|---|---|---|
| MVP | `v0.1.0` | 3D 맵 + 기본 차량 렌더링 |
| 시뮬레이션 | `v0.2.0` | Worker 보간 + 타임라인 재생 |
| 인터랙션 | `v0.3.0` | 차량 상세, 필터, 통계 패널 |
| 최적화 | `v0.4.0` | 성능 튜닝 + 100대 안정화 |
| 릴리스 | `v1.0.0` | 포트폴리오 공개 버전 |

---

## 5. .gitignore 핵심 항목

```gitignore
node_modules/
dist/
.env.local
.env.*.local
*.log
.DS_Store
```

> `public/data/routes/*.json`은 **커밋에 포함**한다 (사전 추출된 정적 데이터).
