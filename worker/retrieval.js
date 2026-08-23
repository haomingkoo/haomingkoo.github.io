const STOP_WORDS = new Set([
  "about", "after", "also", "and", "are", "can", "does", "for", "from", "has", "have", "how", "into",
  "haoming", "its", "koo", "more", "that", "the", "their", "this", "what", "when", "where", "which", "who", "with",
]);

const SECTION_SOURCES = {
  overview: "https://kooexperience.com/",
  "primary-pages": "https://kooexperience.com/",
  "professional-positioning": "https://kooexperience.com/hire.html",
  "career-history": "https://kooexperience.com/about.html",
  education: "https://kooexperience.com/about.html",
  "citation-ready-facts": "https://kooexperience.com/about.html",
  "agent-use": "https://kooexperience.com/llms-full.txt",
  "public-safety-boundaries": "https://kooexperience.com/llms.txt",
  "professional-focus": "https://kooexperience.com/hire.html",
  "professional-keywords": "https://kooexperience.com/hire.html",
  "recruiter-quick-path": "https://kooexperience.com/hire.html",
  "role-fit-keywords": "https://kooexperience.com/hire.html",
  "selected-live-products": "https://kooexperience.com/#work",
  "selected-research-note": "https://kooexperience.com/blog/posts/what-i-learned-building-a-deep-research-pipeline-for-long-covid.html",
  "portfolio-guide": "https://kooexperience.com/llms.txt",
  contact: "https://kooexperience.com/#contact",
};

const INTENT_EXPANSIONS = [
  [["background", "career", "experience", "micron"], ["career", "history", "professional", "positioning"]],
  [["project", "projects", "product", "products", "built", "portfolio"], ["selected", "live", "products"]],
  [["skill", "skills", "stack", "technology", "technologies"], ["professional", "keywords"]],
  [["study", "studied", "degree", "degrees", "education", "university"], ["education", "nus"]],
  [["available", "availability", "hire", "hiring", "role"], ["professional", "positioning", "recruiter"]],
  [["amd", "aiap", "current", "currently", "employed", "employer", "now", "still", "work", "working"], ["career", "history", "professional", "positioning"]],
  [["chat", "guide", "grounded", "rag", "retrieval"], ["portfolio", "guide", "public", "safety"]],
  [["email", "contact", "linkedin", "github"], ["contact"]],
];

export function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function tokenize(value) {
  return value.toLowerCase().match(/[a-z0-9][a-z0-9+.-]*/g)
    ?.map((token) => token.replace(/[^a-z0-9+]+$/g, ""))
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token)) || [];
}

function sourceUrls(content, fallback) {
  const urls = [...content.matchAll(/https:\/\/[^\s)\]]+/g)].map(([url]) => url.replace(/[.,;]$/, ""));
  return [...new Set([fallback, ...urls].filter(Boolean))];
}

export function buildEvidenceIndex(markdown) {
  const sections = [];
  let current = { title: "Overview", lines: [] };

  for (const line of markdown.split("\n")) {
    const heading = line.match(/^##\s+(.+)/);
    if (heading) {
      if (current.lines.some((item) => item.trim())) sections.push(current);
      current = { title: heading[1].trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.some((item) => item.trim())) sections.push(current);

  return sections.flatMap(({ title, lines }) => {
    const id = slugify(title);
    const content = lines.join("\n").trim();

    if (id === "selected-live-products") {
      return content.split("\n").filter((line) => line.startsWith("- ")).map((line) => {
        const product = line.match(/^- \[([^\]]+)\]/)?.[1] || "Product";
        return {
          id: `${id}-${slugify(product)}`,
          title: product,
          content: line,
          sources: sourceUrls(line),
          tokens: tokenize(`${product} ${product} ${product} ${line}`),
        };
      });
    }

    return [{
      id,
      title,
      content,
      sources: sourceUrls(content, SECTION_SOURCES[id]),
      tokens: tokenize(`${title} ${title} ${title} ${content}`),
    }];
  });
}

function expandedQuery(question) {
  const terms = new Set(tokenize(question));
  for (const [triggers, additions] of INTENT_EXPANSIONS) {
    if (triggers.some((term) => terms.has(term))) additions.forEach((term) => terms.add(term));
  }
  return [...terms];
}

export function retrieveEvidence(question, markdown, limit = 4) {
  const documents = buildEvidenceIndex(markdown);
  const query = expandedQuery(question);
  if (!query.length) return [];

  const averageLength = documents.reduce((sum, document) => sum + document.tokens.length, 0) / Math.max(1, documents.length);
  const documentFrequency = new Map(query.map((term) => [term, documents.filter((document) => document.tokens.includes(term)).length]));

  const ranked = documents
    .map((document) => {
      const frequencies = new Map();
      document.tokens.forEach((term) => frequencies.set(term, (frequencies.get(term) || 0) + 1));
      const score = query.reduce((total, term) => {
        const frequency = frequencies.get(term) || 0;
        if (!frequency) return total;
        const seenIn = documentFrequency.get(term) || 0;
        const inverseFrequency = Math.log(1 + (documents.length - seenIn + .5) / (seenIn + .5));
        const normalizedFrequency = (frequency * 2.2) / (frequency + 1.2 * (.25 + .75 * document.tokens.length / averageLength));
        return total + inverseFrequency * normalizedFrequency;
      }, 0);
      return { ...document, score: Number(score.toFixed(4)) };
    })
    .filter((document) => document.score > 0)
    .sort((left, right) => right.score - left.score);

  if (!ranked.length) return [];
  const relevanceFloor = ranked[0].score * .45;
  return ranked.filter((document) => document.score >= relevanceFloor).slice(0, limit);
}

export function evidenceContext(results, maxCharacters = 9000) {
  let context = "";
  for (const result of results) {
    const block = `[EVIDENCE id="${result.id}" source="${result.sources[0]}"]\n${result.content}\n[/EVIDENCE]\n\n`;
    if (context.length + block.length > maxCharacters) break;
    context += block;
  }
  return context.trim();
}
