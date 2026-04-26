/* ===========================
   Theme Toggle
   =========================== */
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;
const themeIcon = document.querySelector('.theme-icon');

// Initialize theme from localStorage or system preference
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    if (isDark) {
        htmlElement.classList.add('dark-mode');
        themeIcon.textContent = '☀️';
    } else {
        htmlElement.classList.remove('dark-mode');
        themeIcon.textContent = '🌙';
    }
}

// Toggle theme
function toggleTheme() {
    htmlElement.classList.toggle('dark-mode');
    const isDark = htmlElement.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeIcon.textContent = isDark ? '☀️' : '🌙';
}

themeToggle.addEventListener('click', toggleTheme);
initTheme();

/* ===========================
   Page Navigation
   =========================== */
const navLinks = document.querySelectorAll('.nav-link');
const pageSections = document.querySelectorAll('.page-section');

function navigateTo(page) {
    // Hide all sections
    pageSections.forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const selectedSection = document.getElementById(page);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }

    // Update active nav link
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });

    // Update URL hash
    window.location.hash = page;
}

// Navigation click handlers
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        navigateTo(page);
    });
});

// Handle browser back/forward buttons
window.addEventListener('hashchange', () => {
    const page = window.location.hash.slice(1) || 'about';
    navigateTo(page);
});

// Initialize page on load
window.addEventListener('load', () => {
    const page = window.location.hash.slice(1) || 'about';
    navigateTo(page);
});
