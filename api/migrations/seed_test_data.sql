-- IB Companion — Test / Seed Data
-- Apply with: npm run db:seed  (local only, never run on production)
--
-- Test accounts (password for all is: TestPassword123!)
-- Password hash below = PBKDF2-SHA256(TestPassword123!) with a fixed salt for reproducibility
-- The app uses real PBKDF2 hashing; these hashes are pre-computed test fixtures.
--
-- Quicker option: just register via the UI at http://localhost:3000/register

-- ─── Wipe existing test data ────────────────────────────────────────────────
DELETE FROM quiz_attempts     WHERE user_id IN ('test_free_user', 'test_pro_user');
DELETE FROM ia_plans          WHERE user_id IN ('test_free_user', 'test_pro_user');
DELETE FROM practice_sessions WHERE user_id IN ('test_free_user', 'test_pro_user');
DELETE FROM flashcards        WHERE deck_id IN (SELECT id FROM flashcard_decks WHERE user_id IN ('test_free_user', 'test_pro_user'));
DELETE FROM flashcard_decks   WHERE user_id IN ('test_free_user', 'test_pro_user');
DELETE FROM question_help     WHERE user_id IN ('test_free_user', 'test_pro_user');
DELETE FROM essays            WHERE user_id IN ('test_free_user', 'test_pro_user');
DELETE FROM sessions          WHERE user_id IN ('test_free_user', 'test_pro_user');
DELETE FROM users             WHERE id      IN ('test_free_user', 'test_pro_user');

-- ─── Test users ─────────────────────────────────────────────────────────────
-- Both use password: TestPassword123!
-- These are PBKDF2 hashes — to log in use the /register UI or /api/auth/register endpoint
-- The seed script (npm run db:seed) creates a proper hash via the API
INSERT INTO users (id, email, name, password_hash, plan, queries_today, queries_reset_at)
VALUES
  ('test_free_user', 'free@test.ib', 'Free Student',
   'PLACEHOLDER_HASH',
   'free', 0, datetime('now')),
  ('test_pro_user',  'pro@test.ib',  'Pro Student',
   'PLACEHOLDER_HASH',
   'pro',  0, datetime('now'));

-- ─── Sample essay with AI feedback ──────────────────────────────────────────
INSERT INTO essays (id, user_id, title, content, type, subject, feedback, analyzed_at)
VALUES (
  'essay_sample_tok',
  'test_free_user',
  'TOK Essay — Does reason override emotion in ethical decision-making?',
  'To what extent does reason override emotion in ethical decision-making? This knowledge question sits at the intersection of two powerful ways of knowing: reason and emotion. In exploring this question across the areas of knowledge of the Natural Sciences and Ethics, I will argue that while reason provides a framework for ethical thinking, emotion is not merely a hindrance but an essential component of moral judgment. Neuroscientist Antonio Damasio demonstrated through the case of Phineas Gage that patients with damage to the ventromedial prefrontal cortex, while retaining logical reasoning abilities, struggle to make sound moral decisions, suggesting that emotion is neurologically integral to ethical cognition. However, Peter Singer''s utilitarian framework demonstrates that reason can override immediate emotional responses — as in his ''drowning child'' argument — to produce more consistent and impartial moral conclusions. The tension between these perspectives reveals that the dichotomy between reason and emotion in ethics is a false one.',
  'tok',
  'Theory of Knowledge',
  json('{"overall_score":72,"grade_estimate":"B","summary":"A competent TOK essay that engages well with the prescribed title and uses relevant examples. The essay demonstrates understanding of the knowledge question but would benefit from deeper analysis of implications and more explicit connections between Areas of Knowledge.","criteria":[{"name":"Criterion A: Understanding of Knowledge Questions","description":"Does the essay identify genuine, contestable knowledge questions?","score":7,"max_score":10,"strengths":["Knowledge question is clearly stated and genuinely contestable","Links to relevant Areas of Knowledge (Natural Sciences and Ethics)"],"weaknesses":["The KQ could be more sharply focused — consider specifying the context"],"suggestions":["Refine the knowledge question to include a specific scope or domain"]},{"name":"Criterion B: Quality of Analysis","description":"Are arguments developed with clarity and rigour?","score":8,"max_score":10,"strengths":["Damasio case study is well integrated and relevant","Counter-argument from Singer is presented fairly"],"weaknesses":["The conclusion feels rushed — the ''false dichotomy'' point needs more development"],"suggestions":["Develop the conclusion by exploring what an integrated emotion-reason model looks like"]},{"name":"Criterion C: Quality and Breadth of Examples","description":"Are examples specific, real-world, and effectively integrated?","score":7,"max_score":10,"strengths":["Phineas Gage is a specific, well-known example in neuroscience","Peter Singer''s argument is accurately represented"],"weaknesses":["Only two examples — a third from a different AoK would strengthen breadth"],"suggestions":["Add an example from Arts or History to demonstrate cross-AoK breadth"]}],"strengths":["Clear structure with well-developed paragraphs","Good use of specific academic sources (Damasio, Singer)","The central tension is identified and maintained throughout"],"weaknesses":["Lacks a third Area of Knowledge for breadth","Conclusion does not fully resolve the tension","Some claims made without sufficient justification"],"improvement_suggestions":["Add a third AoK example (e.g. from History or Arts)","Develop the conclusion to offer a nuanced resolution, not just labelling it a false dichotomy","Justify the claim that emotion is ''essential'' with more than one piece of evidence"],"next_steps":["Draft a paragraph exploring the role of emotion in historical moral progress (e.g. abolition of slavery)","Revise the conclusion to articulate what a balanced emotion-reason model looks like in practice","Have a classmate read for clarity of argument flow"]}'),
  datetime('now', '-2 days')
);

-- ─── Sample flashcard deck ───────────────────────────────────────────────────
INSERT INTO flashcard_decks (id, user_id, title, subject, card_count)
VALUES ('deck_bio_sample', 'test_free_user', 'Biology HL — Cell Biology', 'Biology', 5);

INSERT INTO flashcards (id, deck_id, front, back, repetitions, ease_factor, interval_days, next_review_at)
VALUES
  ('card_1', 'deck_bio_sample', 'What is the fluid mosaic model?',
   'A model describing the plasma membrane as a fluid phospholipid bilayer with proteins embedded throughout, able to move laterally (mosaic of proteins in a fluid lipid sea). Proposed by Singer and Nicolson (1972).',
   1, 2.5, 1, datetime('now')),
  ('card_2', 'deck_bio_sample', 'Define osmosis',
   'The passive movement of water molecules from a region of lower solute concentration (higher water potential) to a region of higher solute concentration (lower water potential) across a selectively permeable membrane.',
   0, 2.5, 1, datetime('now')),
  ('card_3', 'deck_bio_sample', 'What is the function of the mitochondrial cristae?',
   'Cristae are the inner folds of the mitochondrial membrane. They increase the surface area for oxidative phosphorylation, where ATP synthase and the electron transport chain are located.',
   2, 2.6, 3, datetime('now', '+3 days')),
  ('card_4', 'deck_bio_sample', 'Difference between active and passive transport?',
   'Passive transport (diffusion, osmosis, facilitated diffusion) moves substances down a concentration gradient — no ATP required. Active transport moves substances against a concentration gradient using ATP (e.g. sodium-potassium pump).',
   0, 2.5, 1, datetime('now', '+1 day')),
  ('card_5', 'deck_bio_sample', 'What are tight junctions?',
   'Protein structures between adjacent epithelial cells that prevent the passage of molecules through the space between cells (paracellular route), forcing transport through cells instead. Important in gut epithelium.',
   3, 2.7, 7, datetime('now', '+7 days'));

-- ─── Sample IA plan ──────────────────────────────────────────────────────────
INSERT INTO ia_plans (id, user_id, subject, topic, research_question, plan_data, status)
VALUES (
  'ia_sample_bio',
  'test_free_user',
  'Biology',
  'Effect of temperature on enzyme activity',
  'How does temperature (10°C, 20°C, 30°C, 40°C, 50°C) affect the rate of catalase activity in potato (Solanum tuberosum) tissue, as measured by the volume of O₂ produced per minute?',
  json('{"research_questions":[{"question":"How does temperature (10°C–50°C) affect the rate of catalase activity in potato tissue, as measured by O₂ production per minute?","rationale":"Focused, measurable, and achievable with school equipment. Uses a clear independent variable (temperature) with discrete values and an objective dependent variable (gas volume).","feasibility":"high"}],"methodology_options":[{"method":"Gas syringe / graduated cylinder","description":"Collect O₂ produced by hydrogen peroxide breakdown by catalase in potato discs at controlled temperatures. Measure volume of gas collected per minute.","advantages":["Objective measurement","Reproducible","Standard school lab equipment"],"limitations":["Gas may dissolve in water at low temperatures","Difficult to maintain exact temperature without water bath"]}],"data_collection":[{"method":"Gas volume measurement","description":"Use a gas syringe connected to a conical flask. Record volume of O₂ every 30 seconds for 3 minutes.","sample_size_suggestion":"5 replicates per temperature point (5 temperatures = 25 trials total)","ethical_considerations":["Use of plant tissue only — no animal ethics required","Dispose of H2O2 safely as per COSHH guidelines"]}],"timeline_suggestion":[{"phase":"Planning","duration":"1 week","tasks":["Write research question","Outline methodology","Risk assessment"]},{"phase":"Data collection","duration":"2 weeks","tasks":["Prepare potato discs","Run trials at each temperature","Record raw data"]},{"phase":"Analysis","duration":"1 week","tasks":["Process data","Plot graphs","Calculate rate"]},{"phase":"Write-up","duration":"1 week","tasks":["Draft IA","Get peer feedback","Submit"]}],"ib_alignment_notes":"This IA aligns with Biology HL criteria: Research Design (controlled variables, method), Data Collection (raw data table, uncertainty), Conclusion & Evaluation (link to enzyme kinetics theory, Q10 concept).","subject_specific_tips":["Quote the Michaelis-Menten model in your conclusion","Discuss activation energy and how temperature affects it","Include error bars on your graph"]}'),
  'active'
);

-- ─── Sample practice session ─────────────────────────────────────────────────
INSERT INTO practice_sessions (id, user_id, type, subject, title, messages, score, status)
VALUES (
  'session_sample_oral',
  'test_free_user',
  'oral',
  'English A Literature',
  'IO Practice — The Great Gatsby',
  json('[{"role":"assistant","content":"Welcome to your Individual Oral practice for English A Literature. I will act as your examiner today. Please begin by introducing your chosen text and the global issue you will explore, then give a brief overview of how your literary extract connects to this issue.","timestamp":"2026-03-15T10:00:00Z"},{"role":"user","content":"Thank you. I have chosen The Great Gatsby by F. Scott Fitzgerald. The global issue I am exploring is the conflict between individual aspiration and social reality in the context of the American Dream. My extract is from Chapter 5, when Gatsby and Daisy are reunited at Nick''s house. I want to argue that Fitzgerald uses this scene to expose the hollow nature of Gatsby''s dream — the object of his aspiration is finally within reach, yet the moment is marked by anti-climax and disillusionment.","timestamp":"2026-03-15T10:01:00Z"},{"role":"assistant","content":"Thank you — that is a well-focused introduction. The connection between Chapter 5 and the disillusionment of the American Dream is a rich area. Can you take me to a specific moment in the extract and analyse how Fitzgerald''s language choices convey this hollow quality you mention? What literary technique does he use most effectively in this passage?","timestamp":"2026-03-15T10:01:30Z"}]'),
  68,
  'completed'
);
