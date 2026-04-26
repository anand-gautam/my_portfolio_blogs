#!/usr/bin/env node

/**
 * Build Script: Converts markdown files to posts.json
 * Run with: node build.js
 */

const fs = require('fs');
const path = require('path');

// Parse markdown frontmatter (YAML)
function parseFrontmatter(content) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) {
        return { metadata: {}, content: content };
    }

    const frontmatter = match[1];
    const markdown = match[2];
    const metadata = {};

    frontmatter.split(/\r?\n/).forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim().replace(/^['"]|['"]$/g, '');
            metadata[key] = value;
        }
    });

    return { metadata, content: markdown };
}

// Convert markdown to HTML (basic conversion)
function markdownToHtml(markdown) {
    let html = markdown;

    // Headers (must be before other replacements)
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

    // Bold and Italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Code blocks (pre)
    html = html.replace(/```(.*?)\n([\s\S]*?)```/gm, (match, lang, code) => {
        const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<pre><code>${escapedCode}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

    // Images
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" />');

    // Blockquotes
    html = html.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');

    // Lists (unordered)
    html = html.replace(/^\* (.*?)$/gm, '<li>$1</li>');

    // Wrap consecutive list items in <ul>
    html = html.replace(/(<li>.*?<\/li>)/s, (match) => {
        const items = match.match(/<li>.*?<\/li>/g);
        if (items && items.length > 1) {
            return '<ul>' + match + '</ul>';
        }
        return match;
    });

    // Wrap paragraphs
    const lines = html.split('\n');
    let result = [];
    let inBlock = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (line === '') {
            if (inBlock && result.length > 0) {
                result[result.length - 1] += '</p>';
                inBlock = false;
            }
            continue;
        }

        // Check if line is a block element
        const isBlock = /^<(h[1-6]|pre|ul|li|blockquote|img)/.test(line);

        if (isBlock) {
            if (inBlock && result.length > 0) {
                result[result.length - 1] += '</p>';
                inBlock = false;
            }
            result.push(line);
        } else {
            if (!inBlock) {
                result.push('<p>' + line);
                inBlock = true;
            } else {
                result[result.length - 1] += '\n' + line;
            }
        }
    }

    if (inBlock && result.length > 0) {
        result[result.length - 1] += '</p>';
    }

    return result.join('\n').trim();
}

// Extract excerpt (first 150 characters)
function extractExcerpt(content, length = 150) {
    // Remove markdown formatting
    let text = content
        .replace(/[#*_`\[\]\(\)!]/g, '')
        .replace(/\n+/g, ' ')
        .trim();
    
    if (text.length > length) {
        return text.substring(0, length).trim() + '...';
    }
    return text;
}

// Generate slug from filename
function generateSlug(filename) {
    return filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

// Read and parse markdown files
function parseMarkdownFiles(directory) {
    const files = fs.readdirSync(directory)
        .filter(file => file.endsWith('.md'))
        .sort((a, b) => b.localeCompare(a)); // Sort by filename descending (newest first)

    return files.map(filename => {
        const filepath = path.join(directory, filename);
        const content = fs.readFileSync(filepath, 'utf-8');
        const { metadata, content: markdown } = parseFrontmatter(content);

        const html = markdownToHtml(markdown);
        const excerpt = extractExcerpt(markdown);

        return {
            slug: generateSlug(filename),
            title: metadata.title || 'Untitled',
            date: metadata.date || new Date().toISOString().split('T')[0],
            author: metadata.author || 'Anonymous',
            excerpt: excerpt,
            content: html,
            filename: filename
        };
    });
}

// Main build function
function build() {
    console.log('Building posts.json...');

    const postsDir = path.join(__dirname, '_posts');
    const quickiesDir = path.join(__dirname, '_quickies');

    let posts = [];
    let quickies = [];

    // Parse posts
    if (fs.existsSync(postsDir)) {
        posts = parseMarkdownFiles(postsDir);
        console.log(`✓ Found ${posts.length} posts`);
    } else {
        console.warn('⚠ _posts directory not found');
    }

    // Parse quickies
    if (fs.existsSync(quickiesDir)) {
        quickies = parseMarkdownFiles(quickiesDir);
        console.log(`✓ Found ${quickies.length} quickies`);
    } else {
        console.warn('⚠ _quickies directory not found');
    }

    // Create output structure
    const output = {
        posts: posts,
        quickies: quickies,
        buildDate: new Date().toISOString()
    };

    // Write to data/posts.json
    const outputDir = path.join(__dirname, 'data');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'posts.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`✓ Build complete: ${outputPath}`);
}

// Run build
build();
