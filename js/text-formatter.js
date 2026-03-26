export const TextFormatter = {
    escapeHtml: (text) => {
        if (typeof text !== 'string') return '';
        const replacements = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;'
        };
        return text.replace(/[&<>"'/]/g, (match) => replacements[match]);
    },

    truncate: (maxLength, ellipsis = '...') => {
        if (typeof maxLength === 'string') {
            const text = maxLength;
            const limit = ellipsis === '...' ? 100 : ellipsis; 
            return text.length > limit ? text.substring(0, limit).trim() + '...' : text;
        }

        return (text) => {
            if (typeof text !== 'string') return '';
            return text.length > maxLength 
                ? text.substring(0, maxLength).trim() + ellipsis 
                : text;
        };
    },

    highlightKeywords: (keywords = [], className = 'highlight') => {
        return (text) => {
            if (!text) return '';
            let safeText = TextFormatter.escapeHtml(text);
            if (!keywords.length) return safeText;

            // let safeText = TextFormatter.escapeHtml(text);

            const pattern = keywords
                .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                .join('|');
            
            const regex = new RegExp(`(${pattern})`, 'gi');

            return safeText.replace(regex, `<mark class="${className}">$1</mark>`);
        };
    },

    formatCodeBlock: (code, language = 'javascript', theme = 'dark') => {
        const pre = document.createElement('pre');
        pre.className = `code-block code-theme-${theme}`;
        pre.setAttribute('data-lang', language);
        
        const codeElement = document.createElement('code');
        codeElement.textContent = code;
        
        pre.append(codeElement);
        return pre;
    },

    HighlightTodayPosts: () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; 
        const day = now.getDate();


        const todayString = `${year}-${month}-${day}`;

        const todayPosts = document.querySelectorAll(`li[data-date="${todayString}"]`);

        if (todayPosts.length > 0) {
            todayPosts.forEach(post => {
                post.classList.add('today-post');
            });
            console.log(`Подсвечено постов за сегодня: ${todayPosts.length}`);
        } 
        else {
            console.log("Сегодняшних постов не найдено для даты: " + todayString);
        }
    },

    syntaxHighlight: (code) => {
    let html = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    html = html
        .replace(/("(.*?)"|'(.*?)'|`(.*?)`)/g, '<span class="token-string">$1</span>')
        .replace(/(\/\/.*)/g, '<span class="token-comment">$1</span>');

    return html
        .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|class|new|async|await)\b/g, '<span class="token-keyword">$1</span>')
        .replace(/\b(console|window|document|Math|JSON|Object|Array)\b/g, '<span class="token-builtin">$1</span>')
        .replace(/\b(\d+)\b/g, '<span class="token-number">$1</span>');
    },

    toggleCodeTheme: (element) => {
        if (element && element.classList.contains('code-block')) {
            element.classList.toggle('code-theme-light');
            element.classList.toggle('is-active'); 
        }
    },

    applyFullFormatting: (text) => {
        if (!text) return '';

        const codeRegex = /\`\`\`(?:(\w+)\n)?([\s\S]*?)\`\`\`/g;
        
        let lastIndex = 0;
        let resultHtml = "";
        let match;

        const keywordHighlighter = TextFormatter.highlightKeywords(['js', 'текст', 'реакт', 'код']);

        while ((match = codeRegex.exec(text)) !== null) {
            const plainText = text.substring(lastIndex, match.index);
            resultHtml += keywordHighlighter(plainText);

            const lang = match[1] || 'javascript'; 
            const codeContent = match[2].trim();
            const highlightedCode = TextFormatter.syntaxHighlight(codeContent);

            resultHtml += `<pre class="code-block" data-lang="${lang}"><code>${highlightedCode}</code></pre>`;

            lastIndex = codeRegex.lastIndex;
        }
        resultHtml += keywordHighlighter(text.substring(lastIndex));

        return resultHtml;
    },

    createSanitizer: () => {
        const allowedTags = ['B', 'I', 'U', 'P', 'BR', 'STRONG', 'EM'];
        
        return (htmlString) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html');
            const fragment = document.createDocumentFragment();

            const sanitize = (node, target) => {
                node.childNodes.forEach(child => {
                    if (child.nodeType === Node.TEXT_NODE) {
                        target.append(document.createTextNode(child.textContent));
                    } else if (child.nodeType === Node.ELEMENT_NODE && allowedTags.includes(child.tagName)) {
                        const newElement = document.createElement(child.tagName);
                        sanitize(child, newElement);
                        target.append(newElement);
                    }
                });
            };

            sanitize(doc.body, fragment);
            return fragment; 
        };
    },

    getStats: (text) => {
        if (typeof text !== 'string' || !text.trim()) {
            return { chars: 0, words: 0, complexity: "Легкий" };
        }

        const chars = text.length;
        const words = text.trim().split(/\s+/).length;
        
        let complexity = "Легкий";
        if (words > 50 || chars > 300) complexity = "Средний";
        if (words > 100 || text.includes("```")) complexity = "Сложный";
        
        return { chars, words, complexity };
    },

    formatAsync: async (text, formatterFunc) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const result = formatterFunc(text);
                resolve(result);
            }, 0);
        });
    }
};


export function initFormatting(posts) {
    const btn = document.getElementById('format-posts-btn');
    const modal = document.getElementById('format-modal');
    const overlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');

    if (!btn || !modal) return;

    btn.addEventListener('click', () => {
        modalContent.innerHTML = '';
        let hasChanges = false;

        posts.forEach(post => {
            if (post.element.style.display === 'none') return;

            const originalText = post.content;
            const formattedHtml = TextFormatter.applyFullFormatting(originalText);

            if (originalText !== formattedHtml) {
                hasChanges = true;
                const postBox = document.createElement('div');
                postBox.className = 'modal-comparison-item';
                postBox.style.cssText = 'border-bottom: 1px solid #ddd; padding-bottom: 15px; margin-bottom: 15px;';

                const title = document.createElement('h4');
                title.textContent = post.originalTitle || 'Без названия';

                const grid = document.createElement('div');
                grid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 20px;';

                const before = document.createElement('div');
                before.innerHTML = `<b>До:</b> <pre style="white-space: pre-wrap;">${originalText}</pre>`;

                const after = document.createElement('div');
                const afterTextContainer = document.createElement('div');
                afterTextContainer.innerHTML = `<b>После:</b> ${formattedHtml}`;
                after.append(afterTextContainer);

                grid.append(before, after);
                postBox.append(title, grid);
                modalContent.append(postBox);
            }
        });

        if (!hasChanges) {
            modalContent.innerHTML = '<p style="text-align:center">Нет изменений для отображения.</p>';
        }

        modal.style.display = 'block';
        overlay.style.display = 'block';
    });
}


export function debounce(func, delay = 300) {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
}