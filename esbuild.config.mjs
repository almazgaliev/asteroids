import * as esbuild from 'esbuild';

let devBuild = false;

await esbuild.build({
  entryPoints: ['src/main.js', 'src/main.css', 'src/index.html'],
  bundle: true,
  minify: !devBuild,
  sourcemap: devBuild,
  target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
  loader: { '.html': 'copy' },
  outdir: 'dist/es' + (devBuild ? '/dev' : '/prod'),
});