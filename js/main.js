import User from './core/User.js';
import AdminUser from './core/AdminUser.js';
import { Post } from './core/Post.js'
import { demoInheritance, demoButton, initDemo } from './modules/inheritanceModule.js';
import { TextFormatter } from './text-formatter.js';
import { highlightActiveLink, FilterPosts } from './navigation.js';
import { masterAdmin } from './modules/adminModule.js';
import { SaveData } from './SaveData.js';
import { initPostDetails, CreatePosts } from './modules/postModule.js';
import { initTags } from './modules/tagModule.js';
import { initKeyboardShortcuts, shortcutEditor } from './modules/KeyPressModule.js';

const blogStorage = new SaveData('Blog_');

window.TextFormatter = TextFormatter;
window.highlightActiveLink = highlightActiveLink;
window.FilterPosts = FilterPosts;
window.CreatePosts = CreatePosts; 
window.User = User;
window.AdminUser = AdminUser;
window.masterAdmin = masterAdmin;

console.log("Сайт загружен");

var links = document.querySelectorAll('.nav-link');

for (var i = 0; i < links.length; i++) 
{
    links[i].addEventListener('click', function (event) 
    {
        event.preventDefault();

        console.log(this.textContent.trim());

        var clickedLink = this;

        setTimeout(function () 
        {
            window.location.href = clickedLink.href; 
        }, 1000);
    });
}

window.onload = function () 
{
    var header = document.querySelector('header');
    header.style.backgroundColor = 'lightblue';

    var footer = document.querySelector('footer');
    var date = new Date();

    var day = String(date.getDate()).padStart(2, '0'); 
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var year = date.getFullYear();

    var formattedDate = day + '.' + month + '.' + year;
    footer.textContent = "© 2026 Мистер Денискис. Все права защищены. Текущая дата: " + formattedDate;

    if (typeof highlightActiveLink === 'function') highlightActiveLink();
    if (typeof FilterPosts === 'function') FilterPosts();

    setTimeout(() => {
        if (typeof TextFormatter !== 'undefined' && TextFormatter.HighlightTodayPosts) {
            TextFormatter.HighlightTodayPosts();
        } else {
            console.error("Критическая ошибка: HighlightTodayPosts не определен!");
        }
    }, 100);
};


const postsData = [
{ id: 1, date: "2023-10-01", views: "150", tags: "js, frontend", content: "```javascript\n" + `for (var i = 0; i < links.length; i++) \nconsole.log(link[i])` + "\n```", title: "Пост 1" },
{ id: 2, date: "2024-01-15", views: "500", tags: "html, css", content: "{}gsdfhjsa<>", title: "Пост 2" },
{ id: 3, date: "2023-12-20", views: "50", tags: "life, blog", content: "Мои мысли сегодня", title: "Пост 3" },
{ id: 4, date: "2024-02-01", views: "300", tags: "js, react", content: "Текст про реакт", title: "Пост 4" },
{ id: 5, date: "2023-05-10", views: "1000", tags: "news", content: "Важное объявление", title: "Пост 5" },
{ id: 6, date: "2026-2-26", views: "50", tags: "life, blog", content: "Мои мысли сегодня", title: "Пост 6" },
{ id: 7, date: "2026-3-10", views: "50", tags: "life, blog", content: "Классный текст, ваще все круто", title: "Пост 7" }];

const dynamicPosts = blogStorage.get('dynamic_posts') || [];
const allPosts = [...postsData, ...dynamicPosts];

window.allBlogPosts = allPosts;
window.currentPage = 0;
window.postsPerPage = 3;
window.currentActivePosts = [...allPosts];

window.resetAndLoad = () => {
    window.currentPage = 0;
    window.isAllLoaded = false;
    window.isLoading = false;

    const postList = document.getElementById('post-list');
    if (postList) postList.innerHTML = '';

    const endMsg = document.getElementById('end-message');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loader = document.getElementById('loader-indicator');

    if (endMsg) endMsg.style.display = 'none';
    if (loader) loader.style.display = 'none';
    if (loadMoreBtn) {
        loadMoreBtn.style.display = 'block';
    }
    window.loadNextBatch();
};

window.loadNextBatch = () => {
    if (window.isLoading || window.isAllLoaded) return;

    const loader = document.getElementById('loader-indicator');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const endMsg = document.getElementById('end-message');

    window.isLoading = true;

    if (loader) loader.style.display = 'block';
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';

    setTimeout(() => {
        const start = window.currentPage * window.postsPerPage;
        const end = start + window.postsPerPage;
        const chunk = window.currentActivePosts.slice(start, end);

        if (chunk.length > 0) {
            chunk.forEach(post => window.CreatePosts(post, blogStorage));
            window.currentPage++;
        }

        if (window.currentPage * window.postsPerPage >= window.currentActivePosts.length) {
            window.isAllLoaded = true;
            if (endMsg) endMsg.style.display = 'block';
            if (loader) loader.style.display = 'none';
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        } else {
            if (loader) loader.style.display = 'none';
            if (loadMoreBtn) loadMoreBtn.style.display = 'block'; 
        }

        window.isLoading = false;
    }, 800);
};

document.addEventListener('DOMContentLoaded', () => {
    const modalOverlay = document.getElementById('post-modal-overlay');
    const openBtn = document.getElementById('toggle-form-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const postForm = document.getElementById('new-post-form');

    const titleInput = document.getElementById('form-title');
    const tagsInput = document.getElementById('form-tags');
    const contentInput = document.getElementById('form-content');

    const postListElement = document.getElementById('post-list');
    if (postListElement) {
        const loader = document.createElement('div');
        loader.id = 'loader-indicator';
        loader.innerHTML = '<div class="spinner"></div><p>Загружаем посты...</p>';
        loader.style.display = 'none';
        loader.style.textAlign = 'center';
        postListElement.after(loader);

        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.id = 'load-more-btn';
        loadMoreBtn.textContent = 'Загрузить еще';
        loadMoreBtn.className = 'load-more-style'; 
        loadMoreBtn.onclick = () => window.loadNextBatch();
        loader.after(loadMoreBtn);

        const endMsg = document.createElement('div');
        endMsg.id = 'end-message';
        endMsg.textContent = 'Вы просмотрели все публикации.';
        endMsg.style.display = 'none';
        endMsg.style.textAlign = 'center';
        endMsg.style.padding = '20px';
        loadMoreBtn.after(endMsg);

        const sentinel = document.createElement('div');
        sentinel.id = 'scroll-sentinel';
        sentinel.style.height = '10px';
        endMsg.after(sentinel);

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !window.isLoading && !window.isAllLoaded) {
                window.loadNextBatch();
            }
        }, { rootMargin: '200px' });
        observer.observe(sentinel);
    }

    window.loadNextBatch();
    initTags();

    const closeModal = () => {
        modalOverlay.style.display = 'none';
        if (postForm) postForm.reset();
    };

    if (openBtn) {
        openBtn.onclick = () => {
            modalOverlay.style.display = 'flex';
            titleInput.focus();
        };
    }

    initKeyboardShortcuts(blogStorage);
    shortcutEditor(blogStorage);

    if (closeBtn) {
        closeBtn.onclick = closeModal;
    }

    window.addEventListener('click', (event) => {
        if (event.target === modalOverlay) closeModal();
    });

    if (contentInput) {
        contentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault(); 
                postForm.requestSubmit();
            }
        });
    }

    if (postForm) {
        postForm.onsubmit = (e) => {
            e.preventDefault();

            const title = document.getElementById('form-title').value;
            const tags = document.getElementById('form-tags').value;
            const content = document.getElementById('form-content').value;

            const newPostInstance = new Post(title, content, 99, tags);
            const postObject = newPostInstance.createNewPost();

            CreatePosts(postObject, blogStorage);

            const currentDynamic = blogStorage.get('dynamic_posts') || [];
            currentDynamic.push(postObject);
            blogStorage.set('dynamic_posts', currentDynamic);

            if (typeof masterAdmin !== 'undefined') {
                masterAdmin.externalLog(`Опубликован пост через класс Post: ${title}`);
            }

            closeModal();
            alert('Пост успешно опубликован!');
        };
    }

    setTimeout(() => {
        if (typeof initPostDetails === 'function') {
            initPostDetails(allPosts);
        }
    }, 200);

    initDemo();

    try {
        demoInheritance();
    } 
    catch (e) {
        console.error("Ошибка в процессе выполнения демо:", e);
    }
});

demoButton();
demoInheritance();

const admin = new AdminUser(1, 'Denis', blogStorage);

admin.grantPermission('manage_users');
admin.grantPermission('publish_posts');

console.log('Текущие права:', admin.getPermissions());