#!/usr/bin/env node

// Import shtuff
import * as fs from 'fs'; // for fs's sake
const __dirname = import.meta.dirname;
import parse from 'html-dom-parser';
import markdownit from 'markdown-it';
const md = markdownit();

// Should pass filepath as argument
if(process.argv.length != 4){
    console.error('Ay, pass input & output filepaths as arguments!');
    process.exit(1);
}
const inputFilepath = process.argv[2];
const outputFilepath = process.argv[3];

// Get the MD/HTML, convert to CSV for Anki (with image if need be)
fs.readFile( inputFilepath, "utf-8", (err, input)=>{
    if(err){ console.log(err); }else{

        let ankiLines = [];

        // 1) Find each instance of <orbit-reviewarea>,
        const regexp = /<orbit-reviewarea(\n|.)*?<\/orbit-reviewarea>/g
        const orbitReviews = [...input.matchAll(regexp)];

        // 2) For each, parse into DOM,
        orbitReviews.forEach( (orbitReview)=>{

            let dom = parse(orbitReview[0]); // the whole string

            // 3) Then for each <orbit-prompt>, make a row "Question";"Answer"
            dom[0].children.forEach( (child)=>{
                if(child.type=='tag' && child.name=='orbit-prompt'){

                    let ankiCSVLine;
                    let q = md.render(child.attribs.question).trim(); // md'ified!
                    let a = md.render(child.attribs.answer).trim(); // md'ified!

                    // 4) and append anki-image=".*" as <br><img> if present
                    if(child.attribs['answer-attachments']){
                        let comment = child.children.filter(c=>c.type=='comment')[0].data;
                        let img = comment.trim();
                        ankiCSVLine = `"${q}";"${a}<img src='${img}'>"`;
                    }else{
                        ankiCSVLine = `"${q}";"${a}"`; // otherwise, normal
                    }

                    ankiLines.push(ankiCSVLine);
                }
            });

        });

        // 5) Write out CSV!
        let ankiCSV = ankiLines.join("\n");
        fs.writeFile( __dirname+'/'+outputFilepath, ankiCSV, err=>{
            if(err) console.error(err);
            else console.log('Converted Orbits at '+inputFilepath+' to Ankis at '+outputFilepath+'!');
        });

    }
});