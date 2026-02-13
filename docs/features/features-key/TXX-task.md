# TXX - AI 구현 작업 템플릿

> 목적: 이 문서는 **AI 에이전트(또는 엔지니어)가 한 PR에서 구현하는 작업 단위**입니다.
> `features/.../requirements.md`에서 파생되며 **즉시 구현 가능한 상태**여야 합니다.
>
> 사용 방법:
>
> 1. 이 파일을 `T01-...md`, `T02-...md` 등으로 복사하세요.
> 2. 해당되는 부분만 채우고, 빈 섹션은 제거하세요.
> 3. 범위는 한 PR(이상적으로 1~2일 이내)에 끝낼 수 있을 만큼 작게 유지하세요.

---

## 0. 메타데이터

- 기능 키: `YYYYMMDD-short-feature-name`
- 작업 ID: `TXX`
- 작업 제목:
- 담당자: AI / 엔지니어
- 작성일 (UTC):
- 원본 문서:
  - PRD: `features/.../PRD.md`
  - 요구사항: `features/.../requirements.md`
- 대상 애플리케이션:
  - [ ] `apps/web`
  - [ ] `apps/mobile`
  - [ ] `apps/electron`
  - [ ] `apps/storybook`
- 포함 도메인: (예: `workspace`, `chat`, `account`, `authn`, `registration`)
- 예상 PR 크기: S / M / L
- 기능 플래그: 예 / 아니오

---

## 1. 작업 목표 (구현 계약)

작은 계약처럼 작성하세요.

### 1.1 이 작업이 제공하는 것

- **사용자 가시적 결과**:
- **컴포넌트 변경**:
- **상태 변경**:
- **API 연동**:

### 1.2 이 작업이 하지 않는 것

- 이 PR의 명시적 비목표:

### 1.3 성공 기준

- 측정 가능한 결과(예: 테스트 통과, 컴포넌트 정상 렌더 등):

---

## 2. 입력 / 출력

명확하게 작성하세요.

### 2.1 입력

- 진입점: (페이지 / 컴포넌트 / Redux 액션 / API 응답)
- Props / 파라미터:
- 사용자 상호작용:

### 2.2 출력

- 렌더링 UI:
- 상태 업데이트:
- API 호출:
- 발생 이벤트:

---

## 3. 요구사항 매핑

이 작업이 어떤 요구사항 ID를 커버하는지 명시하세요.

- 커버: `FR-?`, `NFR-?`, `AC-?`
- 제외(다른 작업에서 처리):

---

## 4. 세부 작업 분해 (Step-by-step)

이 섹션이 작업의 핵심입니다. 단계를 작고 순서대로 나누세요.

### Step 0 — 저장소 관례 체크리스트 (필수)

- [ ] TypeScript strict mode 준수
- [ ] DDD 모듈 경계 준수(도메인 계층 참조)
- [ ] 패키지 구조: `{domain}/{layer}/src/`
- [ ] 도메인 간 모델 직접 참조 금지(상태로만 교환)
- [ ] 컴포넌트는 순수(props만, 직접 상태 접근 금지)
- [ ] ESLint/Prettier 포맷팅
- [ ] 테스트 추가/수정
- [ ] production 코드에 console.log 없음

### Step 1 — 도메인 모델 변경(필요시)

- 모듈: `{domain}/model/src/`
- 변경 요약:
- 신규/변경 타입:
  ```typescript
  // ...
  ```
- 검증 규칙:

### Step 2 — 서비스 레이어(필요시)

- 모듈: `{domain}/service/src/`
- 신규/변경 함수:
  - 시그니처:
  - 순수 함수(부작용 없음): 예/아니오
- 비즈니스 로직:

### Step 3 — API 클라이언트(필요시)

- 모듈: `{domain}/client/src/`
- 신규/변경 함수:
  - `fetchXxx()`:
- 엔드포인트:
- 요청/응답 타입:
- 오류 처리:

### Step 4 — Redux 상태(필요시)

- 모듈: `state/{domain}/src/`
- 슬라이스 변경:
  - 초기 상태:
  - 신규 리듀서:
  - 신규 비동기 thunk:
- 셀렉터:

### Step 5 — 컴포넌트 구현

- 모듈: `{domain}/components/src/` 또는 `apps/{app}/components/`
- 컴포넌트:
  - `ComponentName.tsx`:
    - Props 인터페이스:
    - 동작:
    - 스타일링 방식:
- 접근성:
  - ARIA 속성:
  - 키보드 내비게이션:
  - 포커스 관리:
- 반응형:
  - 모바일:
  - 태블릿:
  - 데스크톱:

### Step 6 — 앱 통합(필요시)

- 모듈: `apps/{app}/app/`
- 페이지:
  - 라우트:
  - 레이아웃:
- Redux store 연결:
- 데이터 패칭:

### Step 7 — 테스트

- 단위 테스트:
  - `...Service.test.ts`
    - 케이스:
      - [ ] 정상 경로
      - [ ] 검증 실패
      - [ ] 엣지 케이스

- 컴포넌트 테스트:
  - `...Component.test.tsx`
    - 케이스:
      - [ ] 정상 렌더
      - [ ] 사용자 상호작용 처리
      - [ ] 접근성 체크

### Step 8 — Storybook(해당시)

- 스토리 위치: `apps/storybook/stories/`
- 추가할 스토리:
- 시연 변형:

---

## 5. 파일 수준 변경 계획

구현이 기계적으로 이루어지도록 생성/편집할 구체적인 파일을 나열하세요.

### 5.1 추가할 파일

- `{domain}/model/src/NewType.ts` — 목적
- `{domain}/components/src/NewComponent.tsx` — 목적

### 5.2 편집할 파일

- `state/{domain}/src/slice.ts` — 변경사항
- `apps/web/app/page.tsx` — 변경사항

### 5.3 수정하지 않을 파일

- (선택) 위험 방지를 위한 보호 장치

---

## 6. 수락 기준 (작업 수준)

이 기준들은 객관적으로 검증 가능해야 합니다.

- [ ] AC-TXX-1:
- [ ] AC-TXX-2:
- [ ] 모든 단위/컴포넌트 테스트 통과
- [ ] 새로운 lint/type/compile 오류 없음
- [ ] 접근성(키보드+스크린 리더)
- [ ] 모든 브레이크포인트에서 반응형

---

## 7. 배포 / 하위 호환성

- 기능 플래그:
  - 이름:
  - 기본값:
- 하위 호환성 참고:

---

## 8. 위험 및 엣지 케이스

- 위험 1:
  - 완화 방안:
- 위험 2:
  - 완화 방안:

---

## 9. 구현 체크리스트 (PR용)

- [ ] 코드 컴파일 (`pnpm check:types`)
- [ ] Lint 통과 (`pnpm lint`)
- [ ] Format 통과 (`pnpm format`)
- [ ] 테스트 추가 및 통과
- [ ] console.log 또는 debugger 없음
- [ ] 접근성 테스트 완료
- [ ] 반응형 디자인 검증 완료
- [ ] Storybook 스토리 추가(해당시)

---

## 10. 권장 작업 파일 전략

작업을 여러 파일로 나눌지 결합할지에 대한 질문에 답합니다.

### 권장사항

AI 주도 구현을 위해 **여러 작업 파일 사용(파일당 하나의 작업)** 을 권장합니다.

이유:

- 범위를 작게 유지하고 AI가 위험한 횡단 변경을 하는 것을 방지합니다.
- PR을 검토 가능하게 만들고 병합 충돌을 줄입니다.
- 도메인/모듈 간 병렬 작업을 가능하게 합니다.

### 작업을 단일 파일로 결합해야 하는 경우

작업이 분리 불가능하고 매우 작은 경우에만 결합하세요. 예:

- 2~3개 파일에 걸친 순수 기계적 리팩토링
- 상태 변경 없는 작은 타입명 변경 + 컴포넌트 prop 업데이트

### 실용적 명명 규칙

- `features/<feature-key>/T01-<short-title>.md`
- `features/<feature-key>/T02-<short-title>.md`

### 권장 작업 크기 규칙 (AI에 적합)

작업은 이상적으로 **최대 1개 도메인을 end-to-end로** 다루어야 합니다:

- model + service + client + component + state slice + tests

여러 도메인을 건드려야 하는 경우, 소유권 경계로 분할하세요:

- 예: `workspace` 작업과 `chat` 작업, Redux 상태를 통해 연결

### 도메인 의존성 계층 참조

```
Library (lib/) → 모든 곳에서 참조
     ↓
Actor (actor/model) → 비즈니스 로직 없음, 모델만
     ↓
Workspace (workspace/) → Actor만 참조
     ↓
Authn (authn/) → Actor, Workspace 참조
     ↓
Account (account/) → Actor, Workspace, Authn 참조
     ↓
Chat (chat/) → Actor, Workspace, Authn, Account 참조
```
