/**
 * Joint Update Notes API Server - Local File System Mode
 */

import { file } from "bun";
import { readdir, stat } from "node:fs/promises";
import { join, relative, dirname } from "node:path";
import { networkInterfaces } from "node:os";

// Local path configuration
// Target: /Users/minjaebaek/Desktop/joint-docs/products/update-notes/public
const LOCAL_UPDATES_PATH = "../joint-docs/products/update-notes/public";

interface UpdateNote {
    id: string;
    date: string;
    tags: string[];
    title: string;
    description?: string; // New field for custom excerpts
    image: string;
    content: string;
}

/**
 * Parse Markdown Frontmatter
 */
function parseFrontmatter(text: string): { data: any; content: string } {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = text.match(frontmatterRegex);

    if (!match) {
        return { data: {}, content: text };
    }

    const yamlBlock = match[1];
    if (!yamlBlock) {
        return { data: {}, content: text };
    }

    const content = match[2] ? match[2].trim() : "";
    const data: any = {};

    yamlBlock.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
            const key = line.slice(0, colonIndex).trim();
            let value: any = line.slice(colonIndex + 1).trim();

            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            else if (value.startsWith('[') && value.endsWith(']')) {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    // ignore parse error/keep string
                }
            }
            // Support simple comma-separated tags
            else if (key === 'tags' && typeof value === 'string' && value.includes(',')) {
                value = value.split(',').map((v: string) => v.trim()).filter((v: string) => v);
            }

            data[key] = value;
        }
    });

    return { data, content };
}

/**
 * Get all files recursively
 */
async function getFiles(dir: string): Promise<string[]> {
    const subdirs = await readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir) => {
        const res = join(dir, subdir);
        return (await stat(res)).isDirectory() ? getFiles(res) : res;
    }));
    return files.flat();
}

async function fetchLocalUpdates(): Promise<UpdateNote[]> {
    console.log('📦 Fetching update notes from Local File System (Recursive)...');
    console.log(`📍 Path: ${LOCAL_UPDATES_PATH}`);

    try {
        // Recursively find all markdown files
        // Note: LOCAL_UPDATES_PATH is relative "../...", we resolve it to absolute to be safe for recursion
        // But relative paths are fine if consistent.
        // Let's use absolute logic for scanning

        // Simple 1-level directory scan is safer if we want to support specifically "Folders by date"
        // But recursive is more flexible.

        // Using Bun's internal file system or node fs
        // Let's try to get all .md files locally

        // But wait, readdir(path, { recursive: true }) is Node 20. Bun supports it?
        // Let's stick to the getFiles helper I wrote above.

        // Resolve absolute path for LOCAL_UPDATES_PATH because recursive function needs it
        const absoluteUpdatePath = join(process.cwd(), LOCAL_UPDATES_PATH);

        let allFiles: string[] = [];
        try {
            allFiles = await getFiles(absoluteUpdatePath);
        } catch (e) {
            console.warn(`Could not read path ${absoluteUpdatePath}, trying relative`);
            // invalid path or empty
            return [];
        }

        const markdownFiles = allFiles.filter(name => name.endsWith('.md'));

        console.log(`📄 Found ${markdownFiles.length} markdown files`);

        const notes: UpdateNote[] = [];

        await Promise.all(markdownFiles.map(async (filePath) => {
            try {
                const fileContent = await Bun.file(filePath).text();
                const { data, content } = parseFrontmatter(fileContent);

                if (!data.title || !data.date) {
                    // console.warn(`⚠️ Skipping ${filePath}: Missing title or date`);
                    return;
                }

                // If file is in subdirectory, we need to adjust image paths
                // Get relative path from LOCAL_UPDATES_PATH
                const relPath = relative(absoluteUpdatePath, filePath);
                const subDir = dirname(relPath);
                // if root, subDir is "."

                let imagePath = data.image || "";

                // If image path is not empty and not absolute URL (http...), prepend subdir
                // Also check if user didn't already include subdir
                if (subDir !== "." && imagePath && !imagePath.startsWith("http") && !imagePath.startsWith("/")) {
                    // Check if imagePath already includes subDir (user might have written it manually)
                    if (!imagePath.startsWith(subDir + "/")) {
                        imagePath = join(subDir, imagePath);
                    }
                }

                // Rewrite content images [alt](image.png) -> [alt](subdir/image.png)
                let adjustedContent = content;
                if (subDir !== ".") {
                    adjustedContent = content.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, imgUrl) => {
                        if (!imgUrl.startsWith("http") && !imgUrl.startsWith("/") && !imgUrl.startsWith(subDir + "/")) {
                            return `![${alt}](${join(subDir, imgUrl)})`;
                        }
                        return match;
                    });
                }

                notes.push({
                    id: relPath, // Use relative path as ID (unique enough)
                    date: data.date,
                    tags: Array.isArray(data.tags) ? data.tags : [],
                    title: data.title,
                    description: data.description || "", // Map description
                    image: imagePath,
                    content: adjustedContent
                });

            } catch (err) {
                console.error(`❌ Error processing ${filePath}:`, err);
            }
        }));

        notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        console.log(`✅ Loaded ${notes.length} valid update notes`);
        return notes;

    } catch (error) {
        console.error('❌ Fatal Error fetching from Local Disk:', error);
        throw error;
    }
}

const server = Bun.serve({
    port: 3001,
    async fetch(req) {
        const url = new URL(req.url);
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        if (req.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        // API Endpoint
        if (url.pathname === "/api/updates") {
            try {
                const updates = await fetchLocalUpdates();
                return new Response(JSON.stringify(updates), {
                    headers: { "Content-Type": "application/json", ...corsHeaders },
                });
            } catch (error) {
                console.error('API Error:', error);
                return new Response(JSON.stringify([]), {
                    headers: { "Content-Type": "application/json", ...corsHeaders },
                });
            }
        }

        // Static File Serving
        let path = url.pathname;
        if (path === "/") path = "/index.html";

        const decodedPath = decodeURIComponent(path);

        // 1. Try serving from Project Root (HTML, JS, CSS)
        // Remove leading slash
        const relativePath = decodedPath.startsWith("/") ? decodedPath.slice(1) : decodedPath;
        let filePath = join(process.cwd(), relativePath);
        let file = Bun.file(filePath);

        if (await file.exists()) {
            return new Response(file);
        }

        // 2. Try serving from Local Updates Path (Images inside update note folders)
        // e.g. path is "/2026-02-05/thumbnail.png" -> look in LOCAL_UPDATES_PATH/2026-02-05/thumbnail.png
        const docFilePath = join(LOCAL_UPDATES_PATH, relativePath);
        file = Bun.file(docFilePath);

        if (await file.exists()) {
            return new Response(file);
        }

        return new Response("Not Found", { status: 404 });
    }
});

const localIP = (() => {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]!) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
})();

console.log(`🚀 Joint Update Notes Server (Local Mode + Folders)`);
console.log(`📍 Local:   http://localhost:${server.port}`);
console.log(`📡 Network: http://${localIP}:${server.port}`);
console.log(`📂 Source:  ${LOCAL_UPDATES_PATH}`);

