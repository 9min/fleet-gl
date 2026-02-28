# 🚚 logi-twin-web

> 3D 실시간 물류 관제 대시보드 - 100대 차량 60fps 시뮬레이션

실시간 차량 추적, 경로 시각화, 지오펜스 알림, 배송 분석을 제공하는 고성능 물류 모니터링 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🎯 핵심 기능
- **실시간 차량 추적**: 100대 이상의 차량을 60fps로 부드럽게 애니메이션
- **3D 지도 시각화**: Deck.gl + MapLibre 기반 고품질 3D 렌더링
- **Web Worker 아키텍처**: 메인 스레드 Zero-blocking으로 UI 응답성 보장
- **고성능 보간 엔진**: Transferable Objects를 활용한 제로카피 데이터 전송

### 🎨 포트폴리오 업그레이드 (8단계)

1. **다크/라이트 테마**
   - 시스템 테마 자동 감지
   - CSS 변수 기반 테마 시스템
   - 라이트/다크 맵 스타일 자동 전환

2. **경로 상세 정보**
   - PathLayer를 통한 전체 경로 시각화
   - 웨이포인트 ScatterplotLayer 표시
   - RouteProgress 타임라인 컴포넌트

3. **히트맵 시각화**
   - @deck.gl/aggregation-layers 기반 HeatmapLayer
   - 차량 밀집도 실시간 분석
   - LayerToggle 패널로 레이어 제어

4. **지오펜스 관리**
   - 40개 존(허브/제한구역/배송지역)
   - Point-in-Polygon 충돌 감지
   - Toast 알림 시스템

5. **분석 대시보드**
   - Recharts 기반 4개 차트 (Area/Bar/Pie/Line)
   - 배송 트렌드, 상태 분포, 지연 분석
   - React.memo 최적화로 1Hz 샘플링

6. **WebSocket 시뮬레이션**
   - MockWebSocket 서비스
   - EventLog 실시간 이벤트 표시
   - ConnectionStatus 모니터링

7. **반응형 디자인**
   - BottomSheet 모바일 UI
   - MobileKPIBar 터치 최적화
   - MobileTimeline 제스처 지원

8. **데이터 내보내기**
   - PNG 캔버스 합성 스크린샷
   - CSV 내보내기 (차량/플릿/이벤트)
   - ExportMenu 드롭다운

## 🛠 기술 스택

### 프론트엔드
- **React 18.3** - UI 프레임워크
- **TypeScript 5.7** - 타입 안전성
- **Vite 6.1** - 빌드 도구 및 개발 서버
- **Tailwind CSS v4** - 스타일링 (`@theme` 블록 활용)

### 지도 & 3D
- **Deck.gl 9.1/9.2** - WebGL 기반 대규모 데이터 시각화
- **MapLibre GL JS 4.7** - 오픈소스 벡터 타일 렌더링
- **react-map-gl 7** - React 맵 컴포넌트

### 상태 관리
- **Zustand 5** - 경량 상태 관리 (`create<T>()(...)` 문법)
- **Web Worker** - CPU 집약 연산 오프로드

### 차트 & 분석
- **Recharts 2** - 반응형 차트 라이브러리

### 다국어
- **i18next 25** - 국제화 프레임워크
- **react-i18next 16** - React 바인딩

### 개발 도구
- **ESLint 9** - 코드 품질 검증
- **Vitest 4** - 단위 테스트 프레임워크
- **@testing-library/react** - 컴포넌트 테스팅

## 📁 프로젝트 구조

```
fleet-gl/
├── src/
│   ├── api/                 # 타일 설정 (다크/라이트 스타일)
│   │   └── vworld/tileConfig.ts
│   ├── components/          # React UI 컴포넌트 (32개 파일)
│   │   ├── alert/          # Toast, ToastContainer
│   │   ├── analytics/      # AnalyticsPanel, 차트 4개
│   │   ├── filter/         # FilterControls
│   │   ├── layout/         # Header, Layout, Sidebar, LoadingScreen, ShortcutGuide
│   │   ├── map/            # MapView, DeckGLOverlay, LayerToggle, MapControls, VehicleTooltip
│   │   ├── mobile/         # BottomSheet, MobileKPIBar, MobileTimeline
│   │   ├── panel/          # StatsPanel, VehicleDetail, KPIBar, ExportMenu, EventLog,
│   │   │                   # ConnectionStatus, RouteProgress, PerformanceOverlay, AnimatedNumber
│   │   └── timeline/       # Timeline, PlaybackControls
│   ├── constants/           # 맵 설정 상수 (map.ts)
│   ├── hooks/              # 커스텀 훅 (11개)
│   │   ├── useVehicleData.ts
│   │   ├── useInterpolation.ts
│   │   ├── useDeckLayers.ts
│   │   ├── useGeofenceAlerts.ts
│   │   ├── useGeofenceData.ts
│   │   ├── useAnalytics.ts
│   │   ├── useWebSocket.ts
│   │   ├── useIsMobile.ts
│   │   ├── useSystemTheme.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   └── usePerformanceMonitor.ts
│   ├── i18n.ts             # i18next 설정
│   ├── layers/             # Deck.gl 레이어 팩토리 (6개)
│   │   ├── vehicleLayer.ts
│   │   ├── tripsLayer.ts
│   │   ├── labelLayer.ts
│   │   ├── routeDetailLayer.ts
│   │   ├── heatmapLayer.ts
│   │   └── geofenceLayer.ts
│   ├── services/           # MockWebSocket
│   ├── stores/             # Zustand 스토어 (5개)
│   │   ├── uiStore.ts
│   │   ├── simulationStore.ts
│   │   ├── themeStore.ts
│   │   ├── alertStore.ts
│   │   └── analyticsStore.ts
│   ├── types/              # TypeScript 타입 정의 (7개)
│   │   ├── vehicle.ts
│   │   ├── route.ts
│   │   ├── routeDetail.ts
│   │   ├── geofence.ts
│   │   ├── analytics.ts
│   │   ├── websocket.ts
│   │   └── simulation.ts
│   ├── utils/              # 유틸리티 함수 (6개)
│   │   ├── geo.ts
│   │   ├── format.ts
│   │   ├── truckMesh.ts
│   │   ├── pointInPolygon.ts
│   │   ├── exportPng.ts
│   │   └── exportCsv.ts
│   ├── workers/            # Web Worker 로직
│   │   ├── interpolation.worker.ts
│   │   └── types.ts
│   ├── App.tsx
│   └── main.tsx
├── scripts/
│   ├── extract-routes.ts        # 카카오 API로 실제 경로 추출
│   ├── generateMockRoutes.ts    # 100개 차량 경로 생성
│   └── generateGeofences.ts     # 40개 지오펜스 존 생성
├── public/
│   └── routes/                  # 생성된 경로 JSON (100개)
├── CLAUDE.md                    # AI 코딩 컨텍스트
└── package.json
```

## 🧪 테스트

19개 테스트 파일 (총 146개 테스트):

```bash
# 단위 테스트 실행
npm run test

# watch 모드로 테스트
npm run test:watch

# 타입 체크
npm run type-check

# 린트 검사
npm run lint
```

## 🚀 시작하기

### 사전 요구사항
- Node.js 18+
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/9min/fleet-gl.git
cd fleet-gl

# 의존성 설치
npm install
```

### 환경 변수 설정

`.env` 파일을 루트에 생성하고 필요한 경우 API 키를 설정합니다:

```env
VITE_VWORLD_API_KEY=your_api_key_here  # (선택사항, 미설정 시 OpenFreeMap 벡터 타일 사용)
```

### 모의 데이터 생성

```bash
# 100개 차량 경로 생성
npx tsx scripts/generateMockRoutes.ts

# 40개 지오펜스 존 생성
npx tsx scripts/generateGeofences.ts
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:5173 을 엽니다.

### 빌드

```bash
# 타입 체크 + 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## ⚡ 성능 최적화 전략

### 1. 좌표 데이터 격리
```typescript
// ❌ BAD: React 상태로 관리 → 매 프레임 리렌더
const [vehicles, setVehicles] = useState<Vehicle[]>([]);

// ✅ GOOD: Worker → Deck.gl 직접 전달
worker.postMessage({ type: 'TICK' });
worker.onmessage = (e) => {
  deckglOverlay.setProps({ data: e.data.buffer });
};
```

### 2. Transferable Objects 활용
```typescript
// Float64Array로 제로카피 전송
const buffer = new Float64Array(vehicleCount * 5);
// [lng, lat, bearing, speed, status] * 100

worker.postMessage(
  { type: 'POSITIONS', buffer: buffer.buffer },
  [buffer.buffer]  // Transferable로 소유권 이전
);
```

### 3. 레이어 업데이트 최적화
```typescript
new ScatterplotLayer({
  id: 'vehicles',
  data: vehiclePositions,  // 참조 변경 시만 업데이트
  updateTriggers: {
    getColor: [filterState],  // 조건부 accessor 재실행
  },
});
```

### 4. 선택적 Zustand 구독
```typescript
// ❌ 전체 스토어 구독
const store = useSimulationStore();

// ✅ 필요한 필드만 구독
const isPlaying = useSimulationStore((s) => s.isPlaying);
```

## 📖 개발 가이드

### 코딩 규칙
- **TypeScript strict 모드** 필수 (`any` 금지)
- **Web Worker에 React 의존 금지**
- **레이어 팩토리 패턴** 사용
- **Import 순서**: 외부 라이브러리 → 내부 모듈 → 상대 경로

### 파일 네이밍
- 컴포넌트: `PascalCase.tsx` (예: `StatsPanel.tsx`)
- 훅: `camelCase.ts` (예: `useVehicleData.ts`)
- Worker: `*.worker.ts` (예: `interpolation.worker.ts`)

### 모듈 의존성 규칙
```
types/      → 외부 의존 없음
constants/  → types만
utils/      → types, constants만
workers/    → types, constants, utils만 (React 금지)
stores/     → types만
layers/     → types, constants만
hooks/      → 모든 내부 모듈
components/ → 모든 내부 모듈
```

자세한 내용은 [CLAUDE.md](./CLAUDE.md)를 참조하세요.

## 🎯 성능 벤치마크

- **차량 수**: 100대
- **프레임레이트**: 60fps 안정적 유지
- **메모리 사용량**: ~150MB (Steady State)
- **보간 레이턴시**: <1ms (Worker 내부)
- **UI 반응성**: 메인 스레드 blocking 없음

## 🗺 사용된 맵 타일

- **벡터 타일**: OpenFreeMap (무료 오픈소스)
- **커스텀 스타일**: 다크/라이트 테마별 최적화
- **3D 빌딩**: Extrusion 레이어 활용

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🙏 감사의 말

- [Deck.gl](https://deck.gl) - 강력한 WebGL 시각화 프레임워크
- [MapLibre](https://maplibre.org) - 오픈소스 맵 렌더링
- [OpenFreeMap](https://openfreemap.org) - 무료 벡터 타일 제공
- [Recharts](https://recharts.org) - React 차트 라이브러리
- [Zustand](https://zustand-demo.pmnd.rs/) - 미니멀한 상태 관리

---

**Built with ❤️ using React + Deck.gl + Web Workers**
