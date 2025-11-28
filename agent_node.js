// Run with: node agent_node.js "your query here"
import { runAgent } from './agent.js';

const q = process.argv.slice(2).join(' ') || 'install extension with trial code TRIAL-100';
runAgent(q, {}).then(r=>{
  console.log(JSON.stringify(r, null, 2));
}).catch(e=>console.error(e));
