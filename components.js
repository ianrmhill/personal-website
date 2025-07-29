// Page routing configuration
const routes = {
    'biography': 'components/biography.html',
    'experience': 'components/experience.html', 
    'interests': 'components/interests.html',
    'music': 'components/music.html'
};

// Load shared components and set up routing
document.addEventListener('DOMContentLoaded', function() {
    // Load header
    fetch('components/header.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('header-placeholder').innerHTML = html;
            setupNavigation();
        });
    
    // Load footer
    fetch('components/footer.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('footer-placeholder').innerHTML = html;
        });
    
    // Handle initial route
    handleRoute();
    
    // Listen for popstate events (back/forward buttons)
    window.addEventListener('popstate', handleRoute);
});

function setupNavigation() {
    const navLinks = document.querySelectorAll('.headbar a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const route = this.textContent.toLowerCase();
            navigateTo(route);
            
            // Close mobile menu if open
            const mobileDropdown = document.getElementById('mobile-dropdown');
            if (mobileDropdown && mobileDropdown.classList.contains('show')) {
                mobileDropdown.classList.remove('show');
            }
        });
    });
}

function navigateTo(route) {
    const url = `/${route}`;
    history.pushState({route: route}, '', url);
    loadPage(route);
    updateActiveNavigation(route);
}

function handleRoute() {
    const path = window.location.pathname;
    let route = path.substring(1) || 'biography'; // Remove leading slash, default to biography
    
    // Handle root path
    if (route === '' || route === 'index.html') {
        route = 'biography';
    }
    
    loadPage(route);
    updateActiveNavigation(route);
}

function loadPage(route) {
    const contentPlaceholder = document.getElementById('content-placeholder');
    const componentFile = routes[route];
    
    if (componentFile) {
        fetch(componentFile)
            .then(response => response.text())
            .then(html => {
                contentPlaceholder.innerHTML = html;
                // Update page title
                document.title = `Ian Hill - ${route.charAt(0).toUpperCase() + route.slice(1)}`;
            })
            .catch(error => {
                console.error('Error loading page:', error);
                contentPlaceholder.innerHTML = '<p>Page not found</p>';
            });
    } else {
        contentPlaceholder.innerHTML = '<p>Page not found</p>';
    }
}

function updateActiveNavigation(currentRoute) {
    const navLinks = document.querySelectorAll('.headbar a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkRoute = link.textContent.toLowerCase();
        if (linkRoute === currentRoute) {
            link.classList.add('active');
        }
    });
}

function toggleMobileMenu() {
    const dropdown = document.getElementById('mobile-dropdown');
    dropdown.classList.toggle('show');
}

// Email obfuscation function
function sendEmail() {
    // Obfuscated email parts
    const user = String.fromCharCode(105,97,110,114,109,104,105,108,108); // ianrmhill
    const domain = String.fromCharCode(103,109,97,105,108); // gmail
    const tld = String.fromCharCode(99,111,109); // com
    
    // Construct the email
    const email = user + String.fromCharCode(64) + domain + String.fromCharCode(46) + tld;
    
    // Open email client
    window.location.href = 'mailto:' + email;
}