# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static personal website for Ian Hill built with vanilla HTML and CSS. The site consists of 4 main pages showcasing Ian's biography, experience, interests/projects, and music background.

## Architecture

- **Static HTML site**: No build process or package management required
- **Single stylesheet**: All styling is contained in `style.css`
- **Navigation**: Fixed header navigation bar with active state indicators
- **Layout**: Uses CSS transforms and pseudo-elements for angled content sections
- **Images**: Background images and inline photos stored directly in root directory

### File Structure
- `index.html` - Biography/main landing page
- `experience.html` - Professional experience page  
- `projects.html` - Interests and projects page
- `music.html` - Music background page
- `style.css` - Complete stylesheet with responsive design elements
- Image assets (JPG/PNG) - Photos and background images

### CSS Architecture
- **Background classes**: Different background images per page (`.backgroundbio`, `.backgroundexp`, `.backgroundpro`, `.backgroundmus`)  
- **Content sections**: Alternating styled content bars (`.contentbarone`, `.contentbartwo`) with CSS transform skews
- **Fixed elements**: Header navigation (`.headbar`) and footer (`.footerbar`)
- **Image positioning**: Left/right aligned images within text blocks (`.imgleft`, `.imgright`)

## Development

This is a simple static website that can be opened directly in a browser. No build tools, package managers, or local server required.

**To view the site**: Open `index.html` in any web browser
**To deploy**: Upload all files to any static web hosting service

## Styling Notes

The site uses a dark theme with:
- Main colors: Dark backgrounds (rgb(40,40,40)), light text (rgb(240,240,215)), accent brown (rgb(180,120,80))
- Typography: Century Gothic font family
- Layout: Skewed content sections for visual interest using CSS transforms
- Fixed header/footer navigation