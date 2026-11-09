const fs = require("fs");

const gedcom = fs.readFileSync("famille.ged", "utf8");

const lignes = gedcom.split(/\r?\n/);

const personnes = [];

let personne = null;

for (const ligne of lignes) {

    const indi = ligne.match(/^0 @([^@]+)@ INDI$/);

    if (indi) {

        if (personne) personnes.push(personne);

        personne = {
            id: indi[1],
            nom: "",
            naissance: null,
            deces: null,
            fid: null,
            mid: null
        };

        continue;
    }

    if (!personne) continue;

    if (ligne.includes("1 NAME")) {

        let nom = ligne
            .replace("1 NAME", "")
            .replace(/\//g, "")
            .trim();

        personne.nom = nom;
    }

    if (ligne.includes("1 BIRT")) {
        personne._birt = true;
        personne._deat = false;
    }

    if (ligne.includes("1 DEAT")) {
        personne._deat = true;
        personne._birt = false;
    }

    if (ligne.includes("2 DATE")) {

        const annee = ligne.match(/(\d{4})/);

        if (annee) {

            if (personne._birt) {
                personne.naissance = parseInt(annee[1]);
            }

            if (personne._deat) {
                personne.deces = parseInt(annee[1]);
            }
        }
    }
}

if (personne) personnes.push(personne);

fs.writeFileSync(
    "famille.json",
    JSON.stringify(personnes, null, 2),
    "utf8"
);

console.log(`${personnes.length} 
