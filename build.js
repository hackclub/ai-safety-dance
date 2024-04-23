#!/usr/bin/env node

// Import shtuff
import * as fs from 'fs'; // for fs's sake
const __dirname = import.meta.dirname;
import markdownit from 'markdown-it';
import md_footnote from 'markdown-it-footnote';
const md = markdownit({
    html: true
}).use(md_footnote);

// For each of these files...
// Get the markdown, convert to HTML, insert it in the template & export
// (also make the Ankis)
let convertConfigs = [
    {
        markdown:'test/test.md', template:'templates/test_template.html', exportTo:'test/index.html',
        extras:{ foo:'there once', bar:'was a man', etc:'from nantucket' }
    },
    {
        markdown:'intro.md', template:'templates/page_template.html', exportTo:'index.html',
        extras:{
            title:'AI Safety for Fleshy Humans',
            root:''
        }
    },
    {
        markdown:'p1/p1.md', template:'templates/page_template.html', exportTo:'p1/index.html',
        extras:{
            title:'AI Safety for Fleshy Humans, Part 1: The Past, Present, and Possible Futures',
            root:'../'
        }
    }
];
convertConfigs.forEach((config)=>{
    // Get markdown
    fs.readFile( config.markdown, "utf-8", (err, markdown)=>{
        if(err){ console.log(err); }else{

            // Make Ankis

            // Get template
            fs.readFile( config.template, "utf-8", (err, template)=>{
                if(err){ console.log(err); }else{

                    // Convert MD => HTML & put in template
                    let convertedMD = md.render(markdown);
                    let html = template.replace("{{INSERT_CONTENT_HERE}}",convertedMD);

                    // Put all extra stuff in template
                    // Note: can put {{keys}} in the MARKDOWN too and it'll work!
                    if(config.extras){
                        for(const key in config.extras){
                            html = html.replaceAll(`{{${key}}}`, config.extras[key]);
                        }
                    }

                    // Write to a subfolder!
                    fs.writeFile( __dirname+'/'+config.exportTo, html, err=>{
                        if(err) console.error(err);
                        else console.log('Built '+config.markdown+'!');
                    });

                }
            });
        }
    });
});
