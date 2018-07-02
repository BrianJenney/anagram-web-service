process.env.NODE_ENV = "test";

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");
let should = chai.should();

chai.use(chaiHttp);

describe("/GET anagram", () => {
    let tests = [
        //word          expected
        ["kissableking", ["bleak", "kissing"]],
        ["judoking", ["judo", "king"]]
    ];

    for (let test of tests) {
        it("it should return an anagram", done => {
            [word, expected] = test;
            chai.request(server)
                .get(`/anagram?word=${word}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.twoWords.should.be.eql(expected);
                    done();
                });
        });
    }

    it("it should return longest anagram", done => {
        const word = "bewildered";
        chai.request(server)
            .get(`/anagram?word=${word}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.anagrams.should.be.eql(["drew", "lid", "be", "e"]);
                done();
            });
    });

    it("it should return a fales success property", done => {
        chai.request(server)
            .get("/anagram?word=asdf")
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.eql({
                    anagrams: [],
                    success: false,
                    twoWords: []
                });
                done();
            });
    });
});
