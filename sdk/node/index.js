const idioms = require("../../data/idioms.json");
const proverbs = require("../../data/proverbs.json");
const homophones = require("../../data/homophones.json");
const substitutions = require("../../data/one_word_substitutions.json");
const quizBank = require("../../data/quiz_bank.json");
const summary = require("../../data/summary.json");

class BanglaVault {
  constructor() {
    this.idioms = idioms;
    this.proverbs = proverbs;
    this.homophones = homophones;
    this.substitutions = substitutions;
    this.quizBank = quizBank;
    this.summary = summary;
  }

  // Search across all modules
  search(query) {
    if (!query) return [];
    const q = query.trim().toLowerCase();
    
    const matchedIdioms = this.idioms.filter(i => 
      i.phrase.toLowerCase().includes(q) || 
      i.meaning.toLowerCase().includes(q) || 
      (i.english_equivalent && i.english_equivalent.toLowerCase().includes(q))
    ).map(i => ({ type: "idiom", ...i }));

    const matchedProverbs = this.proverbs.filter(p =>
      p.proverb.toLowerCase().includes(q) ||
      p.meaning.toLowerCase().includes(q) ||
      (p.english_proverb && p.english_proverb.toLowerCase().includes(q))
    ).map(p => ({ type: "proverb", ...p }));

    const matchedHomophones = this.homophones.filter(h =>
      h.pair_title.toLowerCase().includes(q) ||
      h.words.some(w => w.word.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q))
    ).map(h => ({ type: "homophone", ...h }));

    const matchedSubstitutions = this.substitutions.filter(s =>
      s.phrase.toLowerCase().includes(q) ||
      s.substitution.toLowerCase().includes(q)
    ).map(s => ({ type: "substitution", ...s }));

    return {
      query,
      total: matchedIdioms.length + matchedProverbs.length + matchedHomophones.length + matchedSubstitutions.length,
      idioms: matchedIdioms,
      proverbs: matchedProverbs,
      homophones: matchedHomophones,
      substitutions: matchedSubstitutions
    };
  }

  getRandomIdiom() {
    return this.idioms[Math.floor(Math.random() * this.idioms.length)];
  }

  getRandomProverb() {
    return this.proverbs[Math.floor(Math.random() * this.proverbs.length)];
  }

  getRandomQuizQuestion() {
    return this.quizBank[Math.floor(Math.random() * this.quizBank.length)];
  }

  getStats() {
    return this.summary.metrics;
  }
}

module.exports = new BanglaVault();
