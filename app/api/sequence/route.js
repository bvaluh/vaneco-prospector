import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { company, icp, scoring } = await req.json();

    if (!company || !icp || !scoring) {
      return Response.json({ error: 'Missing data' }, { status: 400 });
    }

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: buildSequencePrompt(company, icp, scoring) }],
    });

    const text = msg.content[0].text;
    const data = JSON.parse(text.replace(/```json|```/g, '').trim());
    return Response.json(data);
  } catch (err) {
    console.error('Sequence error:', err);
    return Response.json({ error: 'Sequence generation failed' }, { status: 500 });
  }
}

function buildSequencePrompt(company, icp, scoring) {
  return `You are a B2B cold outreach expert. Write a 3-email sequence for the following prospect.

SELLER:
Product/solution: ${icp.product}
Geography: ${icp.geography}
Industry focus: ${icp.industry}

PROSPECT: ${company}
Company summary: ${scoring.company_summary}
Key signals: ${(scoring.key_signals || []).join(', ')}
ICP fit reasons: ${(scoring.icp_fit_reasons || []).join(', ')}
Talking points: ${(scoring.talking_points || []).join(', ')}
Suggested opening line: ${scoring.outreach_opening}
Anticipated objections: ${(scoring.potential_objections || []).join(', ')}

SEQUENCE RULES:
- All 3 emails share the SAME subject line (they go in one thread)
- Email 1: Short opener, 3-5 sentences max. Use the suggested opening line as inspiration. No pitch, just relevance + one question.
- Email 2: Follow-up 3 days later. Brief reason why you're reaching out + one specific social proof or result (use placeholder like [client name] if needed). Still no hard sell.
- Email 3: Soft close, 2-3 days after email 2. Short. Give them an easy out. Make it feel human, not automated.
- Tone: Direct, founder-to-founder. No buzzwords. No "I hope this email finds you well." No "revolutionary" or "game-changing."
- Each email under 100 words.

Return ONLY valid JSON, no markdown, no backticks:
{
  "subject": "<shared subject line for all 3 emails>",
  "email1": { "day": 1, "label": "Opener", "body": "<email body>" },
  "email2": { "day": 4, "label": "Value + Social Proof", "body": "<email body>" },
  "email3": { "day": 7, "label": "Soft Close", "body": "<email body>" }
}`;
}