/* Cloudflare Pages Function: serve ONLY the already-public, playable Stephen
 * Martin release under DaveHub's own /games/stephen-martin/ URL.
 *
 * This is not an iframe, a browser redirect, or access to the private GitHub
 * repo. The game remains dependent on its existing public Cloudflare Pages
 * release until a separate owner-approved distribution package exists.
 */
const ROUTE='/games/stephen-martin';
const ORIGIN='https://stephen-martin-project.pages.dev';
const ALLOWED_METHODS=new Set(['GET','HEAD']);
const PASSTHROUGH_REQUEST_HEADERS=['accept','range','if-range','if-none-match','if-modified-since'];
const PASSTHROUGH_RESPONSE_HEADERS=['content-type','content-length','content-range','accept-ranges','etag','last-modified','cache-control'];
export async function onRequest(context){
 const {request}=context;
 if(!ALLOWED_METHODS.has(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
 const incoming=new URL(request.url);
 const suffix=incoming.pathname.slice(ROUTE.length);
 if(!incoming.pathname.startsWith(ROUTE+'/')||suffix.length>1024||suffix.includes('\\')||/%(?:2f|5c|00)/i.test(suffix)||
    suffix.split('/').some(segment=>segment==='..'||segment==='.'))
   return new Response('Invalid game path',{status:400});
 // The fixed upstream host cannot be influenced by user-supplied headers,
 // query parameters, open redirects or relative traversal.
 const target=new URL(ORIGIN+suffix+incoming.search);
 if(target.origin!==ORIGIN||!target.pathname.startsWith('/'))
   return new Response('Invalid upstream',{status:400});
 const headers=new Headers();
 for(const key of PASSTHROUGH_REQUEST_HEADERS){
  const value=request.headers.get(key);
  if(value)headers.set(key,value);
 }
 let upstream;
 try{
  upstream=await fetch(target.toString(),{method:request.method,headers,redirect:'follow'});
 }catch{
  return new Response('Game origin temporarily unavailable',{status:502});
 }
 if(upstream.url&&new URL(upstream.url).origin!==ORIGIN)
   return new Response('Game origin redirect not permitted',{status:502});
 const safeHeaders=new Headers();
 for(const key of PASSTHROUGH_RESPONSE_HEADERS){
  const value=upstream.headers.get(key);
  if(value)safeHeaders.set(key,value);
 }
 safeHeaders.set('X-Content-Type-Options','nosniff');
 // HTML and versionless JS should revalidate; large images and MP3 can be
 // short-lived cached. Do not cache error pages or replay stale game shells.
 if(upstream.ok&&/\.(?:webp|png|svg|mp3|ogg|woff2?)$/i.test(target.pathname))
  safeHeaders.set('Cache-Control','public, max-age=3600');
 else safeHeaders.set('Cache-Control','no-cache');
 return new Response(request.method==='HEAD'?null:upstream.body,{status:upstream.status,headers:safeHeaders});
}
