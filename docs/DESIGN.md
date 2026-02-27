# DESIGN.md - UI/UX 설계

## 1. 화면 흐름도 (User Flow)

```
[앱 진입]
    │
    ▼
[초기 로딩 화면]
    │  경로 데이터 fetch + Worker 초기화
    ▼
[메인 대시보드] ◄──────────────────────────────────┐
    │                                              │
    ├─→ [3D 맵 인터랙션]                            │
    │     ├─ 회전 / 줌 / 틸트                       │
    │     ├─ 차량 클릭 → [차량 상세 패널 열기]       │
    │     │                  ├─ 경로 하이라이트       │
    │     │                  ├─ 상세 정보 표시        │
    │     │                  └─ 닫기 → [메인 대시보드]┘
    │     └─ 빈 영역 클릭 → 패널 닫기
    │
    ├─→ [타임라인 조작]
    │     ├─ 재생 / 일시정지
    │     ├─ 배속 변경 (1x/2x/4x/8x)
    │     └─ 슬라이더 드래그 → 특정 시점 이동
    │
    ├─→ [필터 조작]
    │     ├─ 상태별 필터 (운행 중/대기/완료)
    │     ├─ 차량 ID 검색
    │     └─ 필터 적용 → 맵 + 통계 동시 갱신
    │
    └─→ [통계 패널 확인]
          └─ 실시간 수치 자동 갱신 (시뮬레이션 시간 연동)
```

---

## 2. 레이아웃 설계

### 2.1 데스크톱 (1920x1080+)

```
┌─[Header]──────────────────────────────────────────────────────┐
│ 🚛 logi-twin    │  필터: [상태 ▼] [차량 검색...]  │ ⏵ 2x 4x 8x │
├───────────────────┬───────────────────────────────────────────┤
│                   │                                           │
│   [3D Map]        │  ┌─[Stats Panel]──────────────────────┐  │
│                   │  │  총 차량    120                     │  │
│   전체 화면의      │  │  운행 중     87  ━━━━━━━━░░  72%   │  │
│   약 75% 영역     │  │  대기        20  ━━░░░░░░░░  17%   │  │
│                   │  │  완료        13  ━░░░░░░░░░  11%   │  │
│                   │  │  총 진행률   ━━━━━━━░░░  42%       │  │
│                   │  └────────────────────────────────────┘  │
│                   │                                           │
│                   │  ┌─[Vehicle Detail]─────────────────┐    │
│                   │  │  (차량 클릭 시 표시)              │    │
│                   │  │  차량: V-042                      │    │
│                   │  │  상태: 운행 중                    │    │
│                   │  │  진행: 18/30 경유지               │    │
│                   │  │  속도: 45 km/h                   │    │
│                   │  │  ETA: 17:42                      │    │
│                   │  └──────────────────────────────────┘    │
├───────────────────┴───────────────────────────────────────────┤
│ [Timeline] ◀ ▶ ━━━━━━━━━━━●━━━━━━━━━━━━━  14:32 / 22:00     │
└───────────────────────────────────────────────────────────────┘
```

### 2.2 태블릿 (1024x768)

```
┌─[Header]──────────────────────────────┐
│ 🚛 logi-twin │ [≡ 필터] │ ⏵ 2x 4x   │
├───────────────────────────────────────┤
│                                       │
│          [3D Map]                     │
│          전체 화면                     │
│                                       │
│  ┌─[Stats]──────┐                    │
│  │ 120 | 87 | 13│  (오버레이 축약)    │
│  └──────────────┘                    │
│                                       │
├───────────────────────────────────────┤
│ [Timeline] ◀▶ ━━━━●━━━━ 14:32       │
└───────────────────────────────────────┘

[차량 클릭 시] → 하단 시트(Bottom Sheet)로 상세 표시
[필터 클릭 시] → 서랍(Drawer)으로 필터 패널 표시
```

---

## 3. 주요 컴포넌트 구조

### 3.1 컴포넌트 트리

```
<App>
  <Layout>
    <Header>
      <Logo />
      <FilterControls />
      <PlaybackControls />
    </Header>
    <Main>
      <MapView>                    ← Deck.gl + MapLibre (React 리렌더와 독립)
        <DeckGLOverlay />          ← vehicleLayer + tripsLayer + buildingLayer
        <MapLibreBase />           ← V-World 위성영상 베이스맵
      </MapView>
      <StatsPanel />               ← Zustand 구독 (simulationStore)
      <VehicleDetail />            ← Zustand 구독 (uiStore.selectedVehicle)
    </Main>
    <Timeline />                   ← Zustand 구독 (simulationStore)
  </Layout>
</App>
```

### 3.2 컴포넌트 책임 명세

| 컴포넌트 | 책임 | 상태 구독 | 리렌더 빈도 |
|---|---|---|---|
| `MapView` | Deck.gl + MapLibre 컨테이너 관리 | 없음 (명령형 업데이트) | 초기 1회 |
| `DeckGLOverlay` | 레이어 구성 및 갱신 | 없음 (ref 기반 업데이트) | 필터 변경 시만 |
| `Header` | 상단 네비게이션 바 | 없음 | 거의 없음 |
| `FilterControls` | 차량/상태 필터 UI | `uiStore.filters` | 필터 조작 시 |
| `PlaybackControls` | 재생/정지/배속 버튼 | `simulationStore.playState` | 재생 상태 변경 시 |
| `StatsPanel` | 배송 현황 통계 표시 | `simulationStore.stats` | ~1초 간격 |
| `VehicleDetail` | 선택 차량 상세 정보 | `uiStore.selectedVehicle` | 차량 선택/해제 시 |
| `Timeline` | 시간축 슬라이더 | `simulationStore.currentTime` | ~1초 간격 |

---

## 4. Zustand 상태 관리 전략

### 4.1 설계 원칙

1. **좌표 데이터는 스토어에 넣지 않는다** — 초당 60회 변경되는 차량 위치는 Zustand를 거치지 않고 Worker → Deck.gl로 직접 전달
2. **UI 상태만 Zustand로 관리** — 필터, 선택 차량, 재생 상태 등 사용자 인터랙션 상태만
3. **선택적 구독(Selector)** — 각 컴포넌트는 필요한 상태 조각만 구독하여 불필요한 리렌더 방지
4. **스토어 분리** — 관심사별로 스토어를 분리하여 교차 리렌더 차단

### 4.2 스토어 설계

#### `uiStore` — UI 인터랙션 상태

```typescript
interface UIState {
  // 차량 선택
  selectedVehicleId: string | null;
  selectVehicle: (id: string | null) => void;

  // 필터
  filters: {
    status: VehicleStatus[];    // ['running', 'idle', 'completed']
    searchQuery: string;         // 차량 ID 검색
  };
  setStatusFilter: (status: VehicleStatus[]) => void;
  setSearchQuery: (query: string) => void;

  // 사이드 패널
  isPanelOpen: boolean;
  togglePanel: () => void;
}
```

#### `simulationStore` — 시뮬레이션 제어 상태

```typescript
interface SimulationState {
  // 재생 제어
  isPlaying: boolean;
  playbackSpeed: 1 | 2 | 4 | 8;
  currentTime: number;           // 시뮬레이션 시간 (초)
  totalDuration: number;         // 전체 시뮬레이션 길이

  // 통계 (Worker에서 주기적 업데이트, ~1초 간격)
  stats: {
    totalVehicles: number;
    running: number;
    idle: number;
    completed: number;
    progressPercent: number;
    totalDistance: number;
  };

  // 액션
  play: () => void;
  pause: () => void;
  setSpeed: (speed: 1 | 2 | 4 | 8) => void;
  seek: (time: number) => void;
  updateStats: (stats: SimulationStats) => void;
  updateCurrentTime: (time: number) => void;
}
```

### 4.3 상태 업데이트 흐름

```
[고빈도 데이터 - React 바이패스]
Worker 보간 결과 (60fps)
  → Float64Array (Transferable)
  → Deck.gl layer.data 직접 교체
  → WebGL 드로우 콜만 발생 (React 무관)

[저빈도 데이터 - Zustand 경유]
Worker 통계 업데이트 (~1초)
  → postMessage({ type: 'STATS', stats })
  → simulationStore.updateStats(stats)
  → 구독 중인 StatsPanel만 리렌더

[사용자 이벤트 - Zustand 경유]
필터 변경 / 차량 클릭
  → uiStore 업데이트
  → 구독 중인 컴포넌트만 리렌더
  → 필요 시 Deck.gl 레이어 필터 반영
```

### 4.4 구독 패턴 예시

```typescript
// 나쁜 예: 전체 스토어 구독 → 모든 변경에 리렌더
const state = useSimulationStore();

// 좋은 예: 필요한 값만 선택적 구독
const isPlaying = useSimulationStore((s) => s.isPlaying);
const stats = useSimulationStore((s) => s.stats);
```

---

## 5. 색상 및 시각 스타일

### 5.1 컬러 팔레트

| 용도 | 색상 | HEX |
|---|---|---|
| 배경 (다크) | 네이비 블랙 | `#0F1923` |
| 카드 배경 | 다크 그레이 | `#1A2332` |
| 주요 강조 | 시안 블루 | `#00D4FF` |
| 보조 강조 | 일렉트릭 그린 | `#00FF88` |
| 경고 | 앰버 | `#FFB800` |
| 위험 | 코랄 레드 | `#FF4757` |
| 텍스트 (기본) | 화이트 | `#E8ECF1` |
| 텍스트 (보조) | 라이트 그레이 | `#8892A0` |

### 5.2 디자인 방향
- **다크 테마 기본** — 관제 시스템 특성상 장시간 모니터링에 적합
- **글래스모피즘** — 패널에 반투명 배경 + backdrop-blur 적용으로 맵 위 자연스러운 오버레이
- **최소 그림자, 최대 대비** — 핵심 데이터의 가시성 우선
- **모노스페이스 숫자** — 통계 수치는 모노스페이스 폰트로 정렬감 유지

---

## 6. 차량 상태 시각화

### 6.1 차량 아이콘 색상 매핑

| 상태 | 색상 | 설명 |
|---|---|---|
| 운행 중 (running) | `#00D4FF` 시안 | 정상 운행 중인 차량 |
| 대기 (idle) | `#FFB800` 앰버 | 경유지에서 하역/대기 중 |
| 완료 (completed) | `#00FF88` 그린 | 전체 배송 완료 |
| 지연 (delayed) | `#FF4757` 레드 | 예상 시간 초과 |

### 6.2 경로 시각화

- **이동 완료 구간**: 불투명한 메인 컬러 (`#00D4FF`)
- **미이동 구간**: 반투명 점선 (`#00D4FF` 30% opacity)
- **선택 차량 경로**: 두께 증가 + 글로우 효과
- **비선택 차량 경로**: 낮은 불투명도로 배경 처리
