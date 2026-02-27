# DEVELOPMENT.md - 개발 환경 구축 가이드

## 1. 사전 요구사항

| 도구 | 최소 버전 | 확인 명령 |
|---|---|---|
| Node.js | 18.0+ (LTS 권장) | `node -v` |
| npm | 9.0+ (또는 pnpm 8+) | `npm -v` |
| Git | 2.30+ | `git -v` |
| 브라우저 | Chrome 최신 | WebGL 2.0 지원 필수 |

---

## 2. 프로젝트 초기 설정

### 2.1 저장소 클론 및 의존성 설치

```bash
git clone https://github.com/<owner>/logi-twin-web.git
cd logi-twin-web
npm install
```

### 2.2 환경변수 설정

`.env.example`을 복사하여 `.env.local` 파일을 생성한다.

```bash
cp .env.example .env.local
```

`.env.local` 파일에 실제 API 키를 입력:

```env
# V-World Open API
VITE_VWORLD_API_KEY=your_vworld_api_key_here

# 카카오모빌리티 (경로 추출 스크립트 전용, 빌드 타임만 사용)
KAKAO_REST_API_KEY=your_kakao_rest_api_key_here
```

> **주의**: `.env.local`은 `.gitignore`에 포함되어 있어 커밋되지 않는다.
> `VITE_` 접두사가 붙은 변수만 클라이언트 번들에 포함된다.
> `KAKAO_REST_API_KEY`는 `VITE_` 접두사가 없으므로 클라이언트에 노출되지 않는다.

### 2.3 API 키 발급 방법

#### V-World API 키
1. [V-World 오픈 API](https://www.vworld.kr/dev/v4api.do) 접속
2. 회원가입 후 "인증키 발급" 메뉴에서 키 발급
3. 사용 도메인: `localhost` 및 배포 도메인 등록

#### 카카오모빌리티 API 키
1. [카카오 개발자](https://developers.kakao.com/) 접속
2. 애플리케이션 생성 후 "REST API 키" 확인
3. [카카오모빌리티](https://developers.kakaomobility.com/) 에서 길찾기 API 사용 신청

---

## 3. 개발 서버 실행

### 3.1 기본 실행

```bash
npm run dev
```

기본 포트: `http://localhost:5173`

### 3.2 사용 가능한 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | Vite 개발 서버 실행 (HMR 활성화) |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 프로덕션 빌드 미리보기 |
| `npm run lint` | ESLint 코드 검사 |
| `npm run type-check` | TypeScript 타입 검사 |
| `npm run extract-routes` | 카카오 API 경로 데이터 추출 스크립트 실행 |

---

## 4. 경로 데이터 추출 (빌드 타임)

카카오모빌리티 API에서 경로 데이터를 추출하여 로컬에 캐싱하는 과정이다. 이 작업은 최초 1회 또는 경로 갱신이 필요할 때만 수행한다.

### 4.1 추출 실행

```bash
npm run extract-routes
```

### 4.2 추출 결과
- `public/data/routes/` 디렉토리에 차량별 JSON 파일 생성
- 파일명 패턴: `vehicle-001.json`, `vehicle-002.json`, ...
- 이미 추출된 파일이 존재하면 해당 차량은 스킵 (강제 갱신: `--force` 플래그)

### 4.3 API 호출 제한 대응
- 스크립트 내부에 요청 간 딜레이 내장 (기본 500ms)
- 실패 시 자동 재시도 (최대 3회)
- 부분 실패 시 성공한 파일은 유지, 실패 목록 로그 출력

---

## 5. 프로젝트 구조 확인

```bash
# 디렉토리 구조 확인
ls src/

# 주요 디렉토리
src/
├── api/          # 외부 API 통신
├── components/   # React 컴포넌트
├── layers/       # Deck.gl 레이어
├── workers/      # Web Worker
├── stores/       # Zustand 스토어
├── hooks/        # 커스텀 훅
├── types/        # TypeScript 타입
├── utils/        # 유틸리티
└── constants/    # 상수
```

---

## 6. 개발 시 유의사항

### 6.1 WebGL 관련
- Chrome DevTools → Performance 탭에서 프레임 드롭 모니터링
- GPU 가속: `chrome://gpu`에서 WebGL 2.0 활성화 확인
- 메모리 누수: DevTools → Memory 탭에서 힙 스냅샷 주기적 확인

### 6.2 Web Worker 디버깅
- Chrome DevTools → Sources → Worker 스레드 선택하여 브레이크포인트 설정
- `console.log`는 Worker 내부에서도 메인 콘솔에 출력됨
- Vite의 `?worker` import 문법으로 Worker 파일 자동 번들링

### 6.3 환경별 차이
- **개발 모드**: Vite HMR 활성, 소스맵 포함, 미압축
- **프로덕션 모드**: Tree-shaking, 코드 스플리팅, 압축, 소스맵 분리

---

## 7. 트러블슈팅

| 증상 | 원인 | 해결 |
|---|---|---|
| 맵이 표시되지 않음 | V-World API 키 미설정 또는 도메인 미등록 | `.env.local` 확인, V-World에서 localhost 도메인 등록 |
| WebGL 컨텍스트 손실 | GPU 메모리 초과 | 브라우저 재시작, 타일 캐시 정리 |
| Worker 로드 실패 | Vite Worker import 구문 오류 | `import Worker from './worker?worker'` 형식 확인 |
| 경로 데이터 없음 | 추출 스크립트 미실행 | `npm run extract-routes` 실행 |
| CORS 오류 | V-World API 도메인 제한 | API 키에 해당 도메인 등록 또는 프록시 설정 |
