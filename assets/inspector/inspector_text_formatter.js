/**
 * assets/inspector/inspector_text_formatter.js
 * Specialized text and HTML formatting engine for Quill editor integration.
 * Provides DOM-safe whitespace preservation and inline font-size normalization.
 */
(function () {
    'use strict';

    /**
     * Helper: CONTENT EDITOR(Quill)에서 작성된 텍스트의 연속 공백 및 선행 공백을 HTML 엔티티(&nbsp;)로 정밀 보존
     * - HTML 태그 및 속성(style, class 등)은 절대 건드리지 않고, 순수 TextNode만 안전하게 변환
     * - 단일 공백은 일반 공백(' ')으로 유지하여 브라우저의 단어 자동 줄바꿈(Word Wrap)을 온전히 보존
     * - 선행 공백 및 2개 이상 연속된 공백은 '\u00A0' (NBSP)로 변환하여 브라우저의 공백 축약(Collapsing) 방지
     */
    function preserveConsecutiveSpaces(html) {
        if (!html || typeof html !== 'string') return html;
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while ((node = walker.nextNode())) {
                let val = node.nodeValue;
                if (!val) continue;

                // 1) 텍스트 노드 시작 부분의 공백(선행 들여쓰기 공백) 보존
                val = val.replace(/^ +/g, match => '\u00A0'.repeat(match.length));

                // 2) 텍스트 노드 중간의 2개 이상 연속 공백 보존 (첫 공백은 일반 스페이스로 남겨 워드랩 보장)
                val = val.replace(/ {2,}/g, match => ' ' + '\u00A0'.repeat(match.length - 1));

                node.nodeValue = val;
            }
            return doc.body.innerHTML;
        } catch (e) {
            console.error('[preserveConsecutiveSpaces] Error:', e);
            return html;
        }
    }

    /**
     * Helper: 정규화된 HTML을 생성하여 Quill 클립보드가 인라인 font-size 및 서식을 온전히 파싱하도록 보장
     */
    function normalizeHtmlForQuill(rawHtml, fallbackFontSize) {
        if (!rawHtml) return '<p><br></p>';
        const parser = new DOMParser();
        const parsed = parser.parseFromString(rawHtml, 'text/html');
        const textContent = parsed.querySelector('.v4-shape-text-content') ||
                            parsed.querySelector('.v4-shape-text-overlay') ||
                            parsed.querySelector('.v4-editable-cell');
        let clean = textContent ? textContent.innerHTML.trim() : rawHtml.trim();
        if (!clean) return '<p><br></p>';

        // p나 div 블록 태그가 전혀 없으면 <p>로 감싸기
        if (!clean.includes('<p') && !clean.includes('<div')) {
            clean = `<p>${clean}</p>`;
        }

        // 인라인 font-size가 전혀 없는 경우, p 태그 내부 콘텐츠에 안전하게 font-size span을 주입
        const hasExplicitFontSize = clean.includes('font-size') || clean.includes('fontSize');
        if (!hasExplicitFontSize && fallbackFontSize) {
            const fsPx = typeof fallbackFontSize === 'number' ? fallbackFontSize + 'px' : (fallbackFontSize.endsWith('px') ? fallbackFontSize : fallbackFontSize + 'px');
            const doc = parser.parseFromString(clean, 'text/html');
            const blocks = doc.body.querySelectorAll('p, div');
            if (blocks.length > 0) {
                blocks.forEach(b => {
                    if (b.innerHTML.trim() && !b.querySelector('[style*="font-size"]')) {
                        b.innerHTML = `<span style="font-size: ${fsPx};">${b.innerHTML}</span>`;
                    }
                });
                clean = doc.body.innerHTML;
            } else {
                clean = `<p><span style="font-size: ${fsPx};">${doc.body.innerHTML}</span></p>`;
            }
        }
        return clean;
    }

    // Window global exports for backwards compatibility
    window.preserveConsecutiveSpaces = preserveConsecutiveSpaces;
    window.normalizeHtmlForQuill = normalizeHtmlForQuill;

    window.InspectorTextFormatter = {
        preserveConsecutiveSpaces: preserveConsecutiveSpaces,
        normalizeHtmlForQuill: normalizeHtmlForQuill
    };
})();
