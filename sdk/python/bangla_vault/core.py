import json
import random
from pathlib import Path

class BanglaVault:
    def __init__(self, data_dir=None):
        if data_dir is None:
            base_path = Path(__file__).resolve().parent.parent.parent / "data"
        else:
            base_path = Path(data_dir)
        
        self.data_dir = base_path
        with open(base_path / "idioms.json", "r", encoding="utf-8") as f:
            self.idioms = json.load(f)
        with open(base_path / "proverbs.json", "r", encoding="utf-8") as f:
            self.proverbs = json.load(f)
        with open(base_path / "homophones.json", "r", encoding="utf-8") as f:
            self.homophones = json.load(f)
        with open(base_path / "one_word_substitutions.json", "r", encoding="utf-8") as f:
            self.substitutions = json.load(f)
        with open(base_path / "quiz_bank.json", "r", encoding="utf-8") as f:
            self.quiz_bank = json.load(f)

    def search(self, query: str):
        q = query.strip().lower()
        matched_idioms = [
            i for i in self.idioms
            if q in i["phrase"].lower() or q in i["meaning"].lower() or (i.get("english_equivalent") and q in i["english_equivalent"].lower())
        ]
        matched_proverbs = [
            p for p in self.proverbs
            if q in p["proverb"].lower() or q in p["meaning"].lower() or (p.get("english_proverb") and q in p["english_proverb"].lower())
        ]
        return {
            "query": query,
            "total_matches": len(matched_idioms) + len(matched_proverbs),
            "idioms": matched_idioms,
            "proverbs": matched_proverbs
        }

    def random_idiom(self):
        return random.choice(self.idioms)

    def random_proverb(self):
        return random.choice(self.proverbs)

    def random_quiz(self):
        return random.choice(self.quiz_bank)
