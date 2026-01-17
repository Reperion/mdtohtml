# MDtoHTML Project Manual

## Overview
**MDtoHTML** is a robust tool designed to convert Markdown files into beautifully styled HTML documents. It mimics the visual aesthetic of VS Code's markdown preview, offering both a light and a dark theme (defaulting to dark). It supports advanced features like syntax highlighting, Mermaid diagrams, and automatic Table of Contents linking.

## Features
-   **VS Code Styling**: The generated HTML looks just like the VS Code markdown preview.
-   **Dark Mode Default**: The output is styled with a dark theme (`.vscode-dark`) out of the box.
-   **Mermaid Support**: Automatically renders `flowchart`, `sequenceDiagram`, `stateDiagram`, etc., using a locally embedded script.
-   **Syntax Highlighting**: Uses `highlight.js` for code blocks.
-   **Auto-TOC Links**: Automatically generates IDs for headers to make Table of Contents links functional.
-   **Batch Conversion**: A local web interface allows selecting and converting multiple files at once.
-   **Date-Stamped Output**: Converted files are organized into date-stamped directories within `html_converted/`.
-   **Conversation History**: The web interface maintains a history of the last 10 conversion batches, allowing users to browse and access previously generated files directly from the UI.

## Architecture

### File Structure
-   **`md2html.js`**: The core logic. Can be run as a CLI tool or imported as a module.
    -   Uses `marked` for parsing.
    -   Injects CSS and JS into the final HTML.
-   **`server.js`**: An Express server that provides a web interface.
    -   Handles file uploads via `multer`.
    -   Calls `md2html.convertContent`.
    -   Saves output to `html_converted/<DD_Month_YY>/`.
-   **`public/index.html`**: The frontend UI.
    -   Simple, dark-themed interface for file selection.
    -   Fetches and displays conversion history via `/api/history`.
-   **`package.json`**: Dependencies and scripts (`npm run dev`).

### Key Dependencies
-   `marked`: Markdown parser.
-   `marked-highlight`: For syntax highlighting.
-   `marked-gfm-heading-id`: For generating header IDs.
-   `highlight.js`: The highlighter engine.
-   `express`: Web server framework.
-   `multer`: Middleware for handling `multipart/form-data`.

## Usage

### Web Interface (Recommended)
1.  Start the server:
    ```bash
    npm run dev
    ```
2.  Open `http://localhost:3000`.
3.  Select one or more `.md` files.
4.  Click **Convert Files**.
5.  Find your HTML files in `html_converted/<Date_Directory>/`.
6.  **View History**: Scroll down to "Recent Conversions" to browse and open previously converted files.

### Command Line
To convert a single file:
```bash
node md2html.js <source_file.md> [output_file.html]
```
If output file is omitted, it defaults to the same name/location as source.

## Troubleshooting

### Mermaid Diagrams Not Rendering
Ensure your code block uses the `mermaid` language identifier:
\```mermaid
graph TD;
    A-->B;
\```
The converter wraps this in a `<div class="mermaid">` which the embedded Mermaid script looks for.

### TOC Links Not Working
If clicking a link in the Table of Contents doesn't work, ensure headers have IDs. The current build uses `marked-gfm-heading-id` to generate these automatically. regenerate the file if necessary.
