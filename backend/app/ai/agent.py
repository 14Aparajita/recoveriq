import json
import openai
from typing import List, Dict, Any
from ..core.config import get_settings
from ..models.event import DeclineCategory
from ..schemas.action import RecoveryAction

settings = get_settings()
client = openai.OpenAI(api_key=settings.openai_api_key)

# Structured output schema for the LLM
ACTION_SCHEMA = {
    "type": "object",
    "properties": {
        "action": {
            "type": "string",
            "enum": ["retry_now", "retry_later", "switch_method", "escalate", "abandon"]
        },
        "reasoning": {"type": "string"},
        "confidence": {"type": "number", "minimum": 0, "maximum": 1}
    },
    "required": ["action", "reasoning", "confidence"]
}

def get_decision_agent_prompt(decline_category: str, amount: float, segment_stats: Dict[str, float]) -> str:
    stats_text = "\n".join([f"- {action}: {rate:.2%} success rate" for action, rate in segment_stats.items()])
    return f"""
You are an AI recovery agent for a payment gateway. A payment has failed with decline category: {decline_category} and amount: ₹{amount}.

Historical success rates for recovery actions on this decline category:
{stats_text}

Available actions:
- retry_now: attempt payment again immediately (best for temporary issuer downtime)
- retry_later: schedule a retry in 3-6 hours (good for insufficient funds, assuming customer adds funds)
- switch_method: suggest alternative payment method (if card expired or risk block)
- escalate: route to human operator for manual intervention (low confidence or high value)
- abandon: give up on recovery (for unrecoverable declines)

Choose the action that maximizes expected recovery, considering success rates and customer experience.
Provide:
- action: the chosen action
- reasoning: a brief explanation
- confidence: a number between 0 and 1 representing your confidence in this decision

Return ONLY a JSON object matching the schema.
"""
    return prompt

def call_llm_agent(prompt: str) -> Dict[str, Any]:
    """Call OpenAI with structured output."""
    try:
        response = client.chat.completions.create(
            model=settings.llm_model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=150,
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        # Fallback: return a default with low confidence
        return {
            "action": "retry_now",
            "reasoning": f"LLM call failed: {str(e)}. Falling back to retry_now.",
            "confidence": 0.3
        }

def decide_action(decline_category: str, amount: float, segment_stats: Dict[str, float]) -> tuple[str, str, float]:
    """Orchestrate LLM decision with validation and fallback."""
    prompt = get_decision_agent_prompt(decline_category, amount, segment_stats)
    result = call_llm_agent(prompt)
    # Validate schema
    if not all(k in result for k in ["action", "reasoning", "confidence"]):
        # Fallback
        return "retry_now", "LLM output invalid. Fallback to retry_now.", 0.3
    action = result["action"]
    reasoning = result["reasoning"]
    confidence = result["confidence"]
    # Clamp confidence
    confidence = max(0.0, min(1.0, confidence))
    return action, reasoning, confidence