// Page routing configuration
const pageRoutes = {
    'biography': 'index.html',
    'experience': 'experience.html', 
    'interests': 'projects.html',
    'music': 'music.html'
};

const pageTitles = {
    'index.html': 'Biography',
    'experience.html': 'Experience',
    'projects.html': 'Interests', 
    'music.html': 'Music'
};

// Load shared components and set active navigation
document.addEventListener('DOMContentLoaded', function() {
    // Load header
    fetch('components/header.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('header-placeholder').innerHTML = html;
            setActiveNavigation();
            setupRouting();
        });
    
    // Load footer
    fetch('components/footer.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('footer-placeholder').innerHTML = html;
        });
    
    // Set initial URL based on current page
    setInitialUrl();
});

function setActiveNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.headbar a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

function setupRouting() {
    const navLinks = document.querySelectorAll('.headbar a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            const title = pageTitles[href];
            if (title) {
                const route = title.toLowerCase();
                history.pushState({page: href}, title, '#' + route);
                window.location.href = href;
            }
        });
    });
}

function setInitialUrl() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const title = pageTitles[currentPage];
    if (title && !window.location.hash) {
        const route = title.toLowerCase();
        history.replaceState({page: currentPage}, title, '#' + route);
    }
}

function toggleMobileMenu() {
    const dropdown = document.getElementById('mobile-dropdown');
    dropdown.classList.toggle('show');
}