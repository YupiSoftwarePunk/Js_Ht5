import { createLike } from './PostLikeModule.js';
import { TextFormatter } from '../text-formatter.js';

export function initPostDetails(postsData) {
    const modal = document.getElementById('post-detail-modal');
    const overlay = document.getElementById('post-detail-overlay');
    const contentEdit = document.getElementById('detail-content-edit');
    const previewContainer = document.getElementById('detail-preview-container');
    const previewResult = document.getElementById('detail-formatted-result');

    let currentPostIndex = null;
    const postList = document.getElementById('post-list');
    
    postList.addEventListener('click', (event) => {
        const li = event.target.closest('.focusable-post');
        if (!li) return; 
        if (event.target.classList.contains('tag')) return; 

        currentPostIndex = postsData.findIndex(p => String(p.id) === String(li.id));
        if (currentPostIndex === -1) return;

        const post = postsData[currentPostIndex];
        document.getElementById('detail-title').textContent = post.title;
        contentEdit.value = post.content;
        const stats = TextFormatter.getStats(post.content);
        document.getElementById('stat-date').textContent = post.date;
        document.getElementById('stat-views').textContent = post.views;
        document.getElementById('stat-chars').textContent = stats.chars;
        document.getElementById('stat-words').textContent = stats.words;
        document.getElementById('stat-readability').textContent = stats.complexity;

        previewContainer.style.display = 'none';
        modal.style.display = 'block';
        overlay.style.display = 'block';
    });

    document.getElementById('detail-format-btn').onclick = () => {
        const text = contentEdit.value;
        previewResult.innerHTML = TextFormatter.applyFullFormatting(text);
        previewContainer.style.display = 'block';
    };

    document.getElementById('detail-save-btn').onclick = () => {
        if (currentPostIndex !== null) {
            const newText = contentEdit.value;

            postsData[currentPostIndex].content = newText;

            const li = postElements[currentPostIndex];
            li.setAttribute('data-content', newText); 

            const previewDiv = li.querySelector('.post-content-preview');
            if (previewDiv) {
                previewDiv.innerHTML = TextFormatter.applyFullFormatting(newText);
            }

            modal.style.display = 'none';
            overlay.style.display = 'none';

            console.log('Пост успешно обновлен в памяти');
        }
    };

    const close = () => {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    };
    
    document.getElementById('detail-close-btn').addEventListener('click', close);
    overlay.addEventListener('click', close);
}


export function CreatePosts(data, storage)
{
    let posts = document.querySelector('#post-list');

    if (!posts)
    {
        return;
    }

    const likedPosts = storage.get('liked_posts', []);
    const isLiked = likedPosts.includes(data.id);

    let newItem = document.createElement('li');
    newItem.setAttribute('data-date', data.date);
    newItem.setAttribute('data-views', data.views);
    newItem.setAttribute('data-tags', data.tags);
    newItem.setAttribute('data-content', data.content);
    newItem.setAttribute('tabindex', '0');
    newItem.classList.add('focusable-post');
    newItem.style.cursor = 'pointer';
    newItem.id = data.id;


    newItem.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && document.activeElement === newItem) {
            if (typeof initPostDetails === 'function') {
                newItem.click(); 
            }
        }
    });

    let span = document.createElement('span');
    span.classList.add('post-title');
    span.textContent = data.title;

    let div = document.createElement('div');
    div.classList.add('post-stats-node');
    div.style.fontSize = '0.8em';
    div.style.color = 'gray';

    let spanDate = document.createElement('span');
    spanDate.classList.add('stats-date');
    spanDate.textContent = data.date;
    
    let spanReadTime = document.createElement('span');
    spanReadTime.classList.add('stats-read-time');

    const wordCount = data.content.split(/\s+/).length;
    spanReadTime.textContent = `Время чтения: ${Math.ceil(wordCount / 200)} мин.`;
    
    let spanDetails = document.createElement('span');
    spanDetails.classList.add('stats-details');
    spanDetails.textContent = `Теги: `;
    data.tags.split(',').forEach(tag => {
        let tagBtn = document.createElement('button'); 
        tagBtn.classList.add('tag');                  
        tagBtn.textContent = tag.trim();              
        spanDetails.append(tagBtn);
    });

    const likeBtn = createLike(data, isLiked);
    likeBtn.classList.add('like-trigger');
    likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const currentLiked = storage.get('liked_posts', []);
        const hasLike = likeBtn.classList.toggle('is-liked');

        if (hasLike) {
            if (!currentLiked.includes(data.id)) {
                currentLiked.push(data.id);
            }
        } 
        else {
            const index = currentLiked.indexOf(data.id);
            if (index > -1) currentLiked.splice(index, 1);
        }

        storage.set('liked_posts', currentLiked);
        
        if (typeof masterAdmin !== 'undefined') {
            masterAdmin.externalLog(`${hasLike ? 'Лайк' : 'Дизлайк'} посту №${data.id}`);
        }
    });

    div.append(spanDate, " | ", spanReadTime, " | ", spanDetails, likeBtn);

    let contentPreviewDiv = document.createElement('div');
    contentPreviewDiv.classList.add('post-content-preview');
    contentPreviewDiv.style.marginTop = '10px';

    if (typeof TextFormatter !== 'undefined') {
        const formattedContent = TextFormatter.applyFullFormatting(data.content);
        contentPreviewDiv.innerHTML = formattedContent;
    }

    newItem.append(span, div, contentPreviewDiv);
    posts.appendChild(newItem);
}