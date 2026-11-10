// DH-12C.2: approved, same-origin projection only; no private API calls.
export function parseApprovedCatalogue(data){
 if(data?.schemaVersion!==1||!Array.isArray(data.records)||data.records.length>200)return [];
 const idPattern=/^[a-z][a-z0-9-]{2,79}\/[a-z][a-z0-9-]{2,79}$/;
 const seen=new Set(),records=[];
 for(const r of data.records){
  if(!r||!idPattern.test(r.id||'')||seen.has(r.id)||
   typeof r.artist!=='string'||!r.artist.trim()||r.artist.length>180||
   typeof r.title!=='string'||!r.title.trim()||r.title.length>180||
   !['album','ep','single','other'].includes(r.type)||
   !['existing_release','scheduled'].includes(r.status))return [];
  seen.add(r.id);
  records.push({id:r.id,artist:r.artist,title:r.title,type:r.type,status:r.status,
   ...(r.status==='scheduled'&&/^\d{4}-\d{2}-\d{2}$/.test(r.plannedReleaseDate||'')?
    {plannedReleaseDate:r.plannedReleaseDate}:{})});
 }
 return records;
}
export function recordsForRack(records,id){
 if(id==='singles')return records.filter(r=>r.type==='single');
 if(id==='albums')return records.filter(r=>['album','ep'].includes(r.type));
 if(id!=='bands')return [];
 const unique=new Map();
 for(const r of records)if(!unique.has(r.artist))unique.set(r.artist,r);
 return [...unique.values()];
}
