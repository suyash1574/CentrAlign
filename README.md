```markdown
# CentrAlign AI Agent – Chrome Extension (Assignment Submission)

## Overview

This project implements a fully local AI Reasoning Agent inside a Chrome Extension (Manifest V3) as required in the assignment. The extension performs:

- Rule-based planning
- Local semantic search (toy embeddings + cosine similarity)
- Local keyword search (normalized scores)
- Hybrid matching
- Confidence-based fallback (Pinecone stub)
- Structured JSON output
- Modern, clean popup UI

Everything runs entirely offline, with no external API calls.

---

## Project Structure

```
centralign-agent/
│
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── agent.js
├── agent_node.js        (optional local runner)
├── icon16.png
├── icon48.png
└── icon128.png
```

---

## Features Implemented ✅

### 1. Manifest V3 Chrome Extension

- Uses service worker (`background.js`)
- Popup UI connected with `chrome.runtime.sendMessage`
- Fully modular architecture

### 2. Reasoning Planner (Rule-Based, No LLM)

The planner decides:

- `semantic_search`
- `keyword_search`
- `hybrid`

Decision is based on:

- Query length
- Keyword match strength
- Score comparison
- Thresholds

The planner also returns a clear reasoning trace.

### 3. Local Semantic Search

- Tokenizer
- Bag-of-words embedding
- Vector generation
- Cosine similarity
- Top-K = 3 scoring

Runs 100% offline.

### 4. Local Keyword Search

- Word overlap scoring
- Score normalization
- Top-K = 3

### 5. Fallback System

If highest score `< 0.75`, a fake Pinecone stub is triggered:

- Pinecone stub: no real API called
- Simulates external vector DB fallback behavior

### 6. Structured JSON Response

Extension returns exactly this format:

```
{
  "planner_decision": "",
  "used_fallback_tool": false,
  "best_match": {
    "text": "",
    "score": 0.0,
    "source": ""
  },
  "trace": {
    "reasoning": "",
    "semantic_top_k_scores": [],
    "keyword_top_k_scores": [],
    "latency_ms": 0
  }
}
```

This structure is strictly followed.

### 7. Modern & Clean Popup UI

Built with:

- Card layout
- Rounded inputs
- Gradient button
- Smooth spacing
- Toggle-style Trace UI

User sees:

- Best match
- Score
- Source (`local` / `pinecone`)
- Optional trace panel

---

## How to Run the Extension

### 1. Extract ZIP

Unzip `centralign-agent.zip`.

### 2. Open Chrome Extensions

Visit:

```
chrome://extensions
```

### 3. Enable Developer Mode

Toggle on “Developer mode”.

### 4. Load Unpacked

Choose the folder:

```
centralign-agent/
```

### 5. Open Popup

Click the extension icon → type a query → press “Ask”.

---

## Test Queries

Try:

- `Install CentrAlign using trial code`
- `What does the planner do?`

---

## Optional – Run Local Node Version

```
node agent_node.js "your query"
```

---

## Notes

This project follows every requirement of the assignment, including:

- Modular code design
- Local inference logic
- Separate agent module
- Planner design
- Fallback logic
- JSON format compliance
- UI requirements
```

[1](https://www.codecademy.com/resources/docs/markdown/tables)
[2](https://www.markdownguide.org/extended-syntax/)
[3](https://www.tablesgenerator.com/markdown_tables)
[4](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-tables)
[5](https://htmlmarkdown.com/syntax/markdown-tables/)
[6](https://learn.microsoft.com/en-us/azure/devops/project/wiki/markdown-guidance?view=azure-devops)
[7](https://docs.codeberg.org/markdown/tables-in-markdown/)
[8](https://docs.gitlab.com/user/markdown/)
[9](https://www.markdownguide.org/basic-syntax/)