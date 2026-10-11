import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToPipeableStream,renderToString} from 'react-dom/server';
import {PassThrough} from 'node:stream';
import {text} from 'node:stream/consumers';

test('SSR preserva UTF-8 quando acentos cruzam o limite do buffer',async()=>{
  // O preenchimento coloca o acento junto ao limite de 2048 bytes que
  // introduzia NUL em React 18.3.1. Referência: react/react#31134.
  const app=React.createElement('div',null,
    ...[403,512,512,512].map((n,i)=>React.createElement('span',{key:i},'x'.repeat(n))),
    React.createElement('h2',{id:'fontes-e-verificação'},'Fontes e verificação'));
  const html=await new Promise((resolve,reject)=>{
    const stream=new PassThrough();
    const {pipe}=renderToPipeableStream(app,{
      onError:reject,
      onAllReady(){pipe(stream);text(stream).then(resolve,reject);},
    });
  });
  assert.equal(html.includes('\u0000'),false);
  assert.equal(html,renderToString(app));
  assert.ok(html.includes('id="fontes-e-verificação"'));
});
