/* ===========================
   Blog and Quickies Handler
   =========================== */

let allPosts = [];
let allQuickies = [];
let filteredPosts = [];
let currentPage = 'blogs'; // 'blogs' or 'quickies'

/* ===========================
   Fetch and Parse Posts
   =========================== */
async function loadPosts() {
    try {
        const response = await fetch('data/posts.json');
        const data = await response.json();
        allPosts = data.posts || [];
        filteredPosts = [...allPosts];
        renderBlogList();
    } catch (error) {
        console.error('Error loading posts:', error);
        document.getElementById('blog-list').innerHTML = '<p class="no-results">Failed to load posts.</p>';
    }
}

async function loadQuickies() {
    try {
        const response = await fetch('data/posts.json');
        const data = await response.json();
        allQuickies = data.quickies || [];
        renderQuickiesList();
    } catch (error) {
        console.error('Error loading quickies:', error);
        document.getElementById('quickies-list').innerHTML = '<p class="no-results">Failed to load quickies.</p>';
    }
}

/* ===========================
   Render Blog List
   =========================== */
function renderBlogList(posts = filteredPosts) {
    const blogListContainer = document.getElementById('blog-list');
    const postDetailContainer = document.getElementById('post-detail');

    if (posts.length === 0) {
        blogListContainer.innerHTML = '<p class="no-results">No posts found.</p>';
        return;
    }

    blogListContainer.innerHTML = posts.map(post => `
        <div class="blog-item" data-post-id="${post.slug}">
            <div class="blog-item-date">${formatDate(post.date)}</div>
            <h3 class="blog-item-title">${post.title}</h3>
            <p class="blog-item-excerpt">${post.excerpt}</p>
        </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.blog-item').forEach(item => {
        item.addEventListener('click', () => {
            const postId = item.dataset.postId;
            viewPost(postId);
        });
    });
}

/* ===========================
   View Individual Post
   =========================== */
function viewPost(postSlug) {
    const post = allPosts.find(p => p.slug === postSlug);
    if (!post) return;

    const blogListContainer = document.getElementById('blog-list');
    const postDetailContainer = document.getElementById('post-detail');
    const postContent = document.getElementById('post-content');

    // Hide blog list, show post detail
    blogListContainer.style.display = 'none';
    postDetailContainer.style.display = 'block';

    // Render post content
    postContent.innerHTML = `
        <h1>${post.title}</h1>
        <div class="post-meta" style="color: var(--text-secondary); margin-bottom: var(--spacing-lg); font-size: var(--font-size-small);">
            Published on ${formatDate(post.date)}
        </div>
        ${post.content}
    `;

    // Scroll to top
    window.scrollTo(0, 0);
}

/* ===========================
   Back to Blog List
   =========================== */
document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            document.getElementById('blog-list').style.display = 'block';
            document.getElementById('post-detail').style.display = 'none';
            window.scrollTo(0, 0);
        });
    }
});

/* ===========================
   Search Functionality
   =========================== */
const searchInput = document.getElementById('search-input');
let searchDebounceTimeout;

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimeout);
        searchDebounceTimeout = setTimeout(() => {
            const query = e.target.value.toLowerCase().trim();
            filterPosts(query);
        }, 300); // 300ms debounce
    });
}

function filterPosts(query) {
    if (query === '') {
        filteredPosts = [...allPosts];
    } else {
        filteredPosts = allPosts.filter(post => {
            const titleMatch = post.title.toLowerCase().includes(query);
            const contentMatch = post.content.toLowerCase().includes(query);
            return titleMatch || contentMatch;
        });
    }
    renderBlogList(filteredPosts);
}

/* ===========================
   Render Quickies List
   =========================== */
function renderQuickiesList() {
    const quickiesListContainer = document.getElementById('quickies-list');

    if (allQuickies.length === 0) {
        quickiesListContainer.innerHTML = '<p class="no-results">No quickies yet. Check back soon!</p>';
        return;
    }

    quickiesListContainer.innerHTML = allQuickies.map(quickie => `
        <div class="quickie-card">
            <div class="quickie-date">${formatDate(quickie.date)}</div>
            <h3 class="quickie-title">${quickie.title}</h3>
            <div class="quickie-content">${quickie.content}</div>
        </div>
    `).join('');
}

/* ===========================
   Utility Functions
   =========================== */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}

/* ===========================
   Initialize on Page Load
   =========================== */
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    loadQuickies();

    // Update loaded status when page changes
    const pageSections = document.querySelectorAll('.page-section');
    pageSections.forEach(section => {
        const observer = new MutationObserver(() => {
            if (section.classList.contains('active')) {
                if (section.id === 'blogs') {
                    currentPage = 'blogs';
                    searchInput?.focus();
                } else if (section.id === 'quickies') {
                    currentPage = 'quickies';
                }
            }
        });
        observer.observe(section, { attributes: true, attributeFilter: ['class'] });
    });
});
