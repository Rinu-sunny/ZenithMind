const emotionMap = {
  happy: {
    keywords: ["happy", "joy", "joyful", "excited", "excitement", "good", "great", "amazing", "wonderful", "fantastic", 
               "relaxed", "calm", "peaceful", "content", "satisfied", "pleased", "delighted", "cheerful", "grateful", 
               "thankful", "blessed", "fortunate", "lucky", "proud", "accomplished", "successful", "winning", "achieved",
               "love", "loved", "loving", "appreciation", "optimistic", "hopeful", "energetic", "motivated", "inspired"],
    weight: 1.3
  },
  sad: {
    keywords: ["sad", "sadness", "down", "depressed", "depression", "tired", "exhausted", "hopeless", "helpless", 
               "despair", "miserable", "unhappy", "lonely", "alone", "isolated", "empty", "numb", "crying", "tears",
               "hurt", "pain", "heartbroken", "disappointed", "disappointment", "regret", "grief", "loss", "lost"],
    weight: 1.3
  },
  anxious: {
    keywords: ["anxious", "anxiety", "worried", "worry", "worrying", "nervous", "nervousness", "fear", "afraid", "scared",
               "panic", "panicking", "dread", "uneasy", "uncertain", "unsure", "doubt", "doubtful", "insecure", 
               "overwhelmed", "restless", "tense", "tension", "concerned", "apprehensive", "paranoid"],
    weight: 1.4
  },
  stressed: {
    keywords: ["stressed", "stress", "stressful", "pressure", "pressured", "overwhelmed", "overwhelming", "burden", 
               "burdened", "overworked", "exhausted", "drained", "burnt out", "burnout", "too much", "can't cope",
               "struggling", "struggle", "difficult", "hard", "demanding", "hectic", "chaotic", "rushed"],
    weight: 1.3
  },
  angry: {
    keywords: ["angry", "anger", "mad", "frustrated", "frustration", "irritated", "irritation", "annoyed", "annoying",
               "furious", "rage", "outraged", "pissed", "upset", "agitated", "hostile", "resentful", "resentment",
               "bitter", "hatred", "hate", "disgusted", "disgust", "offended", "betrayed"],
    weight: 1.2
  }
};

// Negation words that can flip sentiment
const negations = ["not", "no", "never", "neither", "nobody", "nothing", "nowhere", "don't", "doesn't", "didn't", "won't", "wouldn't", "can't", "cannot", "couldn't"];

// Intensifiers that amplify emotion
const intensifiers = {
  strong: ["very", "extremely", "incredibly", "absolutely", "completely", "totally", "really", "so", "too", "deeply", "heavily"],
  moderate: ["quite", "rather", "pretty", "fairly", "somewhat"]
};

export function analyzeJournal(text) {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  
  let emotionScores = {};
  Object.keys(emotionMap).forEach(e => emotionScores[e] = 0);

  // Track context for better accuracy
  let totalMatches = 0;
  let sentimentSum = 0;

  // Analyze with context awareness
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = i > 0 ? words[i - 1] : "";
    const nextWord = i < words.length - 1 ? words[i + 1] : "";
    
    // Check for negations
    const isNegated = negations.includes(prevWord);
    
    // Check for intensifiers
    let intensityMultiplier = 1.0;
    if (intensifiers.strong.includes(prevWord)) {
      intensityMultiplier = 1.25;
    } else if (intensifiers.moderate.includes(prevWord)) {
      intensityMultiplier = 1.1;
    }

    // Check each emotion's keywords
    for (const emotion in emotionMap) {
      const { keywords, weight } = emotionMap[emotion];
      
      for (const keyword of keywords) {
        // Use word boundaries for better matching
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (regex.test(word) || word.includes(keyword)) {
          let score = weight * intensityMultiplier;
          
          // If negated, reduce score or flip to opposite
          if (isNegated) {
            score *= -0.5;
          }
          
          emotionScores[emotion] += score;
          totalMatches++;
          
          // Contribute to overall sentiment
          if (emotion === 'happy') {
            sentimentSum += score;
          } else {
            sentimentSum -= score * 0.8;
          }
        }
      }
    }
  }

  // Determine dominant emotion
  let detectedEmotion = "neutral";
  let maxScore = 0;
  for (const e in emotionScores) {
    if (emotionScores[e] > maxScore) {
      maxScore = emotionScores[e];
      detectedEmotion = e;
    }
  }

  // Calculate sentiment score with better normalization
  let sentimentScore = 0.5;
  
  if (totalMatches > 0) {
    // Normalize based on text length and number of matches
    const textLength = words.length;
    const matchDensity = totalMatches / Math.max(textLength, 1);
    
    sentimentScore = 0.5 + (sentimentSum / (totalMatches * 4));
    
    // Adjust for match density (more matches = more confident score)
    if (matchDensity > 0.1) {
      sentimentScore = sentimentScore * 1.1;
    }
  }
  
  sentimentScore = Math.max(0, Math.min(1, sentimentScore));

  // Generate contextual reflective prompts
  const basePrompts = {
    happy: [
      "What made you feel good today?",
      "What positive moments stand out to you?",
      "How can you create more moments like this?",
      "Who or what contributed to your happiness?"
    ],
    sad: [
      "Would sharing this help you feel lighter?",
      "What small thing could bring you comfort right now?",
      "Is there someone you trust who could support you?",
      "What has helped you through similar feelings before?"
    ],
    anxious: [
      "What is worrying you most right now?",
      "What's one thing within your control in this situation?",
      "What would help you feel safer or more secure?",
      "Can you identify what's triggering these feelings?"
    ],
    stressed: [
      "What can help reduce this stress?",
      "What's the most important thing to focus on right now?",
      "What tasks can you delegate or postpone?",
      "When can you take a break to recharge?"
    ],
    angry: [
      "What triggered this feeling?",
      "What would you need to feel heard or understood?",
      "Is there a way to express this constructively?",
      "What boundaries might help prevent this in the future?"
    ],
    neutral: [
      "Would you like to reflect more?",
      "What's something on your mind today?",
      "How are you really feeling right now?",
      "What would you like to explore further?"
    ]
  };

  // Select a contextual prompt based on sentiment intensity
  const promptIndex = Math.floor(Math.abs(sentimentScore - 0.5) * 4);
  const prompts = basePrompts[detectedEmotion];
  const reflective_prompt = prompts[Math.min(promptIndex, prompts.length - 1)];

  return {
    sentiment_score: sentimentScore,
    emotion: detectedEmotion,
    reflective_prompt: reflective_prompt
  };
}
