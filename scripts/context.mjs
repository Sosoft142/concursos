import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const [command='status', file, first='1', last='100'] = process.argv.slice(2);
if (command==='status') {
  console.log(readFileSync(new URL('../docs/CURRENT.md',import.meta.url),'utf8'));
  const result=spawnSync('git',['status','--short'],{encoding:'utf8'});process.stdout.write(result.stdout||'');
} else if(command==='read' && file) {
  const lines=readFileSync(file,'utf8').split('\n');
  console.log(lines.slice(Number(first)-1,Number(last)).map((line,i)=>`${Number(first)+i}: ${line}`).join('\n'));
} else {console.error('Use context status ou context read CAMINHO INICIO FIM');process.exitCode=1;}
