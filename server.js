const fs = require("fs");
const NodeCache = require("node-cache");
const myCache = new NodeCache();
const express = require("express");
const app = express();

app.listen(process.env.PORT || 8000);

app.get("/anagram", (req, res) => {
    res.send(anagram(req.query.word));
});

function readFile() {
    return fs
        .readFileSync("words.txt")
        .toString()
        .split("\n");
}

const HASH = myCache.get("dict") ? myCache.get("dict") : wordHash();

function wordHash() {
    let hash = {};
    const dict = readFile();
    dict.forEach(word => {
        if (!hash[wordSorter(word)]) {
            hash[wordSorter(word)] = word;
        }
    });
    myCache.set("dict", hash, 1000);
    return hash;
}

function anagram(word) {
    let anagrams = [];
    let twoWords = [];

    const sortedWord = wordSorter(word);

    for (const key of Object.keys(HASH)) {
        let wordDict = containsWord(sortedWord, key);

        if (wordDict) {
            anagrams.push(HASH[key]);
            let secondWord = HASH[wordDict.remainingWord];
            if (secondWord && !twoWords.length) {
                twoWords.push(wordDict.comparedWord, secondWord);
            }
        }
    }

    return anagrams.length || twoWords.length
        ? { anagrams, twoWords }
        : { message: "Sorry Charlie" };
}

function containsWord(word, sub) {
    let curWord = word.split("");
    let compareWord = sub.split("");

    let match = true;

    while (match) {
        match = false;

        if (!compareWord.length) {
            return {
                comparedWord: HASH[sub],
                remainingWord: curWord.join("")
            };
        }

        if (!curWord.length) {
            return false;
        }

        let compIdx = curWord.indexOf(compareWord[0]);

        if (compIdx > -1) {
            match = true;
            compareWord.shift();
            curWord.splice(compIdx, 1);
        } else {
            return false;
        }
    }
}

function wordSorter(word) {
    return word
        .toLowerCase()
        .split("")
        .sort()
        .join("");
}

module.exports = app;
