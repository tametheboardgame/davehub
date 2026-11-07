(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.DH11ArtPalettes=api;
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  // DH-11C.3A: colour/material experiments on the SAME unmodified 3D geometry.
  // This is not a texture asset, geometry source or approval of a design.
  const presets=[
    {
      id:'amber-ink',name:'Amber & Ink',tagline:'Warm, mysterious, manuscript-filled',
      description:'Rich timber, weathered teal, softly glowing parchment and muted brass. Primary proposal.',
      backdrop:'#211a28',plaster:'#716772',stone:'#514e61',timber:'#84664b',darkwood:'#453642',
      edge:'#b18a69',desk:'#89654b',brass:'#d5ab70',paper:'#ead6ae',ink:'#373443',
      cabinet:'#4f7374',drawer:'#73918d',rug:'#684854',glass:'#bfd2d9',
      sky:'#728dab',island:'#788474',leaf:'#779d83',bin:'#637d7a',
      bookSpines:['#986d66','#665776','#b69b74','#4d7882','#74694d','#a88882'],
      ambient:'#c4d0ef',ground:'#4a333a',sun:'#f8d19a',lamp:'#ffd19b',window:'#8fb1dc',
      ambientIntensity:2.1,sunIntensity:2.5,lampIntensity:30,windowIntensity:16,exposure:1.13
    },
    {
      id:'moonlit-archive',name:'Moonlit Archive',tagline:'Midnight, mysteries and blue magic',
      description:'Cool indigo plaster, blue-green metals and pale lamplight for a quieter supernatural room.',
      backdrop:'#111d30',plaster:'#495568',stone:'#3a4559',timber:'#5b5966',darkwood:'#303c4e',
      edge:'#899b9d',desk:'#605865',brass:'#b5ae91',paper:'#d4d6c1',ink:'#27364b',
      cabinet:'#456d7e',drawer:'#688b96',rug:'#404963',glass:'#a3d4ed',
      sky:'#3e6395',island:'#596c77',leaf:'#619291',bin:'#496b76',
      bookSpines:['#687d8f','#7f6980','#5c7997','#65888b','#8c849b','#466479'],
      ambient:'#a3bce6',ground:'#29364e',sun:'#c1d5e7',lamp:'#f0d5ae',window:'#72b7e7',
      ambientIntensity:1.75,sunIntensity:1.45,lampIntensity:22,windowIntensity:26,exposure:1.18
    },
    {
      id:'golden-storybook',name:'Golden Storybook',tagline:'Cosy, bright and playfully impossible',
      description:'Sunlit honey-coloured wood, sage walls, cream paper and coppery accents. More inviting, less mysterious.',
      backdrop:'#44312c',plaster:'#a3a08b',stone:'#777f76',timber:'#ab8059',darkwood:'#675144',
      edge:'#d0a977',desk:'#b18862',brass:'#dab476',paper:'#fff0c9',ink:'#4c453e',
      cabinet:'#718f86',drawer:'#9ab0a2',rug:'#966e70',glass:'#e5ddd4',
      sky:'#a5c6d1',island:'#99a77a',leaf:'#8aaf7b',bin:'#809490',
      bookSpines:['#ba8972','#819f89','#bca679','#8793ac','#a47e88','#867c6d'],
      ambient:'#f6ead7',ground:'#66534b',sun:'#fff0c2',lamp:'#ffe1a6',window:'#b6d9dd',
      ambientIntensity:2.25,sunIntensity:3.0,lampIntensity:21,windowIntensity:12,exposure:1.08
    }
  ].map(p=>Object.freeze({...p,bookSpines:Object.freeze([...p.bookSpines])}));
  const all=Object.freeze(presets);
  const get=id=>all.find(p=>p.id===id)||all[0];
  return Object.freeze({all,get});
});