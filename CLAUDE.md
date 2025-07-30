# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Single Page Application (SPA) personal website for Ian Hill built with vanilla HTML, CSS, and JavaScript. The site consists of 4 main pages showcasing Ian's biography, experience, interests/projects, and music background with client-side routing for smooth navigation.

## Architecture

- **Single Page Application**: Uses client-side routing with JavaScript (components.js)
- **Component-based structure**: Modular HTML components loaded dynamically
- **Single stylesheet**: All styling is contained in `style.css`
- **GitHub Pages hosting**: Configured with proper SPA routing support
- **Images**: Background images and inline photos stored directly in root directory

### File Structure
- `index.html` - Main SPA entry point
- `404.html` - GitHub Pages SPA fallback (copy of index.html)
- `components.js` - Client-side routing and component loading logic
- `components/` - Modular HTML components:
  - `header.html` - Navigation header
  - `footer.html` - Site footer
  - `biography.html` - Biography page content
  - `experience.html` - Professional experience content
  - `interests.html` - Projects and interests content
  - `music.html` - Music background content
  - Content box components for reusable UI elements
- `style.css` - Complete stylesheet with responsive design
- `fonts/` - Walkway font family files
- `images/` - Photos and background images
- `.htaccess` - Apache server SPA routing fallback
- `_redirects` - Netlify hosting SPA routing fallback

### Routing System
- **Client-side routing**: URLs like `/experience` are handled by JavaScript
- **Clean URLs**: No hash-based routing, uses HTML5 History API
- **Refresh support**: 404.html ensures page refreshes work correctly
- **Cross-platform hosting**: Supports GitHub Pages, Apache, and Netlify

### CSS Architecture
- **Background classes**: Different background images per page (`.backgroundbio`, `.backgroundexp`, `.backgroundpro`, `.backgroundmus`)  
- **Floating components**: Modern card-based layout with backdrop blur effects
- **Full-width content boxes**: Angled sections with reduced translucency (80% opacity)
- **Fixed elements**: Header navigation (`.headbar`) and footer (`.footerbar`)
- **Responsive design**: Mobile-first approach with responsive navigation

## Development

This is an SPA that can be opened directly in a browser for development. No build tools or package managers required.

**To view the site**: Open `index.html` in any web browser
**To deploy**: Upload all files to any static web hosting service
**Testing routing**: Use a local server (like `python -m http.server`) to test SPA routing

## Styling Notes

The site uses a dark theme with:
- **Main colors**: Dark backgrounds (rgb(40,40,40)), light text (rgb(240,240,215)), accent brown (rgb(180,120,80))
- **Typography**: 
  - Body text: Century Gothic font family
  - Headers: Walkway font family (semibold 600, bold 700, ultrabold 800)
- **Layout**: Modern floating components with backdrop blur and subtle borders
- **Full-width content boxes**: 
  - Background: rgba(15,15,15,0.8) - 80% opacity for reduced translucency
  - Image borders: Opaque grey matching header bar (rgb(45,45,45))
  - Border radius: 8px for subtle corner rounding
  - Title fonts: Match header bar styling (Walkway, bold, uppercase, 2px letter-spacing)