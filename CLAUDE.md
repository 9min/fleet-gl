# CLAUDE.md - AI 코딩 컨텍스트

> 이 파일은 Claude가 코드를 작성할 때 반드시 참조해야 하는 프로젝트 전역 규칙이다.

## 프로젝트 개요

- **프로젝트명**: logi-twin-web (3D 실시간 물류 관제 대시보드)
- **기술 스택**: React 18, Vite, TypeScript, Deck.gl, MapLibre GL JS, Zustand, Web Workers, Tailwind CSS
- **핵심 목표**: 100대+ 차량 60fps 시뮬레이션, 메인 스레드 Zero-blocking

---

## 절대 규칙 (위반 금지)

### 1. 좌표 데이터는 React 상태로 관리하지 않는다
- 차량 위치 좌표(60fps 갱신)는 Zustand 스토어나 React useState에 **절대** 넣지 않는다
- Worker → Deck.gl Layer로 **직접** 전달한다 (React 리렌더 바이패스)
- Zustand는 UI 상태(필터, 선택 차량, 재생 제어)만 관리한다

### 2. CPU 집약 연산은 Web Worker에서만 수행한다
- 차량 위치 보간(interpolation) → Worker
- 경로 데이터 파싱/전처리 → Worker
- 배송 상태 계산 → Worker
- 메인 스레드에서 `for` 루프로 100대 차량 좌표를 계산하는 코드를 작성하면 안 된다

### 3. 모듈 경계를 지킨다
```
src/api/       → 외부 API 통신만
src/layers/    → Deck.gl 레이어 정의만
src/workers/   → Web Worker 로직만
src/stores/    → Zustand 스토어만
src/components/→ React UI만
```
- 디렉토리 간 순환 의존 금지
- 각 모듈은 `types/` 디렉토리의 공유 타입을 통해서만 소통

---

## 성능 원칙

### Deck.gl 레이어 최적화

```typescript
// GOOD: data 참조가 변경될 때만 레이어 업데이트
new ScatterplotLayer({
  id: 'vehicles',
  data: vehiclePositions,  // 새 배열 참조일 때만 업데이트 트리거
  updateTriggers: {
    getColor: [filterState],  // 필터 변경 시만 색상 재계산
  },
});

// BAD: 매 프레임 불필요한 객체 생성
new ScatterplotLayer({
  data: vehiclePositions,
  getColor: (d) => statusColors[d.status],  // updateTriggers 없이 사용
});
```

### 레이어 업데이트 전략
- **매 프레임 업데이트**: `data` 속성만 교체 (Transferable/SharedArrayBuffer)
- **조건부 업데이트**: `updateTriggers`로 필터/스타일 변경 시만 accessor 재실행
- **정적 레이어**: 건물, 지형 등은 초기 로드 후 변경 없음

### Web Worker 통신

```typescript
// GOOD: Transferable Objects로 제로카피 전송
const buffer = new Float64Array(vehicleCount * 3);  // [lng, lat, bearing] * N
worker.postMessage({ type: 'POSITIONS', buffer: buffer.buffer }, [buffer.buffer]);

// BAD: 구조화된 객체 직렬화 (느림)
worker.postMessage({ type: 'POSITIONS', vehicles: [{lng: 126.9, lat: 37.3}, ...] });
```

### React 리렌더 방지

```typescript
// GOOD: 선택적 구독
const isPlaying = useSimulationStore((s) => s.isPlaying);

// BAD: 전체 스토어 구독
const store = useSimulationStore();

// GOOD: 콜백 안정화
const handleClick = useCallback((id: string) => {
  uiStore.getState().selectVehicle(id);
}, []);

// BAD: 매 렌더마다 새 함수
const handleClick = (id: string) => selectVehicle(id);
```

---

## 코딩 스타일

### TypeScript
- `strict: true` 모드 필수
- `any` 타입 사용 금지 — `unknown`으로 대체 후 타입 가드 사용
- 공유 타입은 `src/types/`에 정의, 로컬 타입은 해당 파일 내 정의
- 인터페이스보다 `type` 선호 (일관성 유지)

### 파일 네이밍
- 컴포넌트: `PascalCase.tsx` (예: `StatsPanel.tsx`)
- 훅: `camelCase.ts` (예: `useVehicleData.ts`)
- 유틸리티/상수: `camelCase.ts` (예: `geo.ts`)
- Worker: `*.worker.ts` (예: `interpolation.worker.ts`)
- 타입: `camelCase.ts` (예: `vehicle.ts`)

### 컴포넌트 작성
- 함수 컴포넌트 + 화살표 함수
- Props 타입은 컴포넌트 파일 내 정의
- `React.FC` 사용하지 않음 — 명시적 반환 타입 또는 추론에 의존
- 조건부 렌더링: 삼항 연산자보다 early return 선호

```typescript
// 컴포넌트 패턴
type StatsPanelProps = {
  className?: string;
};

const StatsPanel = ({ className }: StatsPanelProps) => {
  const stats = useSimulationStore((s) => s.stats);

  return (
    <div className={className}>
      {/* ... */}
    </div>
  );
};

export default StatsPanel;
```

### Import 순서
```typescript
// 1. React/외부 라이브러리
import { useCallback } from 'react';
import { ScatterplotLayer } from '@deck.gl/layers';

// 2. 내부 모듈 (절대 경로)
import { useSimulationStore } from '@/stores/simulationStore';
import type { Vehicle } from '@/types/vehicle';

// 3. 상대 경로 (같은 디렉토리 내)
import { formatSpeed } from './utils';
```

---

## Deck.gl 레이어 작성 규칙

### 레이어 파일 구조
```typescript
// src/layers/vehicleLayer.ts

import { ScatterplotLayer } from '@deck.gl/layers';
import type { VehiclePosition } from '@/types/vehicle';

// 레이어 설정 상수
const VEHICLE_RADIUS = 80;
const VEHICLE_RADIUS_MIN_PIXELS = 4;

// 상태별 색상 매핑
const STATUS_COLORS: Record<string, [number, number, number]> = {
  running: [0, 212, 255],    // #00D4FF
  idle: [255, 184, 0],       // #FFB800
  completed: [0, 255, 136],  // #00FF88
  delayed: [255, 71, 87],    // #FF4757
};

// 레이어 팩토리 함수
export const createVehicleLayer = (
  data: VehiclePosition[],
  options: { selectedId?: string | null; filters?: string[] }
) => {
  return new ScatterplotLayer<VehiclePosition>({
    id: 'vehicle-layer',
    data,
    getPosition: (d) => [d.lng, d.lat],
    getRadius: VEHICLE_RADIUS,
    radiusMinPixels: VEHICLE_RADIUS_MIN_PIXELS,
    getColor: (d) => STATUS_COLORS[d.status] ?? STATUS_COLORS.running,
    pickable: true,
    updateTriggers: {
      getColor: [options.filters],
    },
  });
};
```

---

## Worker 작성 규칙

### 메시지 프로토콜
```typescript
// src/workers/types.ts

// Main → Worker 메시지
type WorkerInMessage =
  | { type: 'INIT'; routes: RouteData[] }
  | { type: 'TICK'; currentTime: number; speed: number }
  | { type: 'SEEK'; targetTime: number };

// Worker → Main 메시지
type WorkerOutMessage =
  | { type: 'READY' }
  | { type: 'POSITIONS'; buffer: ArrayBuffer }   // Transferable
  | { type: 'STATS'; stats: SimulationStats };
```

### Worker 내부 원칙
- 전역 상태를 Worker 스코프에 유지 (매 프레임 재할당 금지)
- TypedArray를 사전 할당하고 재사용
- `console.log`는 디버그 모드에서만 (`__DEV__` 플래그)

---

## 디렉토리별 의존성 규칙

```
src/types/      → 외부 의존 없음 (순수 타입)
src/constants/  → types만 import 가능
src/utils/      → types, constants만 import 가능
src/api/        → types, constants, utils만 import 가능
src/workers/    → types, constants, utils만 import 가능 (React 의존 금지)
src/stores/     → types만 import 가능
src/layers/     → types, constants만 import 가능 (React 의존 금지)
src/hooks/      → types, stores, workers, layers import 가능
src/components/ → 모든 내부 모듈 import 가능
```

---

## 환경변수

| 변수 | 접두사 | 용도 | 클라이언트 노출 |
|---|---|---|---|
| `VITE_VWORLD_API_KEY` | `VITE_` | V-World 위성 타일 (선택사항, 미설정 시 OpenFreeMap 벡터 타일 사용) | O |
| `KAKAO_REST_API_KEY` | 없음 | 경로 추출 스크립트 전용 (빌드 타임만 사용) | X |

---

## 빌드/실행 명령어

```bash
npm run dev            # 개발 서버 (localhost:5173)
npm run build          # 프로덕션 빌드 (tsc -b && vite build)
npm run preview        # 빌드 미리보기
npm run lint           # ESLint
npm run type-check     # TypeScript 타입 검사
npm run test           # Vitest 테스트 실행
npm run test:watch     # Vitest watch 모드
npm run extract-routes # 카카오 API로 실제 경로 데이터 추출
```
