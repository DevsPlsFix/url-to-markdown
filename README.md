# 🕵️‍♂️ URL-to-Markdown: Stealth Markdown Scraper

A resilient, general-purpose utility for converting web pages into clean, LLM-friendly Markdown. Built with a focus on bypassing bot detection and stripping architectural noise (like CSS/JS).

### 🚀 Features

- **Stealth Mode:** Uses `puppeteer-extra-plugin-stealth` to mimic human browser behavior.
- **Noise Reduction:** Recursively prunes non-content elements (scripts, styles, headers, footers).
- **GFM Support:** Converts HTML tables and lists into GitHub Flavored Markdown.
- **JSDOM Integration:** Uses a `VirtualConsole` to suppress parsing noise from complex web components.
- **CLI & Module Support:** Can be imported as a TypeScript library or run directly from the terminal.

### 🛠️ Installation

```bash
npm install
npm run build
```

### 📖 Usage

#### Command Line Interface

Fetch a URL and output Markdown directly to the console:

```bash
ts-node src/index.ts https://example.com
```

Extract only the links from a page:

```bash
ts-node src/index.ts https://example.com --links
```

#### As a TypeScript Library

```typescript
import { fetchAsMarkdown } from './path-to-project';

const markdown = await fetchAsMarkdown('https://reddit.com/r/aigamedev');
console.log(markdown);
```

### 🏗️ Project Structure

- `functions/fetchHtml.ts`: Handles the Puppeteer/Stealth browser lifecycle.
- `functions/parseHtml.ts`: Manages JSDOM initialization and error suppression.
- `functions/cleanup.ts`: Contains the logic for stripping CSS and metadata.
- `functions/markdown.ts`: Handles the conversion from cleaned HTML to Markdown.
- `functions/extractLinks.ts`: Utility for filtering content down to actionable links.

---

### 🧠 A Final Note on Maintenance

Keep an eye on the **Puppeteer version**. Every few months, sites update their "fingerprinting" detection. If you notice the scraper starting to get blocked, the first step is usually just updating `puppeteer-extra-plugin-stealth`.
