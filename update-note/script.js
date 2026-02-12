document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('updates-container');
    const themeToggle = document.getElementById('theme-toggle');
    const clockElement = document.getElementById('live-clock');

    // 0. 테마 초기 설정 (localStorage 확인)
    const savedTheme = localStorage.getItem('theme');
    // 사용자가 'dark'로 설정했거나, 설정이 없고 시스템이 다크모드인 경우
    // 여기서는 사용자가 명시적으로 토글한 경우만 저장/복원하는 로직을 따릅니다.
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    // 1. 테마 전환 버튼
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // 2. 실시간 시계
    function updateClock() {
        const now = new Date();
        const year = String(now.getFullYear()).slice(-2);
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        let hours = now.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutes = String(now.getMinutes()).padStart(2, '0');

        clockElement.innerHTML = `${year}.${month}.${day} ${ampm} ${hours}<span class="blink-colon">:</span>${minutes}`;
    }

    updateClock();
    setInterval(updateClock, 1000);

    // 3. 정적 파일에서 데이터 가져오기
    let UPDATES_DATA = [];

    // YAML frontmatter 파싱 (간단한 파서)
    function parseFrontmatter(markdown) {
        const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        if (!match) return { meta: {}, content: markdown };

        const frontmatter = match[1];
        const content = match[2];
        const meta = {};

        frontmatter.split('\n').forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) return;

            const key = line.slice(0, colonIndex).trim();
            let value = line.slice(colonIndex + 1).trim();

            // 따옴표 제거
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }

            // 배열 파싱 (예: ["Update", "Bug Fix"])
            if (value.startsWith('[') && value.endsWith(']')) {
                try {
                    value = JSON.parse(value);
                } catch {
                    value = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
                }
            }

            meta[key] = value;
        });

        return { meta, content };
    }

    async function fetchUpdatesFromStatic() {
        try {
            console.log('📡 Loading updates from static files...');

            // 1. index.json에서 폴더 목록 가져오기
            const indexResponse = await fetch('public/index.json');
            if (!indexResponse.ok) {
                throw new Error(`Failed to load index.json: ${indexResponse.status}`);
            }
            const { folders } = await indexResponse.json();

            // 2. 각 폴더의 .md 파일을 병렬로 fetch
            const results = await Promise.allSettled(
                folders.map(async (folder) => {
                    const mdPath = `public/${folder}/${folder}.md`;
                    const response = await fetch(mdPath);
                    if (!response.ok) throw new Error(`Failed: ${mdPath}`);

                    const text = await response.text();
                    const { meta, content } = parseFrontmatter(text);

                    // 이미지 경로를 폴더 기준 상대 경로로 변환
                    const basePath = `public/${folder}`;
                    let image = meta.image || '';
                    if (image && !image.startsWith('http') && !image.startsWith('/')) {
                        image = `${basePath}/${image}`;
                    }

                    // 본문 내 이미지 경로도 상대→절대로 변환
                    const resolvedContent = content.replace(
                        /!\[(.*?)\]\((?!http|\/)(.*?)\)/g,
                        (match, alt, src) => `![${alt}](${basePath}/${src})`
                    );

                    return {
                        id: folder,
                        title: meta.title || folder,
                        date: meta.date || '',
                        tags: Array.isArray(meta.tags) ? meta.tags : [],
                        image: image,
                        content: resolvedContent,
                        description: meta.description || ''
                    };
                })
            );

            // 성공한 것만 수집
            UPDATES_DATA = results
                .filter(r => r.status === 'fulfilled')
                .map(r => r.value)
                .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

            console.log(`✅ Loaded ${UPDATES_DATA.length} updates from static files`);
            return UPDATES_DATA;
        } catch (error) {
            console.error('❌ Failed to load updates:', error);
            UPDATES_DATA = [];
            return UPDATES_DATA;
        }
    }

    // 4. 라우팅 및 렌더링 로직
    async function initializeApp() {
        // Fetch data from static files
        await fetchUpdatesFromStatic();

        // URL에서 id 파라미터 가져오기
        function getPostIdFromUrl() {
            const params = new URLSearchParams(window.location.search);
            return params.get('id');
        }

        // 스크롤 위치 저장 변수
        let lastScrollPosition = 0;

        // URL 업데이트 (페이지 이동 없이)
        function setPostIdToUrl(id) {
            if (id) {
                const newUrl = `${window.location.pathname}?id=${id}`;
                window.history.pushState({ id: id }, '', newUrl);
            } else {
                const newUrl = window.location.pathname;
                window.history.pushState({}, '', newUrl);
            }
        }

        // リ스트 뷰 렌더링 (가로형 리스트)
        function renderListView() {
            container.innerHTML = ''; // 초기화
            container.className = 'post-list'; // 가로형 리스트 레이아웃

            // 헤더 복구 (What's New 보이기)
            const mainHeader = document.querySelector('.main-header');
            if (mainHeader) mainHeader.style.display = 'block';

            const headerTitle = document.querySelector('.page-title');
            if (headerTitle) headerTitle.textContent = "What's New";

            if (UPDATES_DATA.length === 0) {
                container.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                        <h3>No updates found</h3>
                        <p style="opacity: 0.6; margin-top: 10px;">
                            Check the repository path or try adding a new update note.<br>
                            Ensure <code>update-notes/public</code> exists in <code>joint-now/joint-docs</code>.
                        </p>
                    </div>
                `;
                return;
            }

            UPDATES_DATA.forEach(update => {
                const row = document.createElement('div');
                row.className = 'post-row';

                // 첫 번째 이미지 추출 (섬네일용)
                const imgMatch = update.content.match(/!\[.*?\]\((.*?)\)/);
                const thumbnailSrc = update.image || (imgMatch ? imgMatch[1] : null);

                // 내용 요약 (Description이 있으면 그것을 사용, 없으면 본문 요약)
                let excerpt = update.description;

                if (!excerpt) {
                    // 줄바꿈 정규화 (\r\n, \r -> \n) 후 분리
                    const contentLines = update.content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
                    let meaningfulText = "";

                    for (const line of contentLines) {
                        let trimmed = line.trim();
                        // 헤더(#), 이미지(![), 빈 줄 건너뛰기
                        if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('![')) {
                            continue;
                        }

                        // 리스트 마커 제거
                        // 1. 순서 없는 목록: -, *, + (공백 포함)
                        trimmed = trimmed.replace(/^[-*+]\s+/, '');
                        // 2. 순서 있는 목록: 1. (숫자 + 점 + 공백)
                        trimmed = trimmed.replace(/^\d+\.\s+/, '');

                        meaningfulText += trimmed + " ";
                        if (meaningfulText.length > 100) break; // 충분히 찾았으면 중단
                    }

                    // 마크다운 문법 제거
                    const plainText = meaningfulText.replace(/[#*`\[\]]/g, '').trim();
                    excerpt = plainText.length > 80 ? plainText.substring(0, 80) + '...' : plainText;
                }

                // Title: Use the title from data.js directly
                const displayTitle = update.title;

                const thumbnailHtml = thumbnailSrc ?
                    `<img src="${thumbnailSrc}" alt="${update.title}" class="row-thumbnail">` :
                    `<img src="public/thumbnail_placeholder.svg" alt="No image" class="row-thumbnail placeholder">`;

                // Tags generation
                let tagsHtml = '';
                if (update.tags && update.tags.length > 0) {
                    tagsHtml = '<div class="post-tags">';
                    update.tags.forEach(tag => {
                        let className = 'post-tag';
                        if (tag.toLowerCase() === 'bug fix') className += ' red';
                        if (tag.toLowerCase() === 'improvement') className += ' gray';
                        tagsHtml += `<span class="${className}">${tag}</span>`;
                    });
                    tagsHtml += '</div>';
                }

                row.innerHTML = `
                    <div class="row-content">
                        ${tagsHtml}
                        <h2 class="row-title">${displayTitle}</h2>
                        <p class="row-description">${excerpt}</p>
                    </div>
                    <div class="row-thumbnail-container">
                        ${thumbnailHtml}
                    </div>
                `;

                // 클릭 이벤트
                row.addEventListener('click', () => {
                    lastScrollPosition = window.scrollY; // 현재 스크롤 위치 저장
                    setPostIdToUrl(update.id);
                    renderDetailView(update.id);
                    window.scrollTo(0, 0);
                });

                container.appendChild(row);

                // Observe for animation
                observer.observe(row);
            });

            // 스크롤 위치 복원 (저장된 위치가 있을 경우)
            if (lastScrollPosition > 0) {
                // 복원 시에는 애니메이션 없이 즉시 표시해야 함
                // 하지만 간단하게 가기 위해 그대로 둡니다 (빠르게 나타남)
                window.scrollTo(0, lastScrollPosition);
                lastScrollPosition = 0; // 복원 후 초기화
            }
        }

        // Scroll Animation Observer
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                } else {
                    // Only reset animation if the element leaves downwards (scrolling up past it)
                    // If it leaves upwards (scrolling down past it), keep it visible
                    // so when we scroll back up, it's already there (no animation).
                    if (entry.boundingClientRect.y > 0) {
                        entry.target.classList.remove('visible');
                    }
                }
            });
        }, observerOptions);

        // 디테일 뷰 렌더링
        function renderDetailView(id) {
            // 현재 글의 인덱스 찾기
            // ID가 문자열일 수도 있고 숫자일 수도 있으므로 == 비교 혹은 String() 변환 후 비교
            const currentIndex = UPDATES_DATA.findIndex(u => String(u.id) === String(id));
            const update = UPDATES_DATA[currentIndex];

            if (!update) {
                renderListView(); // 없으면 리스트로 복귀
                return;
            }

            // 이전 글 (최신 글, 인덱스 - 1)
            const prevPost = currentIndex > 0 ? UPDATES_DATA[currentIndex - 1] : null;
            // 다음 글 (과거 글, 인덱스 + 1)
            const nextPost = currentIndex < UPDATES_DATA.length - 1 ? UPDATES_DATA[currentIndex + 1] : null;

            container.innerHTML = '';
            container.className = 'detail-view';

            // 헤더 숨기기 (Update Detail 제거)
            const mainHeader = document.querySelector('.main-header');
            if (mainHeader) mainHeader.style.display = 'none';

            // const headerTitle = document.querySelector('.page-title');
            // if (headerTitle) headerTitle.textContent = "Update Detail";

            const detailHtml = `
                <div class="detail-entry">

                    <div class="entry-date">${update.date}</div>
                    <h1 class="entry-title">${update.title}</h1>
                    ${update.image ? `<div class="entry-image"><img src="${update.image}" alt="${update.title}"></div>` : ''}
                    <div class="entry-body">
                        ${marked.parse(update.content)}
                    </div>
                </div>

                ${(() => {
                    const newerPost = prevPost; // Index - 1 (Newer)
                    const olderPost = nextPost; // Index + 1 (Older)

                    if (!newerPost && !olderPost) return '';

                    let html = '<div class="recommendation-section">';

                    // Helper to generate card HTML
                    const createCard = (post, label) => {
                        const imgMatch = post.content.match(/!\[.*?\]\((.*?)\)/);
                        const thumb = post.image || (imgMatch ? imgMatch[1] : null);
                        const thumbHtml = thumb ?
                            `<img src="${thumb}" class="recommendation-thumb" alt="">` :
                            `<img src="public/thumbnail_placeholder.svg" class="recommendation-thumb placeholder" alt="">`;

                        return `
                        <a href="#" class="recommendation-card" data-id="${post.id}">
                            ${thumbHtml}
                            <div class="recommendation-content">
                                <div class="recommendation-label">${label}</div>
                                <div class="recommendation-title">${post.title}</div>
                                <div class="recommendation-date">${post.date}</div>
                            </div>
                        </a>`;
                    };

                    if (newerPost) {
                        html += createCard(newerPost, "다음 업데이트");
                    }

                    if (olderPost) {
                        html += createCard(olderPost, "이전 업데이트");
                    }

                    html += '</div>';
                    return html;
                })()}
            `;

            container.innerHTML = detailHtml;

            // 이벤트 리스너 연결 (모든 추천 카드에 대해)
            container.querySelectorAll('.recommendation-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    const id = card.getAttribute('data-id');
                    setPostIdToUrl(id);
                    renderDetailView(id);
                    window.scrollTo(0, 0);
                });
            });

            container.querySelector('.nav-list-btn').addEventListener('click', (e) => {
                e.preventDefault();
                setPostIdToUrl(null);
                renderListView();
                window.scrollTo(0, 0);
            });
        }

        // 초기 로드 시 라우팅 처리
        const initialId = getPostIdFromUrl();
        if (initialId) {
            renderDetailView(initialId);
        } else {
            renderListView();
        }

        // 브라우저 뒤로가기/앞으로가기 처리
        window.addEventListener('popstate', () => {
            const id = getPostIdFromUrl();
            if (id) {
                renderDetailView(id);
            } else {
                renderListView();
            }
        });

        // 로고 클릭 이벤트 (홈으로 복귀)
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('click', () => {
                setPostIdToUrl(null);
                renderListView();
                window.scrollTo(0, 0);
                lastScrollPosition = 0; // 홈으로 갈 때는 스크롤 리셋
            });
        }
    }

    // Initialize the app
    initializeApp().catch(error => {
        console.error('Failed to initialize app:', error);
        container.innerHTML = '<div style="padding: 40px; text-align: center;">Failed to load updates. Please try again later.</div>';
    });
});
