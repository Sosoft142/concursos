import {spawnSync} from 'node:child_process';
import {readFileSync, readdirSync, mkdirSync, writeFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
const log=[];
let failed=false;
function run(label, command, args) {
  const result=spawnSync(command,args,{encoding:'utf8',maxBuffer:16*1024*1024});
  const output=(result.stdout||'')+(result.stderr||'')+(result.error?.message||'');
  log.push(`## ${label}\n${output}`);
  if(result.status!==0){failed=true;console.error(`${label}: FALHOU\n${output.slice(-5000)}`);}
  else console.log(`${label}: aprovado`);
}
run('Preparação estática',process.execPath,['scripts/build.mjs']);
const tests=readdirSync('tests').filter(file=>file.endsWith('.test.mjs')).map(file=>'tests/'+file);
run('Testes',process.execPath,['--test',...tests]);
const sources=[];
function walk(dir){for(const item of readdirSync(dir,{withFileTypes:true})){const file=dir+'/'+item.name;if(item.isDirectory())walk(file);else if(/\.(js|mjs)$/.test(file))sources.push(file);}}
for(const dir of ['dist/src','scripts','tests'])walk(dir);
sources.push('sw.js','dist/sw.js');
for(const file of sources){
  run('Sintaxe '+file,process.execPath,['--check',file]);
  for(const [,ref] of readFileSync(file,'utf8').matchAll(/(?:from\s+|import\s*)['"](\.[^'"]+)['"]/g)){
    try{readFileSync(resolve(dirname(file),ref));}catch{failed=true;log.push(`Import ausente: ${file} → ${ref}`);}
  }
}
run('Diferenças','git',['diff','--check','HEAD','--']);
mkdirSync('.work',{recursive:true});
writeFileSync('.work/verification.log',log.join('\n\n'));
console.log(failed?'Verificação reprovada.':'Verificação completa aprovada.');
process.exitCode=failed?1:0;
