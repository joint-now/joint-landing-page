# 업데이트 노트 내비게이션 관리 규칙

업데이트 노트의 이전/다음 내비게이션은 각 페이지 HTML에 **직접 하드코딩**되어 있습니다.
글을 추가하거나 삭제할 때 반드시 아래 규칙을 따라 관련 파일을 함께 수정해야 합니다.

---

## 파일 구조

각 업데이트 노트는 날짜 기반 폴더 안에 위치합니다.

```
update-notes/
├── 250529/       ← 가장 오래된 글 (이전 링크 없음)
│   └── index.html
├── 250530/
│   └── index.html
├── ...
└── 260219/       ← 현재 가장 최신 글 (다음 링크 없음)
    └── index.html
```

폴더명 형식: `YYMMDD` (예: `260219` = 2026년 02월 19일)

---

## 내비게이션 블록 구조

각 index.html의 `</article>` 아래에 아래 형태의 `<nav>` 블록이 위치합니다.

```html
<!-- 이전 업데이트 / 다음 업데이트 내비게이션 -->
<nav class="post-navigation" aria-label="업데이트 내비게이션">

  <!-- 이전 업데이트 (더 오래된 글) -->
  <a class="post-navigation__item post-navigation__prev" href="/update-notes/YYMMDD/">
    <div class="post-navigation__card">
      <div class="post-navigation__thumbnail">
        <img src="../img/YYMMDD/thumbnail.png" alt="[Joint Update] YY.MM.DD 업데이트 섬네일" />
      </div>
      <div class="post-navigation__info">
        <span class="post-navigation__label">이전 업데이트</span>
        <span class="post-navigation__title">[Joint Update] YY.MM.DD 업데이트</span>
        <time class="post-navigation__date" datetime="YYYY-MM-DD">YYYY. M. D</time>
      </div>
    </div>
  </a>

  <!-- 다음 업데이트 (더 최신 글) -->
  <a class="post-navigation__item post-navigation__next" href="/update-notes/YYMMDD/">
    <div class="post-navigation__card">
      <div class="post-navigation__thumbnail">
        <img src="../img/YYMMDD/thumbnail.png" alt="[Joint Update] YY.MM.DD 업데이트 섬네일" />
      </div>
      <div class="post-navigation__info">
        <span class="post-navigation__label">다음 업데이트</span>
        <span class="post-navigation__title">[Joint Update] YY.MM.DD 업데이트</span>
        <time class="post-navigation__date" datetime="YYYY-MM-DD">YYYY. M. D</time>
      </div>
    </div>
  </a>

</nav>
```

> 썸네일 이미지가 없는 경우 `../img/thumbnail-default-01.png` ~ `thumbnail-default-04.png` 중 하나를 사용합니다.

---

## 새 업데이트 노트 추가 시

새 글(`NEW`)을 추가하면 **총 2개 파일**을 수정해야 합니다.

### 1. 기존 최신 글 수정 (현재 `[주의]` 주석이 붙어 있는 파일)

- `<nav>` 안에 `post-navigation__next` 블록을 추가합니다.
- `[주의]` 주석을 제거합니다. (더 이상 최신 글이 아님)

### 2. 새 글 파일 작성

- `<nav>` 안에 `post-navigation__prev` 블록만 작성합니다. (다음 글 없음)
- 아래 `[주의]` 주석을 `<nav>` 위에 붙입니다.

```html
<!--
  [주의] 이 파일은 현재 가장 최신 업데이트 노트입니다.
  다음 글이 없으므로 post-navigation__next 링크는 존재하지 않습니다.

  새 업데이트 노트를 추가할 때 이 파일에서 반드시 해야 할 작업:
    1. 아래 <nav> 안에 post-navigation__next 블록을 추가합니다.
    2. 이 파일은 더 이상 최신 글이 아니므로 이 주석을 제거합니다.
    3. 새 파일에는 위 주석([주의] 가장 최신...)을 붙입니다.
    - 추가 규칙은 update-notes/README.md 를 참고하세요.
-->
```

---

## 업데이트 노트 삭제 시

삭제할 글(`DEL`)이 있으면 **총 2개 파일**을 수정해야 합니다.

| 경우 | 수정할 파일 | 해야 할 작업 |
|------|------------|-------------|
| 중간 글 삭제 | DEL의 이전 글 | `post-navigation__next` href를 DEL의 다음 글로 변경 |
| 중간 글 삭제 | DEL의 다음 글 | `post-navigation__prev` href를 DEL의 이전 글로 변경 |
| 최신 글 삭제 | DEL의 이전 글 | `post-navigation__next` 블록 전체 제거, `[주의]` 주석 추가 |
| 가장 오래된 글 삭제 | DEL의 다음 글 | `post-navigation__prev` 블록 전체 제거 |

---

## 엣지 케이스 요약

| 위치 | prev 링크 | next 링크 | 주석 |
|------|-----------|-----------|------|
| 가장 오래된 글 | 없음 | 있음 | `[주의]` 없음 (변경 가능성 낮음) |
| 중간 글 | 있음 | 있음 | 없음 |
| 가장 최신 글 | 있음 | 없음 | `[주의]` 주석 필수 |
