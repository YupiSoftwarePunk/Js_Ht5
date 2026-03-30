export function highlightActiveLink()
{
    var link = document.querySelectorAll('.nav-link');
    let currentUrl = window.location.pathname.split('/').pop() || 'index.html';

    for (var i = 0; i < link.length; i++) 
    {
        if (link[i].getAttribute('href') === currentUrl) 
        {
            link[i].classList.add('active');
        }
        else 
        {
            link[i].classList.remove('active');
        }
    }
}


const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
};


export function FilterPosts() {
    const elements = {
        input: document.querySelector('input'),
        list: document.getElementById('post-list'),
        stats: document.getElementById('stats-content'),
        readability: document.getElementById('filter-readability'),
        sort: document.getElementById('sort-posts'),
        exportBtn: document.getElementById('export-csv'),
        noResults: document.getElementById('no-results')
    };

    if (!elements.list || !elements.input) 
        return;

    const searchData = window.allBlogPosts.map(post => {
        return {
            originalData: post,
            originalTitle: post.title,
            content: post.content.toLowerCase(),
            tags: post.tags.toLowerCase(),
            date: new Date(post.date),
            views: parseInt(post.views) || 0,
            stats: analyzeText(post.content)
        };
    });

    function update() {
        const searchText = elements.input.value.toLowerCase();
        const complexityLimit = elements.readability ? parseFloat(elements.readability.value) : 0;
        const sortBy = elements.sort ? elements.sort.value : 'default';

        let visiblePosts = searchData.filter(post => {
            const isTextMatch = (post.originalTitle.toLowerCase() + post.content + post.tags).includes(searchText);
            let isComplexityMatch = true;
            const lix = parseFloat(post.stats.readability);
            
            if (complexityLimit === 20) isComplexityMatch = lix < 20;
            if (complexityLimit === 40) isComplexityMatch = lix >= 20 && lix < 40;
            if (complexityLimit === 60) isComplexityMatch = lix >= 40;
            
            return isTextMatch && isComplexityMatch;
        });

        if (sortBy !== "default") {
            visiblePosts.sort((a, b) => sortBy === 'date' ? b.date - a.date : b.views - a.views);
        }

        window.currentActivePosts = visiblePosts.map(p => p.originalData);

        if (typeof window.resetAndLoad === 'function') {
            window.resetAndLoad();
        }

        if (elements.noResults) {
            elements.noResults.style.display = visiblePosts.length > 0 ? "none" : "block";
        }

        updateBlogStats(visiblePosts, elements.stats);
        drawChart(visiblePosts);
    }

    const debouncedUpdate = debounce(update, 300);

    elements.input.addEventListener('input', debouncedUpdate);
    if (elements.readability) elements.readability.addEventListener('change', update);
    if (elements.sort) elements.sort.addEventListener('change', update);
    
    if (elements.exportBtn) {
        elements.exportBtn.addEventListener('click', () => {
            let csv = "Title,Date,Views,LIX\n";
            posts.forEach(p => {
                csv += `"${p.originalTitle}",${p.date.toLocaleDateString()},${p.views},${p.stats.readability}\n`;
            });
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "statistics.csv";
            link.click();
        });
    }
    update();

    if (typeof initFormatting === 'function') {
        initFormatting(posts); 
    }
}


export function getFriendlyDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 24 && diffInHours >= 0) {
        return diffInHours === 0 ? "Только что" : `${diffInHours} ч. назад`;
    } 
    else if (diffInDays === 1) {
        return "Вчера";
    } 
    else {
        return new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    }
}


export function analyzeText(text) {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const charCountWithSpace = text.length;
    const charCountNoSpace = text.replace(/\s+/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordLength = words.length ? (charCountNoSpace / words.length).toFixed(1) : 0;
    
    const longWords = words.filter(w => w.length > 6).length;
    const readability = sentences > 0 ? (words.length / sentences) + (longWords * 100 / words.length) : 0;
    const readTime = Math.ceil(words.length / 200); 

    return {
        words: words.length,
        chars: charCountWithSpace,
        charsNoSpace: charCountNoSpace,
        sentences: sentences,
        avgWord: avgWordLength,
        readability: readability.toFixed(1),
        readTime: readTime
    };
}


export function drawChart(visiblePosts) {
    const canvas = document.getElementById('publish-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (visiblePosts.length === 0) return;

    const months = new Array(12).fill(0);
    visiblePosts.forEach(p => {
        if (p.date instanceof Date && !isNaN(p.date)) {
            months[p.date.getMonth()]++;
        }
    });

    const max = Math.max(...months) || 1;
    const barWidth = 20;
    const spacing = 10;

    ctx.fillStyle = "#ff4757";
    months.forEach((count, i) => {
        const barHeight = (count / max) * (canvas.height - 20);
        const x = 20 + i * (barWidth + spacing);
        const y = canvas.height - barHeight - 15;
        
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = "#333";
        ctx.font = "10px Arial";
        ctx.fillText(i + 1, x + 5, canvas.height - 2);
        ctx.fillStyle = "#ff4757";
    });
}


export function updateBlogStats(visiblePosts, container) {
    if (!container) return;

    const totalReadTime = visiblePosts.reduce((sum, post) => {
    return sum + (post.stats.readTime || 0);
    }, 0);

    const totalWords = visiblePosts.reduce((acc, p) => acc + p.stats.words, 0);
        const avgReadTime = totalReadTime.toFixed(1);

    const tagsMap = {};
    visiblePosts.forEach(p => {
        p.tags.split(',').forEach(tag => {
            const t = tag.trim();
            if (t) tagsMap[t] = (tagsMap[t] || 0) + 1;
        });
    });
    const topCategory = Object.keys(tagsMap).reduce((a, b) => tagsMap[a] > tagsMap[b] ? a : b, "—");

    container.textContent = `Общее кол-во слов: ${totalWords} | Ср. время чтения: ${avgReadTime} мин. | Категория: ${topCategory}`;
}