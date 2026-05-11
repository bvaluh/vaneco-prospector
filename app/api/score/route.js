import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
export async function POST(req) {
  try {
    const { company, icp } = await req.json();
    if (!company || !icp) {
      return Response.json({ error: 'Missing company or ICP' }, { status: 400 });
    }
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1200,
      tools: [{
        type: 'web_search_20250305',
        name: 'web_search',
        max_uses: 2
      }],
      messages: [{ role: 'user', content: buildPrompt(company, icp) }],
    });
    const textBlock = msg.content.filter(b => b.type === 'text').pop();
    if (!textBlock) {
      return Response.json({ error: 'No text response from AI' }, { status: 500 });
    }
    const text = textBlock.text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: 'No JSON found in response' }, { status: 500 });
    }
    const data = JSON.parse(jsonMatch[0]);
    return Response.json(data);
  } catch (err) {
    console.error('Score error:', err);
    return Response.json({ error: 'Scoring failed' }, { status: 500 });
  }
}
function buildPrompt(company, icp) {
  return `You are a B2B sales intelligence engine. Analyze this prospect company against the seller's ICP.

SELLER ICP:
Product/solution: ${icp.product}
Target industry: ${icp.industry}
Company size: ${icp.sizeMin}–${icp.sizeMax} employees
Geography: ${icp.geography}
Key buying signals: ${icp.signals}

INSTRUCTIONS:
Use the web_search tool to research this company before scoring. Search for: company location/HQ, size, recent news, hiring, funding, or relevant buying signals. You have up to 2 searches — use them wisely. If web search returns no useful results, fall back to your training knowledge and lower your confidence in scoring.

SCORING NOTES:
- readiness_score reflects how ready the prospect is to buy NOW, based on the buying signals listed above. Geography does NOT factor into readiness.
- opportunity_score reflects fit (industry, size, geography). See geography rule below.
- composite_score is the overall priority blend of readiness and opportunity.

GEOGRAPHY RULE (applies to opportunity_score and composite_score):
The prospect must have meaningful business presence in the seller's target geography ("${icp.geography}"). Presence is defined broadly: headquarters, regional offices, significant operations, active customer base, employees, hiring activity, or documented commercial activity in the target region all count.

- If the prospect has clear presence in the target geography → geography is neutral/positive, score normally on industry and size fit.
- If the prospect has NO meaningful presence in the target geography → opportunity_score MUST be below 40 AND composite_score MUST be below 40, regardless of industry or size fit. State the geographic mismatch clearly in icp_fit_reasons.

Important: Do not penalize a company based on HQ location alone if it has real business activity in the target geography. A company headquartered in Paris with a US sales office and US customers HAS US presence.

PROSPECT: ${company}

Return ONLY a valid JSON object, no markdown, no backticks, no preamble. Use this exact schema:
{
  "readiness_score": <0-100>,
  "opportunity_score": <0-100>,
  "composite_score": <0-100>,
  "tier": "<High|Medium|Low>",
  "company_summary": "<1-2 sentences about the company>",
  "key_signals": ["<signal1>", "<signal2>", "<signal3>"],
  "icp_fit_reasons": ["<reason1>", "<reason2>"],
  "recommended_action": "<specific next step for the sales rep>",
  "outreach_opening": "<personalized first line for cold email or LinkedIn message>",
  "talking_points": ["<point1>", "<point2>", "<point3>"],
  "potential_objections": ["<objection1>", "<objection2>"]
}`;
}