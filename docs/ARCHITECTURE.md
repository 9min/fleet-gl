# ARCHITECTURE.md - 시스템 아키텍처

## 1. 아키텍처 개요

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser (Main Thread)                  │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ React UI    │  │ Zustand      │  │ Deck.gl / MapLibre  │ │
│  │ Components  │←→│ Store        │←→│ WebGL Canvas        │ │
│  │ (통계,필터) │  │ (UI 상태만)  │  │ (3D 렌더링)         │ │
│  └─────────────┘  └──────┬───────┘  └──────────▲──────────┘ │
│                          │                      │            │
│                          │              ┌───────┴─────────┐  │
│                          │              │ AnimationLoop    │  │
│                          │              │ (requestAFrame)  │  │
│                          │              └───────▲──────────┘  │
│                          │                      │            │
├──────────────────────────┼──────────────────────┼────────────┤
│                    postMessage /          postMessage /       │
│                    Transferable          SharedArrayBuffer    │
├──────────────────────────┼──────────────────────┼────────────┤
│                     Web Worker Thread                        │
│                                                              │
│              ┌────────────────────────────────┐              │
│              │ Interpolation Engine            │              │
│              │ - 경로 좌표 보간 (60fps)        │              │
│              │ - 차량 위치/방향 계산            │              │
│              │ - 배송 상태 업데이트             │              │
│              └────────────────────────────────┘              │
└──────────────────────────────────────────────────────────────┘
                          ▲
                          │ fetch (정적 JSON)
                          ▼
              ┌────────────────────────┐
              │ Static Assets (CDN)    │
              │ /data/routes/*.json    │
              │ (사전 추출된 경로 데이터) │
              └────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                     External APIs (빌드 타임만)               │
│                                                              │
│  ┌─────────────────────┐    ┌──────────────────────────┐    │
│  │ 카카오모빌리티 API    │    │ V-World Open API          │    │
│  │ (경로 사전 추출)      │    │ (3D Tiles/DEM/위성영상)   │    │
│  └─────────────────────┘    └──────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. 핵심 설계 원칙

### 2.1 렌더링 독립성
Deck.gl 레이어 업데이트는 React 리렌더 사이클과 **완전히 분리**한다. 차량 좌표가 초당 60회 변경되더라도 React 컴포넌트 트리는 리렌더되지 않는다.

```
[좌표 데이터 흐름] - React 바이패스
Worker → SharedArrayBuffer/Transferable → Deck.gl Layer props 직접 업데이트

[UI 상태 흐름] - React 경유
사용자 입력 → Zustand → React 컴포넌트 리렌더 (필터, 통계 등)
```

### 2.2 연산 격리
CPU 집약적 연산은 반드시 Web Worker에서 수행한다:
- 100대+ 차량의 프레임별 위치 보간
- 경로 데이터 파싱 및 전처리
- 배송 상태 계산 (진행률, ETA 등)

### 2.3 모듈 경계
API 통신, WebGL 렌더링, Web Worker 로직은 각각 독립 디렉토리로 분리하며, 모듈 간 의존성은 명시적 인터페이스(TypeScript 타입)를 통해서만 허용한다.

---

## 3. 디렉토리 구조

```
logi-twin-web/
├── public/
│   └── data/
│       └── routes/              # 사전 추출된 경로 JSON 캐시
│           ├── vehicle-001.json
│           ├── vehicle-002.json
│           └── ...
├── scripts/
│   └── extract-routes.ts        # 카카오 API 경로 추출 스크립트
├── src/
│   ├── api/                     # 외부 API 통신 레이어
│   │   ├── kakao/
│   │   │   └── routeClient.ts   # 카카오모빌리티 API 클라이언트
│   │   └── vworld/
│   │       └── tileConfig.ts    # V-World 타일 URL/설정
│   ├── components/              # React UI 컴포넌트
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   ├── map/
│   │   │   ├── MapView.tsx      # Deck.gl + MapLibre 통합 뷰
│   │   │   └── MapControls.tsx  # 카메라 컨트롤
│   │   ├── panel/
│   │   │   ├── StatsPanel.tsx   # 실시간 통계 패널
│   │   │   └── VehicleDetail.tsx# 차량 상세 정보 패널
│   │   ├── timeline/
│   │   │   └── Timeline.tsx     # 타임라인 플레이백 UI
│   │   └── filter/
│   │       └── FilterControls.tsx# 차량/경로 필터링
│   ├── layers/                  # Deck.gl 레이어 정의
│   │   ├── vehicleLayer.ts      # 차량 아이콘 레이어
│   │   ├── tripsLayer.ts        # 경로 애니메이션 레이어
│   │   ├── buildingLayer.ts     # 3D 건물 레이어
│   │   └── terrainLayer.ts      # 지형 DEM 레이어
│   ├── workers/                 # Web Worker 로직
│   │   ├── interpolation.worker.ts  # 차량 위치 보간 엔진
│   │   └── types.ts             # Worker 메시지 타입 정의
│   ├── stores/                  # Zustand 상태 관리
│   │   ├── uiStore.ts           # UI 상태 (필터, 선택 차량 등)
│   │   ├── simulationStore.ts   # 시뮬레이션 제어 (재생/정지/배속)
│   │   └── types.ts             # 스토어 타입 정의
│   ├── hooks/                   # 커스텀 React Hooks
│   │   ├── useVehicleData.ts    # 경로 데이터 로딩
│   │   ├── useInterpolation.ts  # Worker 통신 훅
│   │   └── useDeckLayers.ts     # Deck.gl 레이어 구성 훅
│   ├── types/                   # 공유 TypeScript 타입
│   │   ├── vehicle.ts           # 차량 데이터 타입
│   │   ├── route.ts             # 경로 데이터 타입
│   │   └── simulation.ts        # 시뮬레이션 상태 타입
│   ├── utils/                   # 유틸리티 함수
│   │   ├── geo.ts               # 좌표 변환, 거리 계산
│   │   └── format.ts            # 데이터 포맷팅
│   ├── constants/               # 상수 정의
│   │   └── map.ts               # 맵 초기 설정, 줌 레벨 등
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example                 # 환경변수 템플릿
├── .env.local                   # 로컬 환경변수 (gitignore)
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── eslint.config.js
```

---

## 4. 데이터 파이프라인

### 4.1 빌드 타임: 경로 데이터 추출

```
[카카오모빌리티 API]
        │
        ▼
┌─────────────────────────┐
│ scripts/extract-routes.ts│
│                         │
│ 1. 차량별 출발지/경유지  │
│    /도착지 좌표 정의     │
│ 2. 다중 경유지 경로 요청 │
│ 3. 응답 polyline 디코딩  │
│ 4. 타임스탬프 보정       │
│ 5. JSON 파일로 저장      │
└──────────┬──────────────┘
           ▼
   public/data/routes/
   ├── vehicle-001.json
   │   {
   │     "vehicleId": "V-001",
   │     "waypoints": [...],
   │     "path": [
   │       { "lng": 126.93, "lat": 37.34, "timestamp": 0 },
   │       { "lng": 126.94, "lat": 37.35, "timestamp": 12 },
   │       ...
   │     ],
   │     "totalDistance": 87400,
   │     "estimatedDuration": 28800
   │   }
   └── ...
```

### 4.2 런타임: 시뮬레이션 데이터 흐름

```
Phase 1: 초기화
──────────────
App Mount → fetch(/data/routes/*.json) → Worker.postMessage({ type: 'INIT', routes })

Phase 2: 매 프레임 (60fps)
────────────────────────────
requestAnimationFrame
  → Worker.postMessage({ type: 'TICK', currentTime })
  → Worker 내부: 100대+ 차량 위치 보간 계산
  → Worker.postMessage({ type: 'POSITIONS', buffer }) [Transferable]
  → Deck.gl Layer data 갱신 (React 리렌더 없음)

Phase 3: UI 상태 변경 (사용자 이벤트 시만)
──────────────────────────────────────────
사용자 조작 → Zustand Store 업데이트 → 구독 중인 React 컴포넌트만 리렌더
```

---

## 5. 외부 API 연동 계획

### 5.1 V-World Open API

| 서비스 | 용도 | 연동 방식 |
|---|---|---|
| 3D Tiles | 건물 모델 렌더링 | Deck.gl Tile3DLayer로 직접 타일 URL 요청 |
| DEM | 지형 고도 표현 | TerrainLayer 또는 커스텀 메시로 고도 맵 적용 |
| 위성/항공 영상 | 베이스맵 배경 | MapLibre GL JS 래스터 타일 소스로 연동 |

**V-World 타일 URL 패턴:**
- 위성영상: `https://xdworld.vworld.kr/2d/Satellite/service/{z}/{x}/{y}.jpeg`
- 3D 데이터: V-World 3D 데이터 API 엔드포인트 활용

### 5.2 카카오모빌리티 API

| API | 용도 | 호출 시점 |
|---|---|---|
| 다중 경유지 경로 탐색 | 차량별 배송 경로 생성 | 빌드 타임 (스크립트) |

**Rate Limit 대응:**
- 일일 호출 제한 존재 → 추출 스크립트에 딜레이 삽입
- 한 번 추출한 데이터는 JSON으로 캐싱하여 재사용
- 경로 갱신이 필요한 경우에만 수동 재실행

---

## 6. 성능 최적화 전략

### 6.1 렌더링 최적화

| 기법 | 적용 대상 | 효과 |
|---|---|---|
| 인스턴스 렌더링 | 차량 아이콘 | 100대+ draw call을 단일 호출로 |
| 뷰포트 컬링 | 경로/차량 | 화면 밖 객체 렌더링 스킵 |
| LoD (Level of Detail) | 3D 건물 | 줌 레벨에 따른 디테일 조정 |
| 타일 캐싱 | V-World 타일 | 브라우저 캐시 + Service Worker |
| 레이어 가시성 | 전체 레이어 | 줌 레벨별 레이어 on/off |

### 6.2 메모리 최적화

| 기법 | 적용 대상 | 효과 |
|---|---|---|
| TypedArray | 좌표 데이터 | Float64Array로 GC 압력 감소 |
| Object Pool | Worker 메시지 | 객체 재사용으로 할당 최소화 |
| 지연 로딩 | 경로 데이터 | 뷰포트 진입 시 해당 차량 데이터만 로드 |

### 6.3 네트워크 최적화

| 기법 | 적용 대상 | 효과 |
|---|---|---|
| 코드 스플리팅 | React 컴포넌트 | 초기 로드 번들 최소화 |
| 프리로드 | 핵심 경로 데이터 | `<link rel="preload">` 활용 |
| gzip/Brotli | 정적 JSON | 경로 데이터 전송량 60%+ 감소 |
