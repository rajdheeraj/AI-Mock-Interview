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

Q1:A very basic introduction question asked to candidates. Examples:
"Introduce yourself."
"Tell me about yourself."
"Can you give a short introduction about yourself?"
"Walk me through your background."
"Tell us about your education, skills, and projects."

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
- "How would you count how many times the number 5 appears in a list? Explain step by step."

Q5: ONE very simple SQL/database question — ask ONLY for logical thinking, NOT SQL code.
Keep it very basic. Examples:
- "Imagine you have a table of students with their names and marks. How would you think about finding all students who scored more than 60? Explain your thinking."
- "You have a table of employees. How would you think about finding the employee with the highest salary? Explain simply."
- "What is a database and why do we use it instead of just storing data in a file?"

Q6: A simple practical question about a daily tool or concept. Examples:
- "What is Git? Why do developers use version control?"
- "What is the difference between GET and POST in a REST API?"
- "What is npm and why do we use it in Node.js projects?"
- "What is the difference between SQL and NoSQL databases?"

Q7: A simple college project question. Examples:
- "Tell me about any one project you made in college. What did you build and what did you learn?"
- "What was the most interesting thing you built during your studies? Explain it simply."
- "Describe one project from your college in 3-4 sentences. What was your role?"

Q8: A simple best practices question. Examples:
- "Why is it important to write comments in your code?"
- "What does responsive design mean? Why is it important for websites?"
- "Why should we use version control like Git in projects?"
- "What is the importance of testing your code before submitting it?"

STRICT RULES — follow these exactly:
- ALL 8 questions must be easy enough for a student who just finished their degree
- Q3 must be the SIMPLEST possible DSA thinking question — no complex algorithms, no trees, no graphs, no dynamic programming
- Q4 must be the SIMPLEST possible database thinking question — basic filtering or finding records
- NO system design questions at all
- NO microservices, kubernetes, design patterns, distributed systems
- NO advanced data structures like trees, graphs, heaps, tries
- NO complex algorithms like dynamic programming, backtracking, Dijkstra
- Language must be simple, friendly and encouraging
- Each question must be directly about ${role} work at ${company}
- The example questions above show the EXACT difficulty level required

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
// ── EVALUATE ANSWERS ─────────────────────────────────────────────
exports.evaluateAnswers = async (req, res) => {
  const { role, company, category, answers } = req.body;
  console.log('evaluateAnswers called:', { role, company, category, count: answers?.length });

  const qaText = answers.map((a, i) =>
    `Q${i + 1}: ${a.question}\nAnswer: ${a.answer || 'No answer given'}`
  ).join('\n\n');

  try {
    let guidelines = '';

    if (category === 'HR') {
      guidelines = `
Evaluation guidelines for FRESHER HR interview:
- Be encouraging and supportive — this is a fresher
- For strength question: check if they gave a real example from college or any activity
- For weakness question: check self-awareness and genuine improvement plan
- Do not expect corporate experience — college projects are valid
- Reward honesty, enthusiasm, and willingness to learn`;

    } else if (category === 'Sales') {
      guidelines = `
Evaluation guidelines for FRESHER Sales interview:
- Be encouraging — this candidate is new to sales
- For rejection handling: check empathy, persistence, logical approach
- For domain switch: check genuine enthusiasm and transferable skills
- Reward energy, positive attitude, customer-first thinking`;

  } else {
  guidelines = `
Evaluation guidelines for FRESHER technical interview:
- This is a fresher — be very encouraging and kind in all feedback
- For basic concept questions Q2, Q5, Q7, Q8: give full marks if they show basic understanding. Partial knowledge is absolutely fine and expected.
- For DSA logic question Q3: the question is very simple. Check only if their basic logical thinking is correct. A simple step-by-step approach is all that's needed. Do NOT expect algorithm complexity analysis.
- For SQL/database question Q4: the question is very simple. Check only if they understand basic data retrieval logic. Do NOT expect knowledge of joins or complex queries.
- For project question Q6: reward enthusiasm, clarity, and what they learned. Any college project counts.
- Score between 50-90 for reasonable answers — freshers should not get very low scores unless they gave no answer at all
- Give very encouraging, simple, and actionable feedback
- Ideal answers must be realistic for a fresher with basic knowledge`;
}

    const prompt = `You are a friendly and encouraging interviewer evaluating a FRESHER candidate for ${role} at ${company} (${category} category).

Remember: This person is a recent graduate or final year student. Evaluate with fresher standards.

${guidelines}

Analyze all 8 answers together as a complete interview performance.
Return ONLY valid JSON, no markdown, no backticks, no explanation outside JSON.

Interview Q&A:
${qaText}

Return exactly this JSON structure:
{
  "overallScore": <number 0-100>,
  "grade": "<A/B/C/D/F>",
  "overallFeedback": "<2-3 sentence honest overall summary of the candidate's performance in this interview>",

  "strongerSections": [
    "<point 1 — specific topic or skill where candidate performed well with reason>",
    "<point 2 — another strong area observed across their answers>",
    "<point 3 — optional third strength if clearly visible>"
  ],

  "weakerSections": [
    "<point 1 — specific topic or skill where candidate was weak with reason>",
    "<point 2 — another weak area observed>",
    "<point 3 — optional third weakness if clearly visible>"
  ],

  "improvementAreas": [
    {
      "topic": "<specific topic to improve e.g. JavaScript Closures, SQL Joins, React Hooks>",
      "priority": "<High / Medium / Low>",
      "suggestion": "<one specific actionable step the fresher can take to improve this — be practical and realistic>"
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
      "score": <number 0-100>,
      "feedback": "<2 sentence specific feedback on this answer>",
      "strength": "<what was good about this specific answer>",
      "improvement": "<one specific improvement for this answer>",
      "idealAnswer": "<simple realistic example of a good fresher answer>"
    }
  ]
}`;

    const text       = await askGroq(prompt);
    const cleaned    = text.replace(/```json|```/g, '').trim();
    const evaluation = JSON.parse(cleaned);

    console.log('Evaluation complete. Overall score:', evaluation.overallScore);
    res.json(evaluation);
  } catch (err) {
    console.error('Groq evaluation error:', err.message);
    res.status(500).json({ message: 'Failed to evaluate answers' });
  }
};