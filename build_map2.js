const fs = require('fs');
const filepath = '/Users/m1pro/Desktop/Aprendizaje/UCR/Multimedios/project/Proyecto-Guia-Turistica/antigravity/resources/mapa-interactivo-cr (1).html';
const outpath = '/Users/m1pro/Desktop/Aprendizaje/UCR/Multimedios/project/Proyecto-Guia-Turistica/components/interactive-map.js';

try {
  let content = fs.readFileSync(filepath, 'utf8');
  let start = content.indexOf('class MapaCostaRica');
  let end = content.indexOf('</script>', start);
  
  if (start !== -1 && end !== -1) {
    let js = content.substring(start, end);
    fs.writeFileSync(outpath, js, 'utf8');
    fs.writeFileSync('/Users/m1pro/Desktop/Aprendizaje/UCR/Multimedios/project/Proyecto-Guia-Turistica/success.txt', 'OK');
  } else {
    fs.writeFileSync('/Users/m1pro/Desktop/Aprendizaje/UCR/Multimedios/project/Proyecto-Guia-Turistica/success.txt', 'NO MATCH');
  }
} catch (e) {
  fs.writeFileSync('/Users/m1pro/Desktop/Aprendizaje/UCR/Multimedios/project/Proyecto-Guia-Turistica/success.txt', e.toString());
}
