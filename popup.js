// Sends: chrome.runtime.sendMessage({ query, mode: "auto" }, ...)
const askBtn = document.getElementById('ask');
const queryEl = document.getElementById('query');
const resultEl = document.getElementById('result');
const traceEl = document.getElementById('trace');
const tracePanel = document.getElementById('tracePanel');
const showTrace = document.getElementById('showTrace');

askBtn.addEventListener('click', () => {
  const query = queryEl.value.trim();
  if(!query){ resultEl.textContent = 'Type a query.'; return; }

  resultEl.textContent = 'Thinking...';
  tracePanel.style.display = 'none';

  chrome.runtime.sendMessage({ query, mode: 'auto' }, (response) => {
    if(chrome.runtime.lastError){
      resultEl.textContent = 'Error: ' + chrome.runtime.lastError.message;
      return;
    }
    try{
      // Display best match and score rounded to 2 decimals, source
      const bm = response.best_match || {text:'',score:0,source:'local'};
      resultEl.textContent = `${bm.text}\n\nScore: ${bm.score.toFixed(2)}\nSource: ${bm.source}`;
      if(showTrace.checked && response.trace){
        tracePanel.style.display = 'block';
        traceEl.textContent = JSON.stringify(response.trace, null, 2);
      }
    }catch(e){ resultEl.textContent = 'Bad response'; }
  });
});
