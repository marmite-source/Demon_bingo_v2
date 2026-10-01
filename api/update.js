export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const {team_slug,passcode,item_type,item_id,requirement_id,completed,progress_value,notes}=req.body||{};
  const expected={
    'fala-marmite':process.env.TEAM_FALA_MARMITE_CODE,
    'ironcg-ravenking':process.env.TEAM_IRONCG_RAVENKING_CODE
  }[team_slug];
  if(!expected||passcode!==expected) return res.status(403).json({error:'Incorrect team passcode'});
  if(!['node','trial','final_seal'].includes(item_type)) return res.status(400).json({error:'Invalid item type'});
  const safeProgress=Math.max(0,Number.isFinite(Number(progress_value))?Math.trunc(Number(progress_value)):0);
  const safeNotes=String(notes??'').slice(0,1000);
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) return res.status(500).json({error:'Missing Supabase environment variables'});
  const now=new Date().toISOString();
  const payload={
    team_slug,item_type,item_id:String(item_id),requirement_id:String(requirement_id),
    completed:!!completed,progress_value:safeProgress,notes:safeNotes,
    completed_at:completed?now:null,updated_at:now
  };
  try{
    const r=await fetch(`${url}/rest/v1/board_requirement_progress?on_conflict=team_slug,item_type,item_id,requirement_id`,{
      method:'POST',
      headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},
      body:JSON.stringify(payload)
    });
    if(!r.ok) return res.status(r.status).send(await r.text());
    return res.status(200).json({ok:true});
  }catch(e){return res.status(500).json({error:e.message})}
}