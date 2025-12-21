
import fs from 'fs';
const userscriptMetatags = fs.readFileSync('userscript-metatags.js', 'utf8');

export default {
  input: 'build/index.js',
  output: {
    file: 'dist/fmp-stadium-planner.js',
    format: 'iife',
    banner: userscriptMetatags,
    name: 'FMPStadiumPlanner'
  },
  plugins: []
};
