export function initTags() {
    const postList = document.getElementById('post-list');
    const posts = Array.from(postList.querySelectorAll('li'));
    const tagsContainer = document.getElementById('tags-container');

    const allTags = new Set();
    posts.forEach(post => {
        const tags = post.dataset.tags.split(',').map(tag => tag.trim());
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
    resetBtn.onclick = () => posts.forEach(p => p.style.display = 'block');
    tagsContainer.prepend(resetBtn);


    function filterByTag(selectedTag) {
        posts.forEach(post => {
            const postTags = post.dataset.tags.split(',').map(tag => tag.trim());
            if (postTags.includes(selectedTag)) {
                post.style.display = 'block'; 
                post.style.borderLeft = "4px solid #007bff"; 
            } else {
                post.style.display = 'none'; 
            }
        });
    }
}