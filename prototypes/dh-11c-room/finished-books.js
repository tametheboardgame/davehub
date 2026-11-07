(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.DH11FinishedBooks=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 // These three titles are verifiably published. Never use draft text
 // or imply that an unpublished manuscript can be purchased.
 const BOOKS=Object.freeze([
  Object.freeze({
   id:'stormrider',featuredIndex:0,spine:'Stormrider',
   title:'The Legend of the Stormrider',year:2023,
   author:'David Fairbairn',publisher:'Cricetus Cricetus Publishing',
   isbn:'9781739314552',format:'Published book',
   genre:'Fantasy adventure',
   teaser:'An adventure of talking birds and kite-flying kobolds.',
   description:'An exciting adventure in a world of talking birds and kite-flying kobolds, where a legend waits to be discovered.',
   cover:'https://static.wixstatic.com/media/7ac8d7_be68d9ed81b24361be939a8c8d67303c~mv2.jpg',
   links:Object.freeze([
    Object.freeze({label:'Find on Amazon',url:'https://amzn.eu/d/0gnsmtZG',type:'buy'}),
    Object.freeze({label:'Visit the publisher',url:'https://www.cricetuscricetus.co.uk/',type:'publisher'})
   ])
  }),
  Object.freeze({
   id:'duck-bread-baker',featuredIndex:1,spine:'Duck Bread',
   title:'The Duck Bread Baker',year:2023,
   author:'David Fairbairn',publisher:'Cricetus Cricetus Publishing',
   isbn:'9781739314514',format:'Published book',
   genre:'Illustrated children’s story',
   teaser:'Duck dreams of baking bread. His choices have unexpected consequences.',
   description:'Join Duck on a bread-baking adventure about ambition, friendship and learning why healthy eating matters. A playful story with an important lesson.',
   cover:'https://static.wixstatic.com/media/7ac8d7_8990f0ed4bff4045986faf577f305794~mv2.jpg',
   links:Object.freeze([
    Object.freeze({label:'Find on Amazon',url:'https://www.amazon.co.uk/dp/1739314514',type:'buy'}),
    Object.freeze({label:'Visit the publisher',url:'https://www.cricetuscricetus.co.uk/',type:'publisher'})
   ])
  }),
  Object.freeze({
   id:'eleanor-missing-stones',featuredIndex:2,spine:'Eleanor',
   title:'Eleanor and the Mystery of the Missing Stones',year:2026,
   author:'David Fairbairn',publisher:'Cricetus Cricetus Publishing',
   isbn:'9781739314576',format:'Paperback',
   genre:'Children’s mystery',
   teaser:'A mystery involving Eleanor and some very important missing stones.',
   description:'A children’s mystery about Eleanor and a puzzling disappearance. Follow the mystery of the missing stones.',
   // No verified, directly linkable full-size original cover found yet.
   // Display an elegant title-jacket fallback, never invent cover artwork.
   cover:null,
   links:Object.freeze([
    Object.freeze({label:'Find on Amazon',url:'https://www.amazon.co.uk/dp/1739314573',type:'buy'}),
    Object.freeze({label:'Retailer listing',url:'https://www.brownsbfs.co.uk/Product/Fairbairn-David/Eleanor-and-the-Mystery-of-the-Missing-Stones/9781739314576',type:'retailer'})
   ])
  })
 ]);
 const byIndex=index=>BOOKS.find(book=>book.featuredIndex===index)||null;
 const byId=id=>BOOKS.find(book=>book.id===id)||null;
 const featured=Object.freeze(BOOKS.map(x=>x.featuredIndex));
 const canOpen=index=>Boolean(byIndex(index));
 return Object.freeze({BOOKS,byIndex,byId,featured,canOpen});
});
