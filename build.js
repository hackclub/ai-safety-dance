#!/usr/bin/env node

// Import shtuff
import * as fs from 'fs'; // for fs's sake
const __dirname = import.meta.dirname;
import markdownit from 'markdown-it';
import md_footnote from 'markdown-it-footnote';
const md = markdownit({
    html: true
}).use(md_footnote);
import nunjucks from 'nunjucks';
nunjucks.configure({ autoescape:false });

// For each of these files...
// Get the markdown, convert to HTML, render it in template w Nunjucks & export
let convertConfigs = [
    {
        markdown:'test/test.md', template:'templates/test_template.html', exportTo:'test/index.html',
        extras:{
            foo:'there once!',
            bar:'was a man...',
            etc:'from nantucket?'
        }
    },
    {
        markdown:'intro.md', template:'templates/page_template.html', exportTo:'index.html',
        extras:{
            title:'[DRAFT, DO NOT PUBLICLY SHARE]', //AI Safety for Fleshy Humans',
            share_desc: 'TODO',
            share_image: 'TODO',
            root:'',

            isFrontpage: true
        }
    },
    {
        markdown:'p1/p1.md', template:'templates/page_template.html', exportTo:'p1/index.html',
        extras:{
            title:'[DRAFT, DO NOT PUBLICLY SHARE]', //AI Safety for Fleshy Humans, Part 1: The Past, Present, and Possible Futures',
            root:'../',

            isPartOne: true
        }
    }
];
convertConfigs.forEach((config)=>{
    // Get markdown
    fs.readFile( config.markdown, "utf-8", (err, markdown)=>{
        if(err){ console.log(err); }else{

            // Get template
            fs.readFile( config.template, "utf-8", (err, template)=>{
                if(err){ console.log(err); }else{

                    // Convert MD => HTML
                    let renderedHTML = md.render(markdown);

                    // Render any Nunjucks *inside* the markdown...
                    let data = config.extras || {};
                    renderedHTML = nunjucks.renderString(renderedHTML, data);

                    // Render in template with Nunjucks
                    data.content = renderedHTML;
                    let html = nunjucks.render(config.template, data);

                    // Write out!
                    fs.writeFile( __dirname+'/'+config.exportTo, html, err=>{
                        if(err) console.error(err);
                        else console.log('Built '+config.markdown+'!');
                    });

                }
            });
        }
    });
});
