const fs = require("fs");
const NodeCache = require("node-cache");
const myCache = new NodeCache();
const express = require("express");
const app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.listen(process.env.PORT || 8000);

app.get("/anagram", (req, res) => {
    res.send(anagram(req.query.word.toLowerCase()));
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

    solutions = [];

    const multiAnagram = longestAnagram(anagrams, sortedWord, 1000);

    if (multiAnagram.length) {
        anagrams = multiAnagram.reduce(function(a, b) {
            return a.length > b.length ? a : b;
        });
    } else {
        anagrams = [];
    }

    return anagrams.length || twoWords.length
        ? { anagrams, twoWords, success: true }
        : { anagrams, twoWords, success: false };
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

let solutions = [];

function longestAnagram(words, target, iterations, partial) {
    let s, n, remaining;

    if (iterations < 2) {
        return;
    }

    partial = partial || [];

    s = partial.reduce(function(a, b) {
        return a + b.length;
    }, 0);

    if (s === target.length) {
        let sortedWord = partial
            .join("")
            .split("")
            .sort()
            .join("");

        if (sortedWord === target) {
            solutions.push(partial);
        }
    }

    if (s >= target.length) {
        return;
    }

    for (let i = 0; i < words.length; i++) {
        n = words[i];
        remaining = words.slice(i + 1);
        iterations--;
        longestAnagram(remaining, target, iterations, partial.concat([n]));
    }

    return solutions;
}

module.exports = app;
