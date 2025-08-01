// Global content store
let siteContent = null;
let routes = {};

// Load shared components and set up routing
document.addEventListener('DOMContentLoaded', function() {
    // Load content.yaml first
    loadSiteContent().then(() => {
        // Load header
        fetch('components/header.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('header-placeholder').innerHTML = html;
                generateNavigation();
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
});

// Load and parse YAML content
async function loadSiteContent() {
    try {
        const response = await fetch('content.yaml');
        const yamlText = await response.text();
        siteContent = jsyaml.load(yamlText);
        
        // Build routes from YAML keys (exclude Home from routes as it's the default)
        Object.keys(siteContent).forEach(key => {
            if (key !== 'Home') {
                routes[key.toLowerCase()] = key;
            }
        });
        
        console.log('Site content loaded:', siteContent);
        console.log('Routes generated:', routes);
    } catch (error) {
        console.error('Error loading site content:', error);
        // Fallback to empty content
        siteContent = {};
    }
}

// Generate navigation menu from YAML content
function generateNavigation() {
    const navList = document.querySelector('.headbar .desktop-nav');
    if (!navList || !siteContent) return;
    
    // Find the navigation links container (skip the name element)
    const existingLinks = navList.querySelectorAll('li:nth-child(n+3)');
    existingLinks.forEach(link => link.remove());
    
    // Add new navigation links (exclude 'Home')
    Object.keys(siteContent).forEach(pageName => {
        if (pageName === 'Home') return; // Skip Home from navigation
        
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `/${pageName.toLowerCase()}`;
        a.textContent = pageName;
        li.appendChild(a);
        navList.appendChild(li);
    });
    
    // Update mobile navigation too (exclude 'Home')
    const mobileDropdown = document.getElementById('mobile-dropdown');
    if (mobileDropdown) {
        mobileDropdown.innerHTML = '';
        Object.keys(siteContent).forEach(pageName => {
            if (pageName === 'Home') return; // Skip Home from navigation
            
            const a = document.createElement('a');
            a.href = `/${pageName.toLowerCase()}`;
            a.textContent = pageName;
            mobileDropdown.appendChild(a);
        });
    }
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.headbar a');
    navLinks.forEach(link => {
        // Skip the name links - let them behave as normal links
        const isDesktopNameLink = link.closest('li:first-child');
        const isMobileNameLink = link.closest('.mobile-nav') && link.querySelector('h3');
        const isNameLink = link.textContent.trim() === 'Ian Hill';
        
        if (isDesktopNameLink || isMobileNameLink || isNameLink) {
            console.log('Skipping name link:', link.textContent);
            return;
        }
        
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
    let route = path.substring(1); // Remove leading slash
    
    // Handle root path - default to Home
    if (route === '' || route === 'index.html') {
        route = 'home';
    }
    
    loadPage(route);
    updateActiveNavigation(route);
}

async function loadPage(route) {
    const contentPlaceholder = document.getElementById('content-placeholder');
    let pageName = routes[route];
    
    // Special case for home route
    if (route === 'home') {
        pageName = 'Home';
    }
    
    if (!pageName || !siteContent[pageName]) {
        contentPlaceholder.innerHTML = '<p>Page not found</p>';
        return;
    }
    
    // Update page title
    document.title = `Ian Hill - ${pageName}`;
    
    // Generate page content
    try {
        const pageContent = await generatePageContent(siteContent[pageName]);
        contentPlaceholder.innerHTML = pageContent;
        
        // Set dynamic background image based on page name
        const backgroundElement = document.getElementById('dynamic-background');
        if (backgroundElement) {
            // Use the original pageName case to match image files
            backgroundElement.style.backgroundImage = `url('images/${pageName}.jpg')`;
            console.log(`Setting background image: images/${pageName}.jpg`);
        }
    } catch (error) {
        console.error('Error generating page content:', error);
        contentPlaceholder.innerHTML = '<p>Error loading page content</p>';
    }
}

async function generatePageContent(contentItems) {
    const foregroundDiv = '<div class="foreground">';
    let content = foregroundDiv;
    
    for (let i = 0; i < contentItems.length; i++) {
        const item = contentItems[i];
        const isAlt = i % 2 === 1; // Alternate between variants
        
        // Check if this is an image-only item (has image but no text/heading)
        if (item.image && !item.text && !item.heading) {
            const imageConfig = {
                src: await getImagePath(item.image),
                alt: item.image
            };
            content += await loadFullWidthImageOnly(imageConfig);
        } else {
            const config = {
                text: generateContentText(item),
                image: item.image ? {
                    src: await getImagePath(item.image),
                    alt: item.heading || ''
                } : null,
                audio: item.audio ? {
                    src: await getAudioPath(item.audio),
                    name: item.audio
                } : null,
                spotify: item.spotify ? {
                    src: item.spotify
                } : null
            };
            
            if (isAlt) {
                content += await loadFullWidthBoxAlt(config);
            } else {
                content += await loadFullWidthBox(config);
            }
        }
    }
    
    content += '</div>';
    return content;
}

// Function to detect correct image extension
async function getImagePath(imageName) {
    const extensions = ['jpg', 'png', 'jpeg'];
    
    for (const ext of extensions) {
        const imagePath = `images/${imageName}.${ext}`;
        try {
            const response = await fetch(imagePath, { method: 'HEAD' });
            if (response.ok) {
                return imagePath;
            }
        } catch (error) {
            // Continue to next extension
        }
    }
    
    // Fallback to .jpg if nothing found
    return `images/${imageName}.jpg`;
}

// Function to detect correct audio extension
async function getAudioPath(audioName) {
    const extensions = ['flac', 'mp3', 'wav', 'ogg', 'aac'];
    
    for (const ext of extensions) {
        const audioPath = `artifacts/${audioName}.${ext}`;
        try {
            const response = await fetch(audioPath, { method: 'HEAD' });
            if (response.ok) {
                return audioPath;
            }
        } catch (error) {
            // Continue to next extension
        }
    }
    
    // Fallback to .mp3 if nothing found
    return `artifacts/${audioName}.mp3`;
}

function generateContentText(item) {
    let text = '';
    if (item.heading) {
        text += `<h2>${item.heading}</h2>`;
    }
    if (item.text) {
        // Simple approach: convert newlines directly to HTML line breaks, then wrap in paragraph  
        let processedText = item.text.trim();
        
        // Convert "CV" to downloadable link
        processedText = processedText.replace(/\bCV\b/g, '<a href="artifacts/CV.pdf" target="_blank" download>CV</a>');
        
        // Convert "ORCID" to external link
        processedText = processedText.replace(/\bORCID\b/g, '<a href="https://orcid.org/0000-0001-9782-8522" target="_blank">ORCID</a>');
        
        // Convert **text** to bold formatting
        processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert newlines to HTML line breaks with extra spacing
        processedText = processedText.replace(/\n/g, '<br><br>');
        
        // Wrap the entire content in a single paragraph
        text += `<p>${processedText}</p>`;
    }
    return text;
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
        const contentHash = simpleHash(config.text + (config.image ? config.image.src : 'no-image'));
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
        const imageSection = component.querySelector('[data-content="image"]');
        if (config.image) {
            const imgEl = imageSection.querySelector('img');
            imgEl.src = config.image.src;
            imgEl.alt = config.image.alt || '';
        } else {
            // Hide image section if no image provided
            imageSection.style.display = 'none';
        }
        
        // Set audio
        const audioSection = component.querySelector('[data-content="audio"]');
        if (config.audio) {
            const audioEl = audioSection.querySelector('audio');
            const sourceEl = audioEl.querySelector('source');
            sourceEl.src = config.audio.src;
            
            // Set MIME type based on file extension
            const extension = config.audio.src.split('.').pop().toLowerCase();
            const mimeTypes = {
                'flac': 'audio/flac',
                'mp3': 'audio/mpeg',
                'wav': 'audio/wav',
                'ogg': 'audio/ogg',
                'aac': 'audio/aac'
            };
            sourceEl.type = mimeTypes[extension] || 'audio/mpeg';
            
            audioSection.style.display = 'block';
        } else {
            // Keep audio section hidden if no audio provided
            audioSection.style.display = 'none';
        }
        
        // Set Spotify
        const spotifySection = component.querySelector('[data-content="spotify"]');
        if (config.spotify) {
            const iframeEl = spotifySection.querySelector('iframe');
            // Try using track embed URL structure without album art
            let spotifyUrl = config.spotify.src;
            // Convert to compact track embed format
            if (spotifyUrl.includes('/track/')) {
                spotifyUrl = spotifyUrl.replace('/embed/track/', '/embed/track/');
                if (spotifyUrl.includes('?')) {
                    spotifyUrl = spotifyUrl.split('?')[0];
                }
                spotifyUrl += '?utm_source=generator&theme=0&view=coverart&autoplay=false&timeout=300';
            }
            iframeEl.src = spotifyUrl;
            spotifySection.style.display = 'block';
        } else {
            // Keep Spotify section hidden if no Spotify provided
            spotifySection.style.display = 'none';
        }
        
        // Adjust layout if no media is present
        const mediaSection = component.querySelector('.content-media-section');
        if (!config.image && !config.audio && !config.spotify) {
            // No media at all, hide media section
            mediaSection.style.display = 'none';
            const innerDiv = component.querySelector('.full-width-inner');
            innerDiv.classList.add('no-media-layout');
        } else if (!config.image) {
            // No image but has audio/spotify, hide image section
            const imageSection = component.querySelector('.content-image-section');
            imageSection.style.display = 'none';
        }
        
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
        const contentHash = simpleHash(config.text + (config.image ? config.image.src : 'no-image') + 'alt');
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
        const imageSection = component.querySelector('[data-content="image"]');
        if (config.image) {
            const imgEl = imageSection.querySelector('img');
            imgEl.src = config.image.src;
            imgEl.alt = config.image.alt || '';
        } else {
            // Hide image section if no image provided
            imageSection.style.display = 'none';
        }
        
        // Set audio
        const audioSection = component.querySelector('[data-content="audio"]');
        if (config.audio) {
            const audioEl = audioSection.querySelector('audio');
            const sourceEl = audioEl.querySelector('source');
            sourceEl.src = config.audio.src;
            
            // Set MIME type based on file extension
            const extension = config.audio.src.split('.').pop().toLowerCase();
            const mimeTypes = {
                'flac': 'audio/flac',
                'mp3': 'audio/mpeg',
                'wav': 'audio/wav',
                'ogg': 'audio/ogg',
                'aac': 'audio/aac'
            };
            sourceEl.type = mimeTypes[extension] || 'audio/mpeg';
            
            audioSection.style.display = 'block';
        } else {
            // Keep audio section hidden if no audio provided
            audioSection.style.display = 'none';
        }
        
        // Set Spotify
        const spotifySection = component.querySelector('[data-content="spotify"]');
        if (config.spotify) {
            const iframeEl = spotifySection.querySelector('iframe');
            // Try using track embed URL structure without album art
            let spotifyUrl = config.spotify.src;
            // Convert to compact track embed format
            if (spotifyUrl.includes('/track/')) {
                spotifyUrl = spotifyUrl.replace('/embed/track/', '/embed/track/');
                if (spotifyUrl.includes('?')) {
                    spotifyUrl = spotifyUrl.split('?')[0];
                }
                spotifyUrl += '?utm_source=generator&theme=0&view=coverart&autoplay=false&timeout=300';
            }
            iframeEl.src = spotifyUrl;
            spotifySection.style.display = 'block';
        } else {
            // Keep Spotify section hidden if no Spotify provided
            spotifySection.style.display = 'none';
        }
        
        // Adjust layout if no media is present
        const mediaSection = component.querySelector('.content-media-section');
        if (!config.image && !config.audio && !config.spotify) {
            // No media at all, hide media section
            mediaSection.style.display = 'none';
            const innerDiv = component.querySelector('.full-width-inner');
            innerDiv.classList.add('no-media-layout');
        } else if (!config.image) {
            // No image but has audio/spotify, hide image section
            const imageSection = component.querySelector('.content-image-section');
            imageSection.style.display = 'none';
        }
        
        return component.outerHTML;
    } catch (error) {
        console.error('Error loading full-width box alt:', error);
        return '<div>Error loading content</div>';
    }
}


// Full-width image-only loader
async function loadFullWidthImageOnly(config) {
    const componentFile = `components/full-width-image-only.html`;
    
    try {
        const response = await fetch(componentFile);
        const html = await response.text();
        
        // Create a temporary container to manipulate the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Find elements and populate with config data
        const component = tempDiv.querySelector(`[data-component="full-width-image-only"]`);
        
        // Generate unique random angles based on image path
        const contentHash = simpleHash(config.src);
        const topLeft = 15 + ((contentHash % 100) / 100) * 10 - 5; // 10-20%
        const topRight = 0 + ((Math.floor(contentHash / 100) % 100) / 100) * 10 - 5; // -5-5%
        const bottomRight = 100; // Keep at 100%
        const bottomLeft = 85 + ((Math.floor(contentHash / 10000) % 100) / 100) * 10 - 5; // 80-90%
        
        // Apply random clip-path
        const clipPath = `polygon(0 ${topLeft}%, 100% ${Math.max(0, topRight)}%, ${bottomRight}% 100%, 0 ${bottomLeft}%)`;
        component.style.clipPath = clipPath;
        
        // Set image
        const imgEl = component.querySelector('img');
        imgEl.src = config.src;
        imgEl.alt = config.alt || '';
        
        return component.outerHTML;
    } catch (error) {
        console.error('Error loading full-width image-only:', error);
        return '<div>Error loading image content</div>';
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