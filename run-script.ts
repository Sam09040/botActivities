const args = process.argv.slice(2);
const scriptFile = args[0];

if(!scriptFile){
    console.error("Please provide a script file to run");
    process.exit(1);
}

import(`./${scriptFile}`).catch((err) => {
    console.error("Error loading script: " + err);
    process.exit(1);
});