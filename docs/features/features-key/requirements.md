# 기능 요구사항 (구현 입력)

> 목적: 이 문서는 PRD를 **AI/엔지니어가 즉시 구현할 수 있는 형태**로 정제합니다.
>
> - 모호성 제거(정의/경계/식별자)
> - 산출물 명시(컴포넌트/API 클라이언트/상태/테스트)
> - 저장소 규칙 강제(DDD 모듈 경계, TypeScript, 도메인 의존성 계층)

## 0. 메타데이터

- 기능 키: `short-feature-name`
- PRD 링크: `features/feature-key/PRD.md`
- 작성자:
- 작성일 (UTC):
- 대상 애플리케이션: (예: `apps/web`, `apps/mobile`, `apps/electron`)
- 포함 도메인: (예: `workspace`, `chat`, `account`, `authn`, `registration`)
- 상태: Draft / Ready / Implemented

---

## 1. 요약

- 한 줄 요약:
- 주요 사용자:
- 비즈니스 가치:
- 비목표(명시적):

---

## 2. 용어집 & 공식 정의

> 이곳의 정의, 식별자, 타입명이 구현의 단일 소스입니다.

### 2.1 도메인 모델

- 주요 엔터티/모델:
  - 타입명:
  - 주요 속성:
- 관련 모델:

### 2.2 타입 정의

- 새로 만들 타입:
- 확장할 기존 타입:

### 2.3 API 계약

- 사용하는 백엔드 엔드포인트:
  - `METHOD /path` - 목적
- 요청/응답 형태:

---

## 3. 기능 요구사항 (시스템이 반드시 해야 하는 것)

> 항상 "사용자 행동 → 시스템 동작 → 시각적 피드백"으로 명시하세요.

### FR-1

- 설명:
- 사용자 트리거:
- 시스템 동작:
- 시각적 피드백:
- 오류 상태:

### FR-2

- ...

---

## 4. 비기능 요구사항

- 성능 목표:
  - 초기 로드 시간:
  - 상호작용 지연:
  - 번들 크기 영향:
- 접근성:
  - WCAG 수준:
  - 키보드 내비게이션:
  - 스크린 리더 지원:
- 반응형:
  - 모바일 동작:
  - 태블릿 동작:
  - 데스크톱 동작:
- 브라우저 지원:

---

## 5. 범위 경계

### 포함 범위

-

### 제외 범위

-

### 가정 / 제약

- ***

## 6. 아키텍처 및 모듈 매핑 (DDD)

> 각 책임에 대해 도메인 의존성 계층에 따라 "단일 소유자" 모듈을 지정하세요.

### 6.1 도메인 의존성 계층 (반드시 준수)

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

### 6.2 제안된 모듈 변경사항

| 기능           | 모듈                  | 레이어    | 비고                               |
| -------------- | --------------------- | --------- | ---------------------------------- |
| 도메인 모델    | `{domain}/model`      | model     | TypeScript 타입/인터페이스         |
| 비즈니스 로직  | `{domain}/service`    | service   | 순수 함수, 부작용 없음             |
| UI 컴포넌트    | `{domain}/components` | component | 순수 컴포넌트 (props만, 상태 없음) |
| API 클라이언트 | `{domain}/client`     | client    | HTTP/WebSocket 통합                |
| Redux 상태     | `state/{domain}`      | state     | Slices, selectors, thunks          |
| 앱 통합        | `apps/{app}/`         | app       | 페이지, 레이아웃, 라우팅           |

### 6.3 핵심 규칙

- 도메인 모듈은 계층에 명시된 경우를 제외하고 다른 도메인 모듈을 참조해서는 안 됩니다
- 상태 모듈은 모든 도메인 모델과 서비스를 참조할 수 있습니다
- 도메인 내 컴포넌트는 순수해야 합니다 (상태 없이 props만)
- 도메인 간 데이터 흐름은 Redux 상태를 통해 이루어집니다

---

## 7. 데이터 모델 및 타입

> 생성하거나 수정할 TypeScript 타입 및 인터페이스.

### 7.1 새로운 / 변경된 타입

#### 타입: `...`

```typescript
// 위치: {domain}/model/src/...
interface ExampleModel {
  id: string;
  // ...
}
```

### 7.2 API 응답 타입

```typescript
// 위치: {domain}/client/src/...
interface ExampleResponse {
  // ...
}
```

### 7.3 Redux 상태 구조

```typescript
// 위치: state/{domain}/src/...
interface ExampleState {
  // ...
}
```

---

## 8. 컴포넌트 명세

> 컴포넌트 계약은 프론트엔드 구현의 핵심입니다.

### 8.1 신규 컴포넌트

#### 컴포넌트: `ComponentName`

- 위치: `{domain}/components/src/ComponentName.tsx`
- 목적:
- Props 인터페이스:
  ```typescript
  interface ComponentNameProps {
    // ...
  }
  ```
- 동작:
- 접근성:
- 반응형 동작:

### 8.2 수정 컴포넌트

- 컴포넌트:
- 변경사항:

### 8.3 공유 컴포넌트 (있는 경우)

- `components/base/` 추가:

---

## 9. API 클라이언트 명세

> 클라이언트 모듈은 모든 외부 통신을 처리합니다.

### 9.1 신규 API 함수

#### 함수: `fetchExample`

- 위치: `{domain}/client/src/...`
- 엔드포인트: `METHOD /path`
- 요청 파라미터:
- 응답 타입:
- 오류 처리:

### 9.2 WebSocket 통합 (있는 경우)

- 채널/토픽:
- 메시지 타입:
- 연결 처리:

---

## 10. 상태 관리 (Redux)

> Redux 슬라이스, 액션, 셀렉터.

### 10.1 슬라이스 정의

- 위치: `state/{domain}/src/...`
- 초기 상태:
- 리듀서:
- 추가 리듀서 (비동기):

### 10.2 비동기 Thunk

- `fetchExampleThunk`:
  - 트리거:
  - API 호출:
  - 성공 처리:
  - 오류 처리:

### 10.3 셀렉터

- `selectExample`:
  - 입력 상태:
  - 출력:
  - 메모이제이션:

---

## 11. 도메인 로직 규칙 (불변조건)

> "항상 참"인 규칙을 나열합니다.

- 규칙 1:
- 규칙 2:
- 검증 규칙:

---

## 12. 오류 처리 전략

- 사용자 대면 오류 메시지:
- 오류 경계:
- 재시도 로직:
- 폴백 UI:

---

## 13. 관찰 가능성

- 콘솔 로깅 (개발 전용):
- 오류 추적 (Sentry):
- 분석 이벤트:

---

## 14. 테스트 계획

### 14.1 단위 테스트

- `...Service.test.ts`
  - Given (주어진 상황):
  - When (행동):
  - Then (결과):

### 14.2 컴포넌트 테스트

- `...Component.test.tsx`
  - 렌더링 시나리오:
  - 인터랙션 테스트:
  - 접근성 테스트:

### 14.3 통합 테스트 (있는 경우)

- E2E 플로우:

---

## 15. Storybook 문서화

- 추가할 스토리:
- 시연할 변형:
- 위치: `apps/storybook/stories/...`

---

## 16. 배포 계획

- 기능 플래그: 예/아니오
- 점진적 배포 단계:
- 하위 호환성:

---

## 17. 수락 기준 (구현 준비 완료)

> "검증 가능한 문장"으로만 작성하세요.

- [ ] AC-1:
- [ ] AC-2:
- [ ] 모든 TypeScript 타입이 적절히 정의됨
- [ ] 컴포넌트가 접근 가능함 (키보드, 스크린 리더)
- [ ] 반응형 디자인이 모바일/태블릿/데스크톱에서 작동함
- [ ] 단위 테스트 통과
- [ ] lint/type 오류 없음

---

## 18. 미해결 질문

- Q1:
- Q2:
