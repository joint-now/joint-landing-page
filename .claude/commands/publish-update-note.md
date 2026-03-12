# 업데이트 노트 HTML 페이지 발행

`joint-docs/products/update-notes/public` 안의 MD 파일을 기반으로 `joint-landing-page/update-notes` 에 새로운 업데이트 노트 상세 페이지를 생성합니다.

## 사용 방법

```
/publish-update-note         # 미발행 목록에서 선택
/publish-update-note YYMMDD  # 날짜 코드 직접 지정 (예: 260301)
```

---

## 작업 순서

### Step 1. 대상 MD 파일 결정

**인자가 있는 경우 (`$ARGUMENTS` 가 제공된 경우)**
- `$ARGUMENTS`는 날짜 코드(YYMMDD)입니다. `update-note-$ARGUMENTS.md` 형태로 파일명을 조합합니다.
- `../joint-docs/products/update-notes/public/update-note-$ARGUMENTS.md` 파일이 존재하는지 확인합니다.
- 없으면 오류 메시지를 출력하고 종료합니다.

**인자가 없는 경우**
- `../joint-docs/products/update-notes/public/` 의 MD 파일 목록을 가져옵니다.
- `update-notes/` 의 날짜 코드 폴더 목록을 가져옵니다.
- 두 목록을 비교해 대응하는 폴더가 없는 MD 파일만 추려 날짜 최신순으로 나열합니다.
- 목록이 없으면 "모든 업데이트 노트가 이미 발행되어 있습니다." 메시지를 출력하고 종료합니다.
- 사용자에게 어떤 노트를 발행할지 선택을 요청합니다. 형식 예시:

```
아직 HTML 페이지가 없는 업데이트 노트입니다.

  1. update-note-260301.md
  2. update-note-260225.md
  3. update-note-260220.md

발행할 번호를 입력해주세요:
```

- 사용자의 입력을 기다린 후 선택한 파일로 이후 단계를 진행합니다.

이후 단계에서 `$ARGUMENTS` 라고 표기된 곳은 위에서 결정된 날짜 코드로 대체합니다.

### Step 2. MD 파일 읽기

`../joint-docs/products/update-notes/public/update-note-$ARGUMENTS.md` 를 읽습니다.

파일명에서 날짜 코드를 추출합니다.
- 파일명 패턴: `update-note-YYMMDD.md`
- 날짜 코드 예: `260301` → YY=26, MM=03, DD=01
- 날짜 변수 정의:
  - `DATE_CODE` = `260301` (6자리)
  - `DATE_DISPLAY` = `26.03.01` (점 구분)
  - `DATE_DATETIME` = `2026-03-01` (ISO 형식, YY → 20YY)
  - `DATE_KOREAN` = `2026년 03월 01일`
  - `DATE_NAV` = `2026. 3. 1` (앞자리 0 제거)

### Step 3. 기존 최신 파일 파악

`update-notes/` 안에서 날짜 코드 폴더 목록을 확인합니다.
숫자 기준 정렬 후 가장 큰 값이 **현재 최신 글(PREV_DATE_CODE)** 입니다.

해당 폴더의 `index.html`을 읽어 `[주의]` 주석이 있는지 확인합니다.

### Step 4. 썸네일 이미지 경로 결정

**새 글 썸네일**: `update-notes/img/{DATE_CODE}/thumbnail.png` 가 존재하면 `../img/{DATE_CODE}/thumbnail.png` 사용. 없으면 `../img/thumbnail-default-01.png` 사용.

**이전 글(PREV) 썸네일**: `update-notes/img/{PREV_DATE_CODE}/thumbnail.png` 가 존재하면 `../img/{PREV_DATE_CODE}/thumbnail.png` 사용. 없으면 이전 글 `index.html`에서 현재 사용 중인 썸네일 경로를 그대로 가져옵니다.

### Step 5. MD → HTML 본문 변환

MD 파일의 섹션을 HTML로 변환합니다.

**섹션 헤더 변환 규칙:**
- `## New Features` → `<h2>✨ New Features</h2>`
- `## Improvements` → `<h2>⚡ Improvements</h2>`
- `## Bug Fixes` → `<h2>🐛 Bug Fixes</h2>`
- 다른 `## 제목` → `<h2>제목</h2>`
- `### 제목` → `<h3>제목</h3>`

**목록 변환 규칙:**
- 연속된 `- item` → `<ul><li>item</li>...</ul>`
- 중첩된 `  - subitem` (들여쓰기 2칸 이상) → 상위 `<li>` 안에 `<ul><li>subitem</li></ul>` 삽입
- 더 깊은 중첩도 동일하게 재귀 처리

**빈 섹션 처리:**
섹션 헤더(`##`) 이후 내용이 없거나 다음 `##`이 바로 오면 → `<p>이번 업데이트에서 해당 사항이 없습니다.</p>` 삽입

**일반 텍스트:**
- 빈 줄로 구분된 단락 → `<p>` 태그
- `**텍스트**` → `<strong>텍스트</strong>`
- `[텍스트](url)` → `<a href="url">텍스트</a>`

**이미지:**
- `![alt](src)` → `<img alt="alt" src="src" />`

**메타 description 생성:**
MD 본문에서 New Features, Improvements, Bug Fixes 중 가장 내용이 많은 섹션의 핵심 내용을 1~2문장으로 요약해 생성합니다.

**Hero 이미지:**
썸네일이 `/img/{DATE_CODE}/` 하위에 존재하면 `<img class="update-note__hero-image" src="../img/{DATE_CODE}/thumbnail.png" alt="..." />` 를 본문 최상단에 삽입합니다. 기본 썸네일인 경우 hero 이미지는 생략합니다.

### Step 6. 새 index.html 생성

`update-notes/{DATE_CODE}/index.html` 을 새로 생성합니다.

아래 템플릿을 기반으로 하되, `{변수}` 자리에 실제 값을 채웁니다:

```html
<!doctype html>

<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>[Joint Update] {DATE_DISPLAY} 업데이트 — JOINT 업데이트 노트</title>
    <meta
      content="{META_DESCRIPTION}"
      name="description"
    />
    <meta content="[Joint Update] {DATE_DISPLAY} 업데이트 — JOINT 업데이트 노트" property="og:title" />
    <meta content="조인트 (JOINT)" property="og:site_name" />
    <meta
      content="{META_DESCRIPTION}"
      property="og:description"
    />
    <meta content="article" property="og:type" />
    <link href="/img/favicon.ico" rel="icon" sizes="32x32" type="image/x-icon" />
    <link href="/img/icon.svg" rel="icon" sizes="any" type="image/svg+xml" />
    <link href="/img/apple-icon.png" rel="apple-touch-icon" sizes="180x180" type="image/png" />
    <link
      crossorigin=""
      href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css"
      rel="stylesheet"
    />
    <link href="/update-notes/style.css" rel="stylesheet" />
    <style>
      /* === GNB (다운로드 페이지와 동일한 스타일) === */

      @media screen and (min-width: 1001px) {
        body .for-mobile {
          display: none;
        }
      }

      @media screen and (max-width: 1000px) {
        body .for-desktop {
          display: none;
        }
      }

      .gnb {
        position: fixed;
        top: 0;

        padding: 18px 0;

        width: 100%;
        height: 70px;

        z-index: 1000;

        border-bottom: 1px solid rgba(var(--gray10-rgb), 0.06);
        background: rgba(var(--white-rgb), 0);
        backdrop-filter: none;
        -webkit-backdrop-filter: none;

        transition: background 0.5s ease;
      }

      .gnb.scrolled {
        background: var(--white);
      }

      .navbar {
        position: relative;
        display: flex;
        align-items: center;

        margin: 0 auto;

        max-width: 1212px;
        height: 34px;
      }

      .navbar .logo {
        flex: 1;
        display: flex;
        align-items: center;
        margin: 8px 0 0 25px;
        cursor: pointer;
        transition: opacity 0.3s ease;

        -webkit-tap-highlight-color: transparent;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        outline: none;
      }

      .navbar .logo img {
        width: auto;
        height: 26px;
      }

      .navbar .logo:hover {
        opacity: 0.8;
      }

      .navbar .logo:focus-visible {
        outline: 2px solid var(--black);
        outline-offset: 3px;
      }

      .navbar-btns {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        margin-right: 25px;
      }

      .navbar-menu {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .navbar-menu a[aria-current='page'] {
        color: var(--primary);
        pointer-events: none;
        cursor: default;
      }

      .navbar-menu .navbar-link-btn {
        margin-right: 0;
      }

      .navbar-link-btn {
        display: inline-flex;
        align-items: center;
        margin-right: 12px;
        padding: 0 12px;
        height: 32px;
        border: none;
        border-radius: 10px;
        outline: none;
        background-color: transparent;
        font-size: 14px;
        font-weight: 600;
        color: var(--gray10);
        line-height: 32px;
        text-decoration: none;
      }

      .navbar-link-btn svg {
        margin-left: 4px;
        color: var(--gray04);
      }

      .navbar-link-btn:focus-visible {
        outline: 2px solid var(--black);
        outline-offset: 3px;
      }

      .navbar-link-btn:hover {
        background: rgba(var(--gray10-rgb), 0.04);
      }

      .navbar-link-btn:hover svg {
        color: var(--primary);
      }

      .signin-btn {
        display: inline-block;

        padding: 0 12px;

        height: 32px;

        border: none;
        border-radius: 10px;
        outline: none;

        background-color: #ffffff;
        box-shadow:
          0 -1px 0 0 rgba(0, 0, 0, 0.06) inset,
          0 0 0 1px rgba(0, 0, 0, 0.08) inset,
          0 2px 6px 0 rgba(0, 0, 0, 0.02);

        font-size: 13px;
        font-weight: 700;
        color: var(--gray10);
        line-height: 32px;
        text-decoration: none;

        transition: opacity 0.3s;

        cursor: pointer;
      }

      .signin-btn:focus-visible {
        outline: 2px solid var(--black);
        outline-offset: 3px;
      }

      .signin-btn:hover {
        background-image: linear-gradient(
          rgba(var(--gray10-rgb), 0.04),
          rgba(var(--gray10-rgb), 0.04)
        );
      }

      .typeform-btn button {
        display: inline-block !important;

        padding: 0 12px !important;

        height: 32px !important;

        border: none !important;
        border-radius: 10px !important;
        outline: none !important;

        background-color: var(--primary) !important;
        box-shadow:
          0 -1px 0 0 rgba(0, 0, 0, 0.06) inset,
          0 0 0 1px rgba(0, 0, 0, 0.08) inset,
          0 2px 6px 0 rgba(0, 0, 0, 0.02) !important;

        font-family: inherit !important;
        font-size: 13px !important;
        font-weight: 700 !important;
        color: var(--white) !important;
        line-height: 32px !important;
        text-decoration: none !important;

        transition: opacity 0.3s !important;

        cursor: pointer !important;
      }

      .typeform-btn button:focus-visible {
        outline: 2px solid var(--black);
        outline-offset: 3px;
      }

      .typeform-btn:hover button {
        background-image: linear-gradient(
          rgba(var(--gray10-rgb), 0.04),
          rgba(var(--gray10-rgb), 0.04)
        ) !important;
      }

      .typeform-btn:active button {
        background-image: linear-gradient(
          rgba(var(--gray10-rgb), 0.08),
          rgba(var(--gray10-rgb), 0.08)
        ) !important;
      }

      /* 고정 GNB 높이만큼 update-note 상단 여백 보정 */
      .update-note {
        padding-top: 150px;
      }

      /* === 모바일 미디어쿼리 === */
      @media screen and (max-width: 1000px) {
        .gnb.scrolled {
          padding-bottom: 0;
        }

        .navbar .logo {
          display: flex;
          margin-left: 0;
          padding: 2px 5px 2px 18.5px;
        }

        .navbar-btns {
          gap: 4px;
          margin-right: 0;
          padding-right: 16px;
        }
      }

      @media screen and (max-width: 767px) {
        .update-note {
          padding-top: 126px;
        }
      }
    </style>

    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async="" src="https://www.googletagmanager.com/gtag/js?id=G-QJGC6M9MC4"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', 'G-QJGC6M9MC4');
    </script>
    <meta
      content="https://www.joint.now/update-notes/img/{DATE_CODE}/thumbnail.png"
      property="og:image"
    />
  </head>

  <body>
    <script>
      document.addEventListener('DOMContentLoaded', () => {
        const gnb = document.querySelector('.gnb');
        if (gnb) {
          const updateGnb = () => {
            if (window.scrollY > 100) {
              gnb.classList.add('scrolled');
            } else {
              gnb.classList.remove('scrolled');
            }
          };
          window.addEventListener('scroll', updateGnb, { passive: true });
          updateGnb();
        }
      });
    </script>

    <header class="gnb">
      <nav class="navbar">
        <a class="logo" href="/">
          <img src="/img/joint-logo.svg" alt="Joint 조인트" width="77" height="26" />
        </a>
        <div class="navbar-menu for-desktop">
          <a
            class="navbar-link-btn"
            href="https://guide.joint.now/customer-story"
            target="_blank"
            rel="noopener"
          >
            고객 성공 사례
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                d="M11.0833 2.91663L2.91658 11.0833"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-miterlimit="10"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M11.0833 8.90746V2.91663H5.09242"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-miterlimit="10"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </a>
          <a class="navbar-link-btn" href="https://www.joint.now/download/">앱 다운로드</a>
          <a class="navbar-link-btn" href="https://www.joint.now/update-notes/" aria-current="page">
            업데이트 소식
          </a>
        </div>
        <div class="navbar-btns">
          <a
            href="https://app.joint.now/"
            target="_blank"
            rel="noopener"
            class="signin-btn for-desktop"
          >
            로그인
          </a>
          <a
            href="https://mapp.joint.now/"
            target="_blank"
            rel="noopener"
            class="signin-btn for-mobile"
          >
            로그인
          </a>
          <div class="typeform-btn for-desktop" data-tf-live="01K6C2D7WHYR367H60C4C5DBCF"></div>
          <div class="typeform-btn for-mobile" data-tf-live="01K6C2D7WHYR367H60C4C5DBCF"></div>
          <script src="https://embed.typeform.com/next/embed.js" defer></script>
        </div>
      </nav>
    </header>
    <main>
      <article class="update-note">
        <header class="update-note__header">
          <h1 class="update-note__title">[Joint Update] {DATE_DISPLAY} 업데이트</h1>
          <time class="update-note__date" datetime="{DATE_DATETIME}">{DATE_KOREAN}</time>
        </header>
        <div class="update-note__body">
          {HERO_IMAGE_IF_EXISTS}
          {CONVERTED_BODY_HTML}
        </div>
      </article>
      <!--
      [주의] 이 파일은 현재 가장 최신 업데이트 노트입니다.
      다음 글이 없으므로 post-navigation__next 링크는 존재하지 않습니다.

      새 업데이트 노트를 추가할 때 이 파일에서 반드시 해야 할 작업:
        1. 아래 <nav> 안에 post-navigation__next 블록을 추가합니다.
        2. 이 파일은 더 이상 최신 글이 아니므로 이 주석을 제거합니다.
        3. 새 파일에는 위 주석([주의] 가장 최신...)을 붙입니다.
        - 추가 규칙은 docs 레포의 products/update-notes/README.md 를 참고하세요.
    -->
      <!-- 이전 업데이트 / 다음 업데이트 내비게이션 -->
      <nav class="post-navigation" aria-label="업데이트 내비게이션">
        <!-- 이전 업데이트 -->
        <a class="post-navigation__item post-navigation__prev" href="/update-notes/{PREV_DATE_CODE}/">
          <div class="post-navigation__card">
            <div class="post-navigation__thumbnail">
              <img
                src="{PREV_THUMBNAIL_PATH}"
                alt="[Joint Update] {PREV_DATE_DISPLAY} 업데이트 섬네일"
              />
            </div>
            <div class="post-navigation__info">
              <span class="post-navigation__label">이전 업데이트</span>
              <span class="post-navigation__title">[Joint Update] {PREV_DATE_DISPLAY} 업데이트</span>
              <time class="post-navigation__date" datetime="{PREV_DATE_DATETIME}">{PREV_DATE_NAV}</time>
            </div>
          </div>
        </a>
      </nav>
    </main>

    <footer>
      <div class="footer-container">
        <div class="joint">(주) 조인트</div>
        <div class="info">
          <div>
            <p>서울시 서초구 서초대로 398BNK 디지털 타워 6층 (06619)</p>
            <p>문의 : help@joint.now</p>
          </div>
          <div class="social-links">
            <a
              href="https://www.linkedin.com/company/jointnow/about/"
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label="Joint 조인트 LinkedIn 페이지"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                />
              </svg>
            </a>
          </div>
        </div>
        <hr />
        <div>© 2026 Joint. All rights reserved.</div>
        <div>
          <span>
            <a
              class="term"
              href="https://www.joint.now/privacy_policy_20250519.html"
              target="_blank"
              rel="noopener"
              aria-label="Joint 조인트 개인정보 처리방침"
            >
              <strong>개인정보 처리방침</strong>
            </a>
          </span>
          <span>
            <a
              class="term"
              href="https://www.joint.now/terms_of_service_20250519.html"
              target="_blank"
              rel="noopener"
              aria-label="Joint 조인트 서비스 이용약관"
            >
              서비스 이용약관
            </a>
          </span>
        </div>
      </div>
    </footer>
    <script src="/update-notes/script.js"></script>
  </body>
</html>
```

### Step 7. 이전 최신 글(PREV) index.html 수정

`update-notes/{PREV_DATE_CODE}/index.html` 을 수정합니다.

**해야 할 두 가지 작업:**

1. `[주의]` 주석 블록 전체 제거 (더 이상 최신 글이 아님)

2. `<nav class="post-navigation"...>` 안의 닫는 `</nav>` 바로 앞에 `post-navigation__next` 블록 추가:

```html
        <!-- 다음 업데이트 -->
        <a class="post-navigation__item post-navigation__next" href="/update-notes/{DATE_CODE}/">
          <div class="post-navigation__card">
            <div class="post-navigation__thumbnail">
              <img
                src="{NEW_THUMBNAIL_PATH}"
                alt="[Joint Update] {DATE_DISPLAY} 업데이트 섬네일"
              />
            </div>
            <div class="post-navigation__info">
              <span class="post-navigation__label">다음 업데이트</span>
              <span class="post-navigation__title">[Joint Update] {DATE_DISPLAY} 업데이트</span>
              <time class="post-navigation__date" datetime="{DATE_DATETIME}">{DATE_NAV}</time>
            </div>
          </div>
        </a>
```

여기서 `{NEW_THUMBNAIL_PATH}` 는 Step 3에서 결정한 새 글의 썸네일 경로입니다. 단, PREV 파일에서의 상대 경로이므로 `../img/{DATE_CODE}/thumbnail.png` 또는 `../img/thumbnail-default-01.png` 형태가 됩니다.

### Step 8. 완료 보고

작업이 완료되면 다음 내용을 보고합니다:
- 생성된 파일 경로
- 수정된 파일 경로
- 썸네일 이미지 존재 여부 (없으면 기본 이미지 사용 중임을 안내)

---

## 주의사항

- `DATE_NAV` 형식은 월/일 앞의 0을 제거합니다. 예: `2026. 3. 1` (O), `2026. 03. 01` (X)
- `DATE_KOREAN` 형식은 두 자리를 유지합니다. 예: `2026년 03월 01일`
- MD 파일에 frontmatter(`---`)가 있을 경우 해당 블록은 무시하고 본문만 사용합니다.
- MD 본문의 최상위 `# 제목` 줄은 HTML `<h1>`으로 변환하지 않습니다 (이미 `update-note__title`에 포함됨). 해당 줄은 건너뜁니다.
- `og:image` 메타 태그는 썸네일 파일 존재 여부와 무관하게 항상 `https://www.joint.now/update-notes/img/{DATE_CODE}/thumbnail.png` 경로를 사용합니다.
