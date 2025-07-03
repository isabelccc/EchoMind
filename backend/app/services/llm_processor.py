import asyncio
import json
import time
from typing import Dict, List, Optional, Any
from enum import Enum
import openai
import anthropic
from langchain.schema import HumanMessage, SystemMessage
from app.core.logging import LoggerMixin, log_performance
from app.core.config import settings

class InsightType(Enum):
    """Types of insights that can be generated"""
    SENTIMENT = "sentiment"
    INTENT = "intent"
    SUGGESTED_RESPONSE = "suggested_response"
    OBJECTION_HANDLING = "objection_handling"
    FAQ_SUGGESTION = "faq_suggestion"
    EMOTION_CALIBRATION = "emotion_calibration"
    ACTION_ITEM = "action_item"

class AgentType(Enum):
    """Types of AI agents"""
    SENTIMENT_ANALYZER = "sentiment_analyzer"
    INTENT_CLASSIFIER = "intent_classifier"
    RESPONSE_GENERATOR = "response_generator"
    OBJECTION_HANDLER = "objection_handler"
    SUMMARIZER = "summarizer"

class LLMProcessor(LoggerMixin):
    """Multi-agent LLM processor for generating real-time insights"""
    
    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None
        self.session_contexts: Dict[str, List[Dict[str, Any]]] = {}
        self._startup_complete = False
        self._shutdown_complete = False
        
        # Agent configurations
        self.agents = {
            AgentType.SENTIMENT_ANALYZER: {
                "model": settings.GPT_MODEL,
                "temperature": 0.3,
                "max_tokens": 100
            },
            AgentType.INTENT_CLASSIFIER: {
                "model": settings.GPT_MODEL,
                "temperature": 0.2,
                "max_tokens": 150
            },
            AgentType.RESPONSE_GENERATOR: {
                "model": settings.CLAUDE_MODEL,
                "temperature": 0.7,
                "max_tokens": 200
            },
            AgentType.OBJECTION_HANDLER: {
                "model": settings.GPT_MODEL,
                "temperature": 0.6,
                "max_tokens": 150
            },
            AgentType.SUMMARIZER: {
                "model": settings.CLAUDE_MODEL,
                "temperature": 0.4,
                "max_tokens": 300
            }
        }

    async def startup(self):
        """Initialize the LLM processor"""
        self.logger.info("llm_processor_starting")
        
        # Initialize OpenAI client
        if settings.OPENAI_API_KEY:
            self.openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            self.logger.info("openai_client_initialized")
        
        # Initialize Anthropic client
        if settings.ANTHROPIC_API_KEY:
            self.anthropic_client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
            self.logger.info("anthropic_client_initialized")
        
        if not self.openai_client and not self.anthropic_client:
            self.logger.warning("no_llm_clients_configured")
        
        self._startup_complete = True
        self.logger.info("llm_processor_started")

    async def shutdown(self):
        """Shutdown the LLM processor"""
        self.logger.info("llm_processor_shutting_down")
        
        # Clear session data
        self.session_contexts.clear()
        
        self._shutdown_complete = True
        self.logger.info("llm_processor_shutdown_complete")

    def is_healthy(self) -> bool:
        """Check if the LLM processor is healthy"""
        return (
            self._startup_complete and 
            not self._shutdown_complete and 
            (self.openai_client is not None or self.anthropic_client is not None)
        )

    async def generate_insights(self, transcript: str, session_id: str) -> Dict[str, Any]:
        """Generate comprehensive insights from transcript"""
        start_time = time.time()
        
        try:
            # Update session context
            self._update_session_context(session_id, transcript)
            
            # Get conversation context
            context = self._get_conversation_context(session_id)
            
            # Generate insights using multiple agents
            insights = {
                "transcript": transcript,
                "timestamp": time.time(),
                "insights": {}
            }
            
            # Run agents in parallel
            tasks = [
                self._analyze_sentiment(transcript, context),
                self._classify_intent(transcript, context),
                self._generate_suggested_response(transcript, context),
                self._handle_objections(transcript, context),
                self._suggest_faq(transcript, context),
                self._calibrate_emotion(transcript, context)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            insight_types = [
                InsightType.SENTIMENT,
                InsightType.INTENT,
                InsightType.SUGGESTED_RESPONSE,
                InsightType.OBJECTION_HANDLING,
                InsightType.FAQ_SUGGESTION,
                InsightType.EMOTION_CALIBRATION
            ]
            
            for i, (insight_type, result) in enumerate(zip(insight_types, results)):
                if isinstance(result, Exception):
                    self.logger.error(f"agent_error_{insight_type.value}", error=str(result))
                    insights["insights"][insight_type.value] = None
                else:
                    insights["insights"][insight_type.value] = result
            
            # Log performance
            duration = time.time() - start_time
            log_performance("insight_generation", duration, session_id=session_id)
            
            return insights
            
        except Exception as e:
            self.logger.error("insight_generation_error", session_id=session_id, error=str(e))
            return {"error": str(e)}

    async def _analyze_sentiment(self, transcript: str, context: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze customer sentiment"""
        prompt = f"""
        Analyze the sentiment of the following customer utterance in a customer service context.
        
        Recent conversation context:
        {self._format_context(context)}
        
        Current utterance: "{transcript}"
        
        Provide a JSON response with:
        - sentiment: positive, negative, neutral, or mixed
        - confidence: 0.0 to 1.0
        - emotions: list of detected emotions (e.g., frustration, satisfaction, confusion)
        - intensity: low, medium, or high
        """
        
        response = await self._call_llm(prompt, AgentType.SENTIMENT_ANALYZER)
        return self._parse_json_response(response)

    async def _classify_intent(self, transcript: str, context: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Classify customer intent"""
        prompt = f"""
        Classify the intent of the following customer utterance in a customer service context.
        
        Recent conversation context:
        {self._format_context(context)}
        
        Current utterance: "{transcript}"
        
        Provide a JSON response with:
        - primary_intent: question, complaint, request, feedback, or general
        - secondary_intent: specific sub-category if applicable
        - urgency: low, medium, or high
        - requires_action: true or false
        - suggested_priority: low, medium, or high
        """
        
        response = await self._call_llm(prompt, AgentType.INTENT_CLASSIFIER)
        return self._parse_json_response(response)

    async def _generate_suggested_response(self, transcript: str, context: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate suggested response for agent"""
        prompt = f"""
        As a customer service expert, generate a helpful and empathetic response to the customer's utterance.
        
        Recent conversation context:
        {self._format_context(context)}
        
        Customer: "{transcript}"
        
        Provide a JSON response with:
        - suggested_response: the actual response text
        - tone: professional, friendly, empathetic, or authoritative
        - key_points: list of main points to address
        - follow_up_questions: list of questions to ask if needed
        """
        
        response = await self._call_llm(prompt, AgentType.RESPONSE_GENERATOR)
        return self._parse_json_response(response)

    async def _handle_objections(self, transcript: str, context: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Handle customer objections"""
        prompt = f"""
        Identify and provide handling strategies for any objections or concerns in the customer's utterance.
        
        Recent conversation context:
        {self._format_context(context)}
        
        Current utterance: "{transcript}"
        
        Provide a JSON response with:
        - objections_detected: list of objections found
        - handling_strategies: list of strategies for each objection
        - key_phrases: list of phrases to use
        - escalation_needed: true or false
        """
        
        response = await self._call_llm(prompt, AgentType.OBJECTION_HANDLER)
        return self._parse_json_response(response)

    async def _suggest_faq(self, transcript: str, context: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Suggest relevant FAQ articles"""
        prompt = f"""
        Based on the customer's utterance, suggest relevant FAQ articles or knowledge base topics.
        
        Recent conversation context:
        {self._format_context(context)}
        
        Current utterance: "{transcript}"
        
        Provide a JSON response with:
        - relevant_topics: list of FAQ topics
        - confidence_scores: list of confidence scores (0.0-1.0) for each topic
        - suggested_articles: list of specific article titles
        """
        
        response = await self._call_llm(prompt, AgentType.INTENT_CLASSIFIER)
        return self._parse_json_response(response)

    async def _calibrate_emotion(self, transcript: str, context: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calibrate agent emotion to match customer"""
        prompt = f"""
        Analyze the customer's emotional state and suggest how the agent should calibrate their emotional response.
        
        Recent conversation context:
        {self._format_context(context)}
        
        Current utterance: "{transcript}"
        
        Provide a JSON response with:
        - customer_emotion: primary emotion detected
        - agent_tone_adjustment: how agent should adjust tone
        - mirror_techniques: specific techniques to use
        - energy_level: low, medium, or high
        """
        
        response = await self._call_llm(prompt, AgentType.SENTIMENT_ANALYZER)
        return self._parse_json_response(response)

    async def _call_llm(self, prompt: str, agent_type: AgentType) -> str:
        """Call the appropriate LLM based on agent type"""
        config = self.agents[agent_type]
        model = config["model"]
        
        try:
            if "gpt" in model.lower() and self.openai_client:
                response = await self.openai_client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=config["temperature"],
                    max_tokens=config["max_tokens"]
                )
                return response.choices[0].message.content
            
            elif "claude" in model.lower() and self.anthropic_client:
                response = await self.anthropic_client.messages.create(
                    model=model,
                    max_tokens=config["max_tokens"],
                    temperature=config["temperature"],
                    messages=[{"role": "user", "content": prompt}]
                )
                return response.content[0].text
            
            else:
                raise Exception(f"No suitable LLM client for model {model}")
                
        except Exception as e:
            self.logger.error("llm_call_error", agent_type=agent_type.value, error=str(e))
            raise

    def _parse_json_response(self, response: str) -> Dict[str, Any]:
        """Parse JSON response from LLM"""
        try:
            # Try to extract JSON from response
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].strip()
            else:
                json_str = response.strip()
            
            return json.loads(json_str)
        except Exception as e:
            self.logger.error("json_parsing_error", response=response[:100], error=str(e))
            return {"error": "Failed to parse response", "raw_response": response}

    def _update_session_context(self, session_id: str, transcript: str):
        """Update session context with new transcript"""
        if session_id not in self.session_contexts:
            self.session_contexts[session_id] = []
        
        self.session_contexts[session_id].append({
            "transcript": transcript,
            "timestamp": time.time(),
            "type": "customer"
        })
        
        # Keep only last 20 exchanges
        if len(self.session_contexts[session_id]) > 20:
            self.session_contexts[session_id] = self.session_contexts[session_id][-20:]

    def _get_conversation_context(self, session_id: str) -> List[Dict[str, Any]]:
        """Get conversation context for a session"""
        return self.session_contexts.get(session_id, [])

    def _format_context(self, context: List[Dict[str, Any]]) -> str:
        """Format conversation context for LLM prompts"""
        if not context:
            return "No previous context available."
        
        formatted = []
        for i, exchange in enumerate(context[-5:], 1):  # Last 5 exchanges
            formatted.append(f"{i}. {exchange['transcript']}")
        
        return "\n".join(formatted)

    def clear_session(self, session_id: str):
        """Clear session data"""
        if session_id in self.session_contexts:
            del self.session_contexts[session_id]
        
        self.logger.info("session_cleared", session_id=session_id)

    def get_stats(self) -> Dict[str, Any]:
        """Get LLM processor statistics"""
        return {
            "active_sessions": len(self.session_contexts),
            "total_contexts": sum(len(contexts) for contexts in self.session_contexts.values()),
            "healthy": self.is_healthy(),
            "openai_configured": self.openai_client is not None,
            "anthropic_configured": self.anthropic_client is not None
        } 