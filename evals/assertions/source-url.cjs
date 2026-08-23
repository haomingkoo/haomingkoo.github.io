module.exports = (_output, context) => {
  const expected = context.config.url;
  const sources = context.metadata?.sources || [];
  const pass = sources.some(({ url }) => url === expected || url.startsWith(expected));
  return {
    pass,
    score: pass ? 1 : 0,
    reason: pass ? `Returned ${expected}` : `Expected ${expected}; received ${sources.map(({ url }) => url).join(", ") || "no sources"}`,
  };
};
