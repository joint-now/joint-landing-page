# Joint Update Notes Website

조인트 서비스의 업데이트 노트 웹사이트입니다. **로컬 파일 시스템**에 있는 마크다운 파일을 읽어 업데이트 내용을 표시합니다.

## 🚀 시작하기

### 1. 전제 조건
- `../joint-docs/products/update-notes/public` 경로에 마크다운 파일이 있어야 합니다.
- (상위 폴더인 `joint-docs`가 프로젝트 폴더 바로 옆에 위치해야 함)

### 2. 설치 및 실행

```bash
# 의존성 설치
bun install

# 서버 실행
bun start
```

서버가 실행되면 브라우저에서 `http://localhost:3001`으로 접속하세요.

## 📁 프로젝트 구조

- `api-server.ts`: **핵심 서버 파일**. 로컬 폴더에서 `.md` 파일을 읽어 API로 제공하고, 정적 파일(HTML/JS)도 서빙합니다.
- `index.html`: 메인 웹사이트 화면
- `script.js`: API(`api-server.ts`)에서 데이터를 가져와 화면에 그리는 로직
- `style.css`: 스타일 시트

## 📝 관리 방법

업데이트 노트를 추가하려면 `HOW_TO_UPDATE.md` 파일을 참고하세요.
기본적으로 `joint-docs` 폴더에 마크다운 파일만 추가하면 자동으로 웹사이트에 반영됩니다.
