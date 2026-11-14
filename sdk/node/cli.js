#!/usr/bin/env node
const vault = require("./index.js");

const args = process.argv.slice(2);
const command = args[0] ? args[0].toLowerCase() : "help";

console.log("\n📖 Bangla Idioms & Proverbs Vault CLI\n========================================");

if (command === "search" || command === "s") {
  const query = args.slice(1).join(" ");
  if (!query) {
    console.log("ব্যবহার: npx bangla-vault search <শব্দ/অর্থ>");
    process.exit(1);
  }
  const res = vault.search(query);
  console.log(`🔍 '${query}' অনুসন্ধানের ফলাফল (মোট ${res.total} টি):\n`);

  if (res.idioms.length > 0) {
    console.log(`💎 বাগধারা (${res.idioms.length}):`);
    res.idioms.forEach((i, idx) => {
      console.log(`  ${idx + 1}. ${i.phrase} ➔ অর্থ: ${i.meaning}`);
      console.log(`     বাক্য: ${i.sentence}`);
      if (i.english_equivalent) console.log(`     ইংরেজি: ${i.english_equivalent}`);
    });
    console.log("");
  }

  if (res.proverbs.length > 0) {
    console.log(`📜 প্রবাদ-প্রবচন (${res.proverbs.length}):`);
    res.proverbs.forEach((p, idx) => {
      console.log(`  ${idx + 1}. ${p.proverb}`);
      console.log(`     ভাবার্থ: ${p.meaning}`);
      if (p.english_proverb) console.log(`     ইংরেজি প্রবাদ: ${p.english_proverb}`);
    });
    console.log("");
  }

  if (res.homophones.length > 0) {
    console.log(`⚖️ সমোচ্চারিত শব্দ (${res.homophones.length}):`);
    res.homophones.forEach((h, idx) => {
      console.log(`  ${idx + 1}. ${h.pair_title}`);
      h.words.forEach(w => console.log(`     • ${w.word}: ${w.meaning} ("${w.sentence}")`));
    });
    console.log("");
  }

  if (res.substitutions.length > 0) {
    console.log(`✂️ এক কথায় প্রকাশ (${res.substitutions.length}):`);
    res.substitutions.forEach((s, idx) => {
      console.log(`  ${idx + 1}. ${s.phrase} ➔ ${s.substitution}`);
    });
  }

} else if (command === "random" || command === "r") {
  const idiom = vault.getRandomIdiom();
  const proverb = vault.getRandomProverb();
  console.log("🎲 দৈবচয়ন (Random Pick):\n");
  console.log(`💎 বাগধারা: ${idiom.phrase}`);
  console.log(`   অর্থ: ${idiom.meaning}`);
  console.log(`   বাক্য: ${idiom.sentence}\n`);
  console.log(`📜 প্রবাদ: ${proverb.proverb}`);
  console.log(`   ভাবার্থ: ${proverb.meaning}`);
  if (proverb.english_proverb) console.log(`   ইংরেজি: ${proverb.english_proverb}`);

} else if (command === "stats") {
  console.log("📊 ডেটাসেট পরিসংখ্যান:");
  console.log(vault.getStats());

} else {
  console.log("ব্যবহারবিধি (Commands):");
  console.log("  search <শব্দ>   - যেকোনো বাংলা শব্দ বা অর্থ দিয়ে খুঁজুন");
  console.log("  random         - একটি দৈবচয়ন বাগধারা ও প্রবাদ দেখুন");
  console.log("  stats          - ডেটাসেটের মোট পরিসংখ্যান দেখুন\n");
}
