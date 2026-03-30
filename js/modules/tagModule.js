export function initTags() {
    const tagsContainer = document.getElementById('tags-container');
    if (!tagsContainer) return;

    const allTags = new Set();

    window.allBlogPosts.forEach(post => {
        const tags = post.tags.split(',').map(tag => tag.trim());
        tags.forEach(tag => allTags.add(tag));
    });

    allTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.textContent = `#${tag}`;
        btn.style.margin = "0 5px";
        btn.style.cursor = "pointer";
        
        btn.onclick = () => filterByTag(tag);
        tagsContainer.appendChild(btn);
    });

    const resetBtn = document.createElement('button');
    resetBtn.textContent = "Сбросить всё";
    resetBtn.onclick = () => {
        document.getElementById('post-list').innerHTML = '';
        window.currentActivePosts = [...window.allBlogPosts];
        window.currentPage = 0;
        window.resetAndLoad();
    };
    tagsContainer.prepend(resetBtn);

    function filterByTag(selectedTag) {
        document.getElementById('post-list').innerHTML = '';
        window.currentActivePosts = window.allBlogPosts.filter(post => {
            const postTags = post.tags.split(',').map(tag => tag.trim());
            return postTags.includes(selectedTag);
        });
        window.currentPage = 0;
        window.resetAndLoad();

        setTimeout(() => {
            document.querySelectorAll('#post-list li').forEach(li => {
                li.style.borderLeft = "4px solid #007bff";
            });
        }, 50);
    }
}