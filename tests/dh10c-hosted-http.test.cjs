'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {inspect,required}=require('../scripts/check-dh10c-staging.cjs');
const expected=required.join('\n');
function mock(body=expected,ok=true,mime='text/html'){
 return async url=>{
  assert.match(url,/^https:\/\/davehub\.pages\.dev\/review\/\?verify=dh10c$/);
  return{ok,status:ok?200:404,headers:{get:()=>mime},text:async()=>body};
 };
}
test('live review smoke requires all approved page markers and real HTML',async()=>{
 assert.ok((await inspect(mock()))>100);
 await assert.rejects(()=>inspect(mock('old site')),/missing required marker/);
 await assert.rejects(()=>inspect(mock(expected,false)),/HTTP 404/);
 await assert.rejects(()=>inspect(mock(expected,true,'application/json')),/not HTML/);
 await assert.rejects(()=>inspect(mock(expected+'\nUnpublished manuscript')),/draft text/);
});
