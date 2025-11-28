// Rule-based planner + local semantic (toy) + keyword tool
// Exports runAgent(query, opts)

// Local dataset (5-12 snippets)
const DATA = [
  { id: 'd1', text: 'CentrAlign helps align UI elements and centers content quickly.' },
  { id: 'd2', text: 'Install the extension from the Chrome Web Store and use trial code TRIAL-100 for access.' },
  { id: 'd3', text: 'This extension performs local semantic and keyword search using toy embeddings.' },
  { id: 'd4', text: 'Use the planner to pick semantic_search, keyword_search or hybrid based on simple rules.' },
  { id: 'd5', text: 'Fallback to Pinecone stub when confidence drops below threshold; this is optional.' },
  { id: 'd6', text: 'Manifest V3 requires service workers and restricts network policies.' }
];

// ---- Simple tokenization and bag-of-words embedding ----
function tokenize(s){
  return s.toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(Boolean);
}

function buildVocab(docs){
  const map = new Map();
  let idx = 0;
  docs.forEach(d=>{
    tokenize(d.text).forEach(w=>{ if(!map.has(w)) map.set(w, idx++); });
  });
  return map;
}

const VOCAB = buildVocab(DATA);
const VOCAB_SIZE = VOCAB.size;

function embedText(s){
  const vec = new Array(VOCAB_SIZE).fill(0);
  tokenize(s).forEach(w=>{
    const i = VOCAB.get(w);
    if(i!==undefined) vec[i] += 1;
  });
  return vec;
}

function dot(a,b){
  let s=0; for(let i=0;i<a.length;i++) s+=a[i]*b[i]; return s;
}
function norm(a){ let s=0; for(let i=0;i<a.length;i++) s+=a[i]*a[i]; return Math.sqrt(s); }
function cosine(a,b){ const na = norm(a), nb = norm(b); if(na===0 || nb===0) return 0; return dot(a,b)/(na*nb); }

// Precompute document embeddings
const DOC_EMB = DATA.map(d=>({ ...d, emb: embedText(d.text) }));

// Semantic tool: returns top-k (3) with cosine scores normalized (already 0..1)
async function semantic_search(query, k=3){
  const qv = embedText(query);
  const scores = DOC_EMB.map(d=>({ id:d.id, text:d.text, score: cosine(qv, d.emb), source: 'local' }));
  scores.sort((a,b)=>b.score-a.score);
  return scores.slice(0,k);
}

// Keyword tool: count of query words matched
async function keyword_search(query, k=3){
  const qtokens = tokenize(query);
  const counts = DOC_EMB.map(d=>{
    const dtoks = tokenize(d.text);
    let cnt=0; qtokens.forEach(qt=>{ if(dtoks.includes(qt)) cnt++; });
    return { id:d.id, text:d.text, raw: cnt, source: 'local' };
  });
  const max = Math.max(...counts.map(c=>c.raw), 1);
  const scored = counts.map(c=>({ id:c.id, text:c.text, score: c.raw / max }));
  scored.sort((a,b)=>b.score-a.score);
  return scored.slice(0,k);
}

// Planner (rule-based): returns decision and reasoning string
function planner_decide(query, semTop, keyTop){
  const words = tokenize(query).length;
  const hasExact = keyTop[0] && keyTop[0].score>0;
  // simple rules:
  // long queries (>5 words) -> try semantic
  // exact keyword match -> keyword
  // if both tool scores are close -> hybrid
  const reasoning = [];
  if(words > 5){ reasoning.push('Query length > 5 -> prefer semantic_search'); }
  if(hasExact){ reasoning.push('Exact keyword hits found -> prefer keyword_search'); }

  const semScore = semTop[0] ? semTop[0].score : 0;
  const keyScore = keyTop[0] ? keyTop[0].score : 0;
  reasoning.push(`Top semantic score=${semScore.toFixed(3)}, top keyword score=${keyScore.toFixed(3)}`);

  // decision logic
  let decision = 'semantic_search';
  if(hasExact && keyScore >= semScore + 0.1){ decision = 'keyword_search'; }
  else if(Math.abs(semScore - keyScore) <= 0.1){ decision = 'hybrid'; }
  else if(words <=5 && keyScore > semScore){ decision = 'keyword_search'; }

  reasoning.push(`Decision -> ${decision}`);
  return { decision, reasoning: reasoning.join('; ') };
}

// Fallback pinecone stub — returns small fake result
async function pinecone_stub(query){
  // simulate network latency
  await new Promise(r=>setTimeout(r, 60));
  return [{ text: 'Pinecone stub: no real API called. Closest match placeholder.', score: 0.6, source: 'pinecone' }];
}

export async function runAgent(query, opts={}){
  const start = Date.now();
  const semTop = await semantic_search(query);
  const keyTop = await keyword_search(query);

  const plan = planner_decide(query, semTop, keyTop);
  let decision = plan.decision;

  // pick match depending on decision
  let best = { text:'', score:0, source:'local' };
  if(decision === 'semantic_search') best = { text: semTop[0]?.text || '', score: semTop[0]?.score || 0, source: semTop[0]?.source || 'local' };
  else if(decision === 'keyword_search') best = { text: keyTop[0]?.text || '', score: keyTop[0]?.score || 0, source: keyTop[0]?.source || 'local' };
  else if(decision === 'hybrid'){
    // choose higher of top semantic vs keyword
    const s = semTop[0]?.score || 0; const k = keyTop[0]?.score || 0;
    if(s>=k) best = { text: semTop[0].text, score: s, source: semTop[0].source };
    else best = { text: keyTop[0].text, score: k, source: keyTop[0].source };
  }

  // Fallback only when confidence < 0.75
  let used_fallback_tool = false;
  if(best.score < 0.75){
    used_fallback_tool = true;
    const pine = await pinecone_stub(query);
    // choose pinecone if it has higher score
    if(pine[0].score > best.score){
      best = { text: pine[0].text, score: pine[0].score, source: 'pinecone' };
    }
  }

  const trace = {
    reasoning: plan.reasoning,
    semantic_top_k_scores: semTop.map(s=>({ text: s.text, score: Number(s.score.toFixed(4)) })),
    keyword_top_k_scores: keyTop.map(k=>({ text: k.text, score: Number(k.score.toFixed(4)) })),
    used_fallback_tool
  };

  const latency_ms = Date.now() - start;

  return {
    planner_decision: decision,
    used_fallback_tool,
    best_match: {
      text: best.text,
      score: Number((best.score||0).toFixed(4)),
      source: best.source === 'pinecone' ? 'pinecone' : 'local'
    },
    trace: Object.assign(trace, { latency_ms })
  };
}
