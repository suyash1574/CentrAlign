# CentrAlign AI Agent – Chrome Extension (Assignment Submission)

This project implements a fully local **AI Reasoning Agent** inside a Chrome Extension (Manifest V3).  
The extension uses a rule-based planner, local semantic search, keyword search, hybrid routing, and a Pinecone fallback stub, all running offline.

The popup UI is modern, minimal, and responsive.

---

# 📌 Project Structure

centralign-agent/
│
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── agent.js
├── agent_node.js
├── icon16.png
├── icon48.png
└── icon128.png

yaml
Copy code

---

# 🚀 Features Implemented

### ✔ Manifest V3 Compliant  
### ✔ Rule-Based AI Planner (no LLM)  
### ✔ Local Semantic Search (bag-of-words + cosine similarity)  
### ✔ Local Keyword Search (normalized match scores)  
### ✔ Hybrid Tool Routing  
### ✔ Pinecone Fallback Stub (<0.75 confidence)  
### ✔ Full JSON Output Structure  
### ✔ Modern Clean UI  
### ✔ Optional Node.js Local Runner  

Everything runs completely locally.

---

# 🧠 AI Agent Architecture

User Query → Planner → Semantic Search + Keyword Search → Decision → Fallback (optional) → JSON Response

arduino
Copy code

The agent returns:

```json
{
  "planner_decision": "",
  "used_fallback_tool": false,
  "best_match": { "text": "", "score": 0.0, "source": "" },
  "trace": {
    "reasoning": "",
    "semantic_top_k_scores": [],
    "keyword_top_k_scores": [],
    "latency_ms": 0
  }
}
🖥 Installation & Running
1. Extract the ZIP
2. Open Chrome → chrome://extensions/
3. Enable Developer Mode
4. Click Load Unpacked
5. Select the extracted folder
6. Click extension icon → enter query
🧪 Example Queries
pgsql
Copy code
What is TRIAL-100 code?
How do I install CentrAlign?
Explain the planner.
Explain semantic search.