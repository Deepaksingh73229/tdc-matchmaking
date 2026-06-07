# The Hybrid Matchmaking Algorithm

The core engineering challenge of this assignment was developing a matchmaking algorithm that successfully captures the nuance of Indian matrimonial requirements. 

Simple database queries are too rigid, while pure AI/LLM comparisons are too slow and unpredictable. Therefore, this system utilizes a **Hybrid Architecture**: an initial Semantic Vector Search followed by a deterministic Rule-Based Scoring Engine.

---

## Step 1: Atlas Vector Search (Semantic Alignment)

Before specific rules are applied, the system needs a pool of highly relevant candidates.
When a profile is created, its narrative and background are embedded into a dense vector array (`profileEmbedding`). 

When searching for a match:
1. The database utilizes MongoDB Atlas `$vectorSearch`.
2. It calculates the **Cosine Similarity** between the target client's embedding and the rest of the database.
3. This step inherently handles "soft matching" (e.g., matching a "Software Engineer" with a "Data Scientist" because they are semantically close, even if the exact strings differ).
4. Atlas normalizes the output from a `[-1, 1]` range to a `[0, 1]` range using the formula: `(1 + cosineSimilarity) / 2`.
5. The top nearest neighbors are passed to the Scoring Engine.

---

## Step 2: The Rule-Based Scoring Engine

The candidates surfaced by the vector search are then run through the `calculateWeightedScore` function. This deterministic engine starts at a baseline of **0 points** and evaluates hard cultural and lifestyle vectors, accumulating points up to a maximum of 100.

### Point Distribution & Logic

#### 1. Location Alignment (+20 Points Max)
- **Same City**: +20 points.
- **Different City, but Open to Relocate**: +10 points. 
- *Penalty*: If different cities and neither is open to relocating, a soft penalty string is appended to the match review.

#### 2. Family Planning (+20 Points Max)
- **Exact Match** (e.g., both want kids, or both do not want kids): +20 points.
- **Flexible Match** (e.g., one wants kids, the other says "Maybe"): +10 points.
- *Penalty*: Direct conflict (Yes vs. No) results in 0 points and a heavy warning flagged for the Matchmaker.

#### 3. Religion & Caste (+15 Points Max)
*Highly important in the Indian matrimonial context.*
- **Same Religion**: +10 points.
- **Same Caste** (if provided): +5 points.

#### 4. Financial Compatibility (+10 Points)
The system calculates a ratio of the two incomes (`income_lpa`).
- If `Math.max(a, b) / Math.min(a, b) <= 2.5`, they are considered within a compatible bracket.
- If true: +10 points.

#### 5. Linguistic Overlap (+5 Points Max)
The system intersects the `languages` arrays of both clients.
- **Shared Languages**: +5 points if at least one language is shared.

#### 6. Lifestyle (Pets) (+5 Points Max)
- Both love pets, or one has pets and the other is "Open": +5 points.

#### 7. Marital Parity (+5 Points Max)
- If both share the exact same marital status (e.g., both Never Married, or both Divorced): +5 points.

---

## Step 3: Semantic Bonus Integration

To finalize the score, the system bridges the mathematical rule-engine with the semantic AI search.

The normalized vector score `[0, 1]` from Step 1 is multiplied by 20 to create a **Semantic Bonus** (up to +20 points). 

**Final Score Formula:**
```javascript
let blendedScore = Math.min(100, ruleBasedScore + semanticBonus);
```

### Result
This dual approach ensures that:
1. **Rule Score** handles absolute cultural dealbreakers.
2. **Semantic Bonus** rewards profiles that "feel" right and have highly aligned life narratives.
3. **Transparency**: The function returns human-readable `reasons[]` and `penalties[]` alongside the integer score, allowing the Matchmaker to see exactly *why* the algorithm generated a specific score.
