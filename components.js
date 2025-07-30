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
                
                // Execute any scripts in the loaded component
                const scripts = contentPlaceholder.querySelectorAll('script');
                scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    newScript.textContent = script.textContent;
                    document.head.appendChild(newScript);
                    document.head.removeChild(newScript);
                });
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

// Content component loader
async function loadContentBox(type, config) {
    const componentFile = `components/content-box-${type}.html`;
    
    try {
        const response = await fetch(componentFile);
        const html = await response.text();
        
        // Create a temporary container to manipulate the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Find elements and populate with config data
        const component = tempDiv.querySelector(`[data-component="content-box-${type}"]`);
        
        // Set header content
        const headerEl = component.querySelector('[data-content="header"]');
        if (config.header) {
            headerEl.innerHTML = `<h4>${config.header}</h4>`;
        } else {
            headerEl.remove();
        }
        
        // Set text content
        const textEl = component.querySelector('[data-content="text"]');
        textEl.innerHTML = config.text;
        
        return component.outerHTML;
    } catch (error) {
        console.error('Error loading content box:', error);
        return '<div>Error loading content</div>';
    }
}

// Image component loader
async function loadContentImage(config) {
    const componentFile = `components/content-image.html`;
    
    try {
        const response = await fetch(componentFile);
        const html = await response.text();
        
        // Create a temporary container to manipulate the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Find elements and populate with config data
        const component = tempDiv.querySelector(`[data-component="content-image"]`);
        const img = component.querySelector('img');
        
        img.src = config.src;
        img.alt = config.alt || '';
        
        return component.outerHTML;
    } catch (error) {
        console.error('Error loading content image:', error);
        return '<div>Error loading image</div>';
    }
}

// Full-width content box loader
async function loadFullWidthBox(config) {
    const componentFile = `components/full-width-box.html`;
    
    try {
        const response = await fetch(componentFile);
        const html = await response.text();
        
        // Create a temporary container to manipulate the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Find elements and populate with config data
        const component = tempDiv.querySelector(`[data-component="full-width-box"]`);
        
        // Generate unique random angles based on content hash
        const contentHash = simpleHash(config.text + config.image.src);
        const topLeft = 15 + ((contentHash % 100) / 100) * 10 - 5; // 10-20%
        const topRight = 0 + ((Math.floor(contentHash / 100) % 100) / 100) * 10 - 5; // -5-5%
        const bottomRight = 100; // Keep at 100%
        const bottomLeft = 85 + ((Math.floor(contentHash / 10000) % 100) / 100) * 10 - 5; // 80-90%
        
        // Apply random clip-path
        const clipPath = `polygon(0 ${topLeft}%, 100% ${Math.max(0, topRight)}%, ${bottomRight}% 100%, 0 ${bottomLeft}%)`;
        component.style.clipPath = clipPath;
        
        // Set text content
        const textEl = component.querySelector('[data-content="text"]');
        textEl.innerHTML = config.text;
        
        // Set image
        const imgEl = component.querySelector('[data-content="image"] img');
        imgEl.src = config.image.src;
        imgEl.alt = config.image.alt || '';
        
        return component.outerHTML;
    } catch (error) {
        console.error('Error loading full-width box:', error);
        return '<div>Error loading content</div>';
    }
}

// Full-width content box alt loader
async function loadFullWidthBoxAlt(config) {
    const componentFile = `components/full-width-box-alt.html`;
    
    try {
        const response = await fetch(componentFile);
        const html = await response.text();
        
        // Create a temporary container to manipulate the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Find elements and populate with config data
        const component = tempDiv.querySelector(`[data-component="full-width-box-alt"]`);
        
        // Generate unique random angles based on content hash (different seed for alt)
        const contentHash = simpleHash(config.text + config.image.src + 'alt');
        const topLeft = 0 + ((contentHash % 100) / 100) * 10 - 5; // -5-5%
        const topRight = 15 + ((Math.floor(contentHash / 100) % 100) / 100) * 10 - 5; // 10-20%
        const bottomRight = 85 + ((Math.floor(contentHash / 10000) % 100) / 100) * 10 - 5; // 80-90%
        const bottomLeft = 100; // Keep at 100%
        
        // Apply random clip-path
        const clipPath = `polygon(0 ${Math.max(0, topLeft)}%, 100% ${topRight}%, 100% ${bottomRight}%, 0 ${bottomLeft}%)`;
        component.style.clipPath = clipPath;
        
        // Set text content
        const textEl = component.querySelector('[data-content="text"]');
        textEl.innerHTML = config.text;
        
        // Set image
        const imgEl = component.querySelector('[data-content="image"] img');
        imgEl.src = config.image.src;
        imgEl.alt = config.image.alt || '';
        
        return component.outerHTML;
    } catch (error) {
        console.error('Error loading full-width box alt:', error);
        return '<div>Error loading content</div>';
    }
}

// Simple hash function for consistent randomness
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
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