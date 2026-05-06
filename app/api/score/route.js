import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { company, icp } = await req.json();

    if (!company || !icp) {
      return Response.json({ error: 'Missing company or ICP' }, { status: 400 });
    }

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: buildPrompt(company, icp) }],
    });

    const text = msg.content[0].text;
    const data = JSON.parse(text.replace(/```json|```/g, '').trim());

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

PROSPECT: ${company}

Use your knowledge of this company. If you don't know it well, make a reasonable inference based on the name/domain.
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
