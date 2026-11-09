const fs = require("fs");
 
const personnes = JSON.parse(
fs.readFileSync("famille.json", "utf8")
);
 
const index = personnes
.filter(p => p.nom)
.map(p => {
 
const mots = p.nom.trim().split(" ");
const nom = (mots.pop() || "").toUpperCase();
 
return {
id: p.id,
nom: nom,
prenom: mots.join(" ").trim(),
nomComplet: p.nom,
naissance: p.naissance,
deces: p.deces,
fid: p.fid,
mid: p.mid
};
 
})
.sort((a, b) =>
a.nom.localeCompare(b.nom, "fr") ||
a.prenom.localeCompare(b.prenom, "fr")
);
 
fs.writeFileSync(
"index.json",
JSON.stringify(index, null, 2),
"utf8"
);
 
const patronymes = {};
 
index.forEach(personne => {
 
if (!patronymes[personne.nom]) {
patronymes[personne.nom] = 0;
}
 
patronymes[personne.nom]++;
 
});
 
const indexPatronymes = Object.entries(patronymes)
.map(([nom, nombre]) => ({
nom,
nombre
}))
.sort((a, b) =>
a.nom.localeCompare(b.nom, "fr")
);
 
fs.writeFileSync(
"index-patronymes.json",
JSON.stringify(indexPatronymes, null, 2),
"utf8"
);
 
console.log(`${index.length} personnes indexées`);
3. .github/workflows/maj-index.yml
YAML
name: Mise à jour index généalogique
 
on:
push:
paths:
- "famille.ged"
 
jobs:
build:
runs-on: ubuntu-latest
 
steps:
- uses: actions/checkout@v4
 
- name: Installation Node
uses: actions/setup-node@v4
with:
node-version: 20
 
- name: Conversion GEDCOM
run: node convert-gedcom.js
 
- name: Génération index
run: node generate-index.js
