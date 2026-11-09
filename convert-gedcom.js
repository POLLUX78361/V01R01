const fs = require("fs");

const ged = fs.readFileSync("famille.ged", "utf8");

const lignes = ged.split(/\r?\n/);

const personnes = [];

let personne = null;
let contexte = "";

for (const ligne of lignes) {

    const m = ligne.match(/^0 @([^@]+)@ INDI$/);

    if (m) {

        if (personne) {
            personnes.push(personne);
        }

        personne = {
            id: m[1],

            nom: "",

            sexe: "",

            naissance: {
                date: null,
                lieu: null
            },

            deces: {
                date: null,
                lieu: null
            },

            familles: []
        };

        contexte = "";
        continue;
    }

    if (!personne) continue;

    if (ligne.startsWith("1 NAME")) {

        personne.nom = ligne
            .replace("1 NAME", "")
            .replace(/\//g, "")
            .trim();
    }

    else if (ligne.startsWith("1 SEX")) {

        personne.sexe = ligne
            .replace("1 SEX", "")
            .trim();
    }

    else if (ligne.startsWith("1 BIRT")) {

        contexte = "BIRT";
    }

    else if (ligne.startsWith("1 DEAT")) {

        contexte = "DEAT";
    }

    else if (ligne.startsWith("1 FAMS")) {

        const fam = ligne.match(/@([^@]+)@/);

        if (fam) {
            personne.familles.push(fam[1]);
        }
    }

    else if (ligne.startsWith("2 DATE")) {

        const date = ligne
            .replace("2 DATE", "")
            .trim();

        if (contexte === "BIRT") {
            personne.naissance.date = date;
        }

        if (contexte === "DEAT") {
            personne.deces.date = date;
        }
    }

    else if (ligne.startsWith("2 PLAC")) {

        const lieu = ligne
            .replace("2 PLAC", "")
            .trim();

        if (contexte === "BIRT") {
            personne.naissance.lieu = lieu;
        }

        if (contexte === "DEAT") {
            personne.deces.lieu = lieu;
        }
    }
}

if (personne) {
    personnes.push(personne);
}

fs.writeFileSync(
    "famille.json",
    JSON.stringify(personnes, null, 2),
    "utf8"
);

console.log(
    `${personnes.length} individus convertis`
);
