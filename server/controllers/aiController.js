const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const askGroq = async (prompt) => {
  const response = await groq.chat.completions.create({
    model:       'llama-3.1-8b-instant',
    messages:    [{ role: 'user', content: prompt }],
    max_tokens:  2048,
    temperature: 0.7,
  });
  return response.choices[0].message.content.trim();
};

// ── HELPER — check if answer is skipped ─────────────────────────
const isSkipped = (answer) => {
  if (!answer) return true;
  const trimmed = answer.trim();
  if (trimmed === '') return true;
  if (trimmed === 'I need to skip this question.') return true;
  if (trimmed.length < 5) return true;
  return false;
};

// ── GENERATE QUESTIONS ───────────────────────────────────────────
exports.generateQuestions = async (req, res) => {
  const { role, company, category } = req.body;
  console.log('generateQuestions called:', { role, company, category });

  try {
    let prompt = '';

    if (category === 'HR') {
      prompt = `You are a senior HR interviewer at ${company} interviewing for ${role}.
Generate exactly 7 interview questions following this structure:

Q1: Warm-up about candidate background and introduction
Q2: Tell me about your greatest strength with a real example
Q3: Tell me about your biggest weakness and how you are improving it
Q4: How do you handle conflict or pressure at work
Q5: Describe your teamwork and collaboration experience
Q6: Where do you see yourself in 5 years at ${company}
Q7: Why do you want to work specifically at ${company} for this ${role} role

Return ONLY a valid JSON array of exactly 7 strings, no explanation, no markdown, no backticks:
["question1","question2","question3","question4","question5","question6","question7"]`;

    } else if (category === 'Sales') {
      prompt = `You are a senior Sales manager at ${company} interviewing for ${role}.
Generate exactly 7 interview questions following this structure:
Q1: Warm-up about candidate background and experience
Q2: How would you approach a customer who is completely not interested in your product and keeps rejecting you? Walk me through your exact step-by-step approach.
Q3: Why do you want to switch from your core technical or engineering domain to Sales? What made you choose this transition?
Q4: How do you research and prepare before approaching a new potential client
Q5: How do you handle rejection repeatedly in a single day and still stay motivated
Q6: You have missed your monthly sales target by 40%. What do you do next?
Q7: How do you build long-term trust and relationships with clients after closing a deal

Return ONLY a valid JSON array of exactly 7 strings, no explanation, no markdown, no backticks:
["question1","question2","question3","question4","question5","question6","question7"]`;

    } else {
      const roleTopics = {
        'Full Stack':        'HTML, CSS, JavaScript basics, React basics, Node.js basics, REST APIs, MongoDB basics',
        'Full Stack (MERN)': 'MongoDB, Express, React, Node.js, useState, useEffect, basic routing, REST APIs',
        'Full Stack (Java)': 'Java basics, OOP concepts, Spring Boot basics, REST APIs, MySQL basics',
        'Frontend Developer':'HTML, CSS, JavaScript basics, React basics, DOM manipulation, responsive design',
        'Associate SWE':     'programming basics, OOP, arrays, strings, basic problem solving',
        'Software Engineer': 'programming fundamentals, OOP, basic arrays, REST APIs, basic databases',
        'Python Developer':  'Python basics, lists, dictionaries, functions, loops, Flask basics',
      };

      const topics = roleTopics[role] || `${category} fundamentals, basic programming, OOP concepts`;

      prompt = `You are a friendly interviewer at ${company} interviewing a FRESHER for ${role}.
The candidate is a final year student or recent graduate with 0-1 years experience.
Topics for this role: ${topics}

Generate exactly 8 easy beginner-level questions following this EXACT structure:

Q1: A very basic introduction question. Examples:
- "Introduce yourself."
- "Tell me about yourself."
- "Walk me through your background and education."

Q2: A very basic concept question. Examples:
- "What is the difference between let, var and const in JavaScript?"
- "What are the 4 pillars of OOP? Name and explain briefly."
- "What is the difference between HTML and CSS?"
- "What is Python and why is it popular?"

Q3: Another very basic concept question about a different core topic. Examples:
- "What is the difference between == and === in JavaScript?"
- "What is a function in programming? Why do we use functions?"
- "What is the difference between a class and an object?"
- "What is React and why do developers use it?"

Q4: ONE very simple DSA question — ask ONLY for their simple logical thinking, NOT code.
Keep it the most basic level possible. Examples:
- "You have a list of 5 numbers. How would you find the largest number? Explain your thinking in simple steps."
- "How would you check if the word 'madam' reads the same forwards and backwards? Explain simply."
- "You have a list of names with some duplicates. How would you think about removing the duplicates? Explain your approach in simple steps."

Q5: ONE very simple SQL/database question — ask ONLY for logical thinking, NOT SQL code.
Keep it very basic. Examples:
- "Imagine you have a table of students with their names and marks. How would you think about finding all students who scored more than 60?"
- "You have a table of employees. How would you think about finding the employee with the highest salary? Explain simply."
- "What is a database and why do we use it instead of just storing data in a file?"

Q6: A simple practical question about a daily tool or concept. Examples:
- "What is Git? Why do developers use version control?"
- "What is the difference between GET and POST in a REST API?"
- "What is npm and why do we use it in Node.js projects?"

Q7: A simple college project question. Examples:
- "Tell me about any one project you made in college. What did you build and what did you learn?"
- "What was the most interesting thing you built during your studies? Explain it simply."
- "Describe one project from your college in 3-4 sentences. What was your role?"

Q8: A simple best practices question. Examples:
- "Why is it important to write comments in your code?"
- "What does responsive design mean? Why is it important for websites?"
- "Why should we use version control like Git in projects?"

STRICT RULES:
- ALL 8 questions must be easy enough for a student who just finished their degree
- Q4 must be the SIMPLEST possible DSA thinking question — no complex algorithms
- Q5 must be the SIMPLEST possible database thinking question — basic filtering only
- NO system design questions at all
- NO microservices, kubernetes, design patterns, distributed systems
- NO advanced data structures like trees, graphs, heaps
- NO complex algorithms like dynamic programming, backtracking
- Language must be simple, friendly and encouraging
- Each question must be directly about ${role} work at ${company}

Return ONLY a valid JSON array of exactly 8 strings, no explanation, no markdown, no backticks:
["question1","question2","question3","question4","question5","question6","question7","question8"]`;
    }

    const text      = await askGroq(prompt);
    const cleaned   = text.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(cleaned);

    console.log('Questions generated successfully:', questions.length);
    res.json({ questions });
  } catch (err) {
    console.error('Groq question error:', err.message);
    res.status(500).json({ message: 'Failed to generate questions' });
  }
};

// ── EVALUATE ANSWERS ─────────────────────────────────────────────
exports.evaluateAnswers = async (req, res) => {
  const { role, company, category, answers } = req.body;
  console.log('evaluateAnswers called:', { role, company, category, count: answers?.length });

  // Count meaningful answers (not skipped, not too short)
  const answeredQuestions = answers.filter(a => !isSkipped(a.answer));

  // ── ALL QUESTIONS SKIPPED ────────────────────────────────────────
  if (answeredQuestions.length === 0) {
    return res.json({
      overallScore:     0,
      grade:            'F',
      overallFeedback:  'You skipped all interview questions. Please attempt the questions seriously to receive meaningful feedback and improve your interview skills.',
      strongerSections: [],
      weakerSections:   [
        'No questions were answered',
        'Communication skills could not be evaluated',
        'Technical understanding could not be evaluated',
      ],
      improvementAreas: [
        { topic:'Interview Participation', priority:'High',   suggestion:'Try answering every question, even if you are not sure. Any attempt is better than none.' },
        { topic:'Communication',           priority:'High',   suggestion:'Practice explaining your thoughts step-by-step in simple language.' },
        { topic:'Confidence',              priority:'Medium', suggestion:'Attempt mock interviews regularly to become more comfortable speaking.' },
      ],
      answers: answers.map(a => ({
        question:    a.question,
        answer:      a.answer || '',
        score:       0,
        feedback:    'This question was skipped. No answer was provided.',
        strength:    'No answer provided.',
        improvement: 'Try attempting this question with at least a basic explanation.',
        idealAnswer: 'Provide a simple beginner-friendly answer explaining your basic understanding.',
      })),
    });
  }

  // Build Q&A text — mark skipped answers clearly
  const qaText = answers.map((a, i) => {
    const skipped = isSkipped(a.answer);
    return `Q${i + 1}: ${a.question}\nAnswer: ${
      skipped
        ? 'SKIPPED — candidate did not answer. Give score 0 for this question.'
        : a.answer
    }`;
  }).join('\n\n');

  try {
    let guidelines = '';

    if (category === 'HR') {
      guidelines = `
Evaluation guidelines for FRESHER HR interview:
- Be encouraging and supportive
- Reward honesty, confidence, communication and willingness to learn
SCORING RULES (follow strictly):
- SKIPPED or empty answer = 0 score, no exceptions
- One-line or very short answer (under 10 words) = 5 to 15 score
- Weak answer with little substance = 20 to 35 score
- Average fresher answer with some explanation = 40 to 65 score
- Good detailed answer with real example = 70 to 85 score
- Excellent answer with clear structure and example = 86 to 100 score`;

    } else if (category === 'Sales') {
      guidelines = `
Evaluation guidelines for FRESHER Sales interview:
- Be encouraging and supportive
- Reward communication, confidence and customer-first thinking
SCORING RULES (follow strictly):
- SKIPPED or empty answer = 0 score, no exceptions
- One-line or very short answer (under 10 words) = 5 to 15 score
- Weak answer with little substance = 20 to 35 score
- Average fresher answer = 40 to 65 score
- Good detailed answer = 70 to 85 score
- Excellent answer = 86 to 100 score`;

    } else {
      guidelines = `
Evaluation guidelines for FRESHER technical interview:
- This is a fresher candidate — be encouraging but realistic
SCORING RULES (follow strictly):
- SKIPPED or empty answer = 0 score, absolutely no exceptions
- One-line or very short answer (under 10 words) = 5 to 15 score
- Weak answer with little technical explanation = 20 to 35 score
- Partially correct fresher-level answer = 40 to 65 score
- Clear and well-explained answer = 70 to 85 score
- Excellent detailed answer with examples = 86 to 100 score
IMPORTANT:
- Reward logical thinking and basic understanding
- Reward communication clarity and practical examples
- STRICTLY penalize skipped answers with 0
- STRICTLY penalize one-word answers with very low scores
- Do NOT give 60+ to any skipped or near-empty answer`;
    }

    const prompt = `You are a friendly and realistic interviewer evaluating a FRESHER candidate.
Candidate Role: ${role}
Company: ${company}
Category: ${category}

${guidelines}

CRITICAL RULE: Any answer marked as SKIPPED must receive a score of exactly 0. No exceptions.

Interview Questions and Answers:
${qaText}

Evaluate all ${answers.length} answers and return ONLY valid JSON with no markdown or backticks:
{
  "overallScore": <number 0-100 — calculate as average of all individual scores including zeros for skipped>,
  "grade": "<A for 85+, B for 70-84, C for 55-69, D for 40-54, F for below 40>",
  "overallFeedback": "<3-4 sentence honest overall assessment. Mention if questions were skipped.>",
  "strongerSections": [
    "<point 1 — specific topic where candidate performed well>",
    "<point 2 — another strength>",
    "<point 3 — optional third strength>"
  ],
  "weakerSections": [
    "<point 1 — specific topic where candidate was weak or skipped>",
    "<point 2 — another weak area>",
    "<point 3 — optional third weakness>"
  ],
  "improvementAreas": [
    {
      "topic": "<specific topic to improve>",
      "priority": "<High / Medium / Low>",
      "suggestion": "<one specific actionable step the fresher can take>"
    },
    {
      "topic": "<another topic>",
      "priority": "<High / Medium / Low>",
      "suggestion": "<one actionable step>"
    },
    {
      "topic": "<another topic>",
      "priority": "<High / Medium / Low>",
      "suggestion": "<one actionable step>"
    }
  ],
  "answers": [
    {
      "score": <0 if SKIPPED, otherwise 0-100 based on scoring rules>,
      "feedback": "<if skipped: 'This question was skipped.' otherwise 2 sentence feedback>",
      "strength": "<if skipped: 'No answer provided.' otherwise what was good>",
      "improvement": "<specific actionable improvement>",
      "idealAnswer": "<simple realistic fresher-level answer>"
    }
  ]
}`;

    const text       = await askGroq(prompt);
    const cleaned    = text.replace(/```json|```/g, '').trim();
    const evaluation = JSON.parse(cleaned);

    // ── SAFETY OVERRIDES ─────────────────────────────────────────
    // Force skipped answers to 0 regardless of what AI returned
    evaluation.answers = evaluation.answers.map((evalAnswer, i) => {
      if (isSkipped(answers[i]?.answer)) {
        return {
          ...evalAnswer,
          score:       0,
          feedback:    'This question was skipped. No answer was provided.',
          strength:    'No answer provided.',
          improvement: 'Attempt this question next time with at least a basic explanation.',
        };
      }
      return evalAnswer;
    });

    // Recalculate overall score from individual scores
    const totalScore = Math.round(
      evaluation.answers.reduce((sum, a) => sum + (a.score || 0), 0) / evaluation.answers.length
    );
    evaluation.overallScore = totalScore;

    // Recalculate grade based on actual score
    evaluation.grade =
      totalScore >= 85 ? 'A' :
      totalScore >= 70 ? 'B' :
      totalScore >= 55 ? 'C' :
      totalScore >= 40 ? 'D' : 'F';

    // Cap unrealistically high scores
    if (evaluation.overallScore > 95) evaluation.overallScore = 95;

    // If most answers skipped, add honest feedback
    const participationRatio = answeredQuestions.length / answers.length;
    if (participationRatio < 0.5) {
      evaluation.overallFeedback = `${answeredQuestions.length} out of ${answers.length} questions were answered. Most questions were skipped. Please attempt all questions to get a meaningful evaluation and improve your interview performance.`;
    }

    console.log('Evaluation complete. Overall score:', evaluation.overallScore);
    res.json(evaluation);

  } catch (err) {
    console.error('Groq evaluation error:', err.message);
    res.status(500).json({ message: 'Failed to evaluate answers' });
  }
};