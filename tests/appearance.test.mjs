import test, {beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {app} from '../dist/src/state.js';
import {ACCENTS, ACCENT_TEXT, DEFAULT_ACCENT} from '../dist/src/appearance.js';
import '../dist/src/settings.js';
import '../dist/src/navigation.js';
const luminance=hex=>hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>{const l=[luminance(a),luminance(b)].sort((a,b)=>b-a);return (l[0]+.05)/(l[1]+.05);};
beforeEach(()=>{Object.assign(app,{S:{ui:{}},ACENTOS:ACCENTS,ACENTO_TEXTO:ACCENT_TEXT,modalFechar:()=>{}});});
test('todas as cores de destaque mantêm contraste para botão e texto em superfície clara',()=>{
 for(const a of ACCENTS){assert.ok(contrast(a.cor,ACCENT_TEXT)>=4.5,a.id+' botão');assert.ok(contrast(a.ink,a.soft)>=4.5,a.id+' texto');assert.ok(luminance(a.soft)>.8,a.id+' superfície clara');}
});
test('cores de texto e de estado mantêm contraste na superfície branca',()=>{
 const css=readFileSync(new URL('../dist/concursos.css',import.meta.url),'utf8');
 const variables=Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6});/g)].map(m=>[m[1],m[2]]));
 for(const color of ['text','muted','faint','blue','violet','teal','green','amber','orange','magenta','rose']) assert.ok(contrast(variables[color],variables.surface)>=4.5,color);
});
test('padrão azul e cores salvas continuam válidos após a mudança de aparência',()=>{
 assert.equal(app.CFG().acento,DEFAULT_ACCENT);
 app.S.ui.cfg={acento:'agua',oculto:{fontes:1}};
 assert.equal(app.CFG().acento,'agua');assert.equal(app.acentoDe('agua').id,'agua');assert.equal(app.CFG().oculto.fontes,1);
 assert.equal(app.acentoDe('cor-antiga-desconhecida').id,DEFAULT_ACCENT);
});
test('fechar configuração pela cruz desfaz a prévia da cor',()=>{
 const properties={};globalThis.document={documentElement:{style:{setProperty:(k,v)=>{properties[k]=v;}}}};
 app.S.ui.cfg={acento:'agua'};app.CG={acento:'rosa'};app.cgPrever();assert.equal(properties['--primary'],app.acentoDe('rosa').cor);
 app.cgFechar();assert.equal(app.CG,null);assert.equal(properties['--primary'],app.acentoDe('agua').cor);
});
test('atalho para fontes abre a seção recolhida antes de rolar',async()=>{
 const disclosure={open:false};let scrolled=false;
 app.showView=()=>{};app.toggleDrawer=()=>{};
 globalThis.document={getElementById:()=>({closest:()=>disclosure,scrollIntoView:()=>{scrolled=disclosure.open;}})};
 app.goAnchor('concursos','novos-concursos');
 await new Promise(resolve=>setTimeout(resolve,140));assert.equal(disclosure.open,true);assert.equal(scrolled,true);
});
