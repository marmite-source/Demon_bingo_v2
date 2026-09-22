export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  const url=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) return res.status(500).json({error:'Missing Supabase environment variables'});
  try{
    const r=await fetch(`${url}/rest/v1/board_requirement_progress?select=team_slug,item_type,item_id,requirement_id,completed,updated_at`,{
      headers:{apikey:key,Authorization:`Bearer ${key}`}
    });
    const text=await r.text();
    if(!r.ok) return res.status(r.status).send(text);
    res.setHeader('Cache-Control','no-store');
    return res.status(200).json({rows:JSON.parse(text)});
  }catch(e){return res.status(500).json({error:e.message})}
}