import { runAgent } from './agent.js';

const session = {
  queries: []
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const start = Date.now();
  if(!msg || !msg.query) return;
  const query = msg.query;


  session.queries.unshift({q:query, t:Date.now()});
  if(session.queries.length>10) session.queries.pop();

  runAgent(query, { mode: msg.mode || 'auto', session }).then(result => {
    result.trace.latency_ms = Date.now() - start;
    sendResponse(result);
  }).catch(err => {
    sendResponse({ error: err.message });
  });

  return true; 
});
