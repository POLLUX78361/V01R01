console.log("VERSION TEST 10/11/2026");

const fs = require("fs");

const ged = fs.readFileSync("famille.ged", "utf8");
const lignes = ged.split(/\r?\n/);

const personnes = [];
const familles = [];

let personne = null;
let famille = null;
let contexte = "";

/* ==========================
   PARSING GEDCOM
========================== */

for (const ligne of lignes) {

    let m = ligne.match(/^0 @([^@]+)@ INDI$/);

    if (m) {

        if (personne) personnes.push(personne);
        if (famille) familles.push(famille);

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

        famille = null;
        contexte = "";
        continue;
    }

    m = ligne.match(/^0 @([^@]+)@ FAM$/);

    if (m) {

        if (personne) {
            personnes.push(personne);
            personne = null;
        }

        if (famille) {
            familles.push(famille);
        }

        famille = {
            id: m[1],
            husband: null,
            wife: null,
            children: [],
            marriageDate: null,
            marriagePlace: null
        };

        contexte = "";
        continue;
    }

    /* ==========================
       INDIVIDUS
    ========================== */

    if (personne) {

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

    /* ==========================
       FAMILLES
    ========================== */

    if (famille) {

        if (ligne.startsWith("1 HUSB")) {

            const m = ligne.match(/@([^@]+)@/);

            if (m) famille.husband = m[1];
        }

        else if (ligne.startsWith("1 WIFE")) {

            const m = ligne.match(/@([^@]+)@/);

            if (m) famille.wife = m[1];
        }

        else if (ligne.startsWith("1 CHIL")) {

            const m = ligne.match(/@([^@]+)@/);

            if (m) famille.children.push(m[1]);
        }

        else if (ligne.startsWith("1 MARR")) {

            contexte = "MARR";
        }

        else if (
            contexte === "MARR" &&
            ligne.startsWith("2 DATE")
        ) {

            famille.marriageDate = ligne
                .replace("2 DATE", "")
                .trim();
        }

        else if (
            contexte === "MARR" &&
            ligne.startsWith("2 PLAC")
        ) {

            famille.marriagePlace = ligne
                .replace("2 PLAC", "")
                .trim();
        }
    }
}

/* ==========================
   FIN DE FICHIER
========================== */

if (personne) personnes.push(personne);
if (famille) familles.push(famille);

/* ==========================
   INDEXATION
========================== */

const personsById = {};

personnes.forEach(p => {

    p.parents = [];
    p.children = [];
    p.spouses = [];
    p.siblings = [];
    p.marriages = [];

    personsById[p.id] = p;
});

/* ==========================
   RELATIONS FAMILIALES
========================== */

familles.forEach(fam => {

    const husband = personsById[fam.husband];
    const wife = personsById[fam.wife];

    if (husband && wife) {

        if (!husband.spouses.includes(wife.id)) {
            husband.spouses.push(wife.id);
        }

        if (!wife.spouses.includes(husband.id)) {
            wife.spouses.push(husband.id);
        }

        husband.marriages.push({
            spouseId: wife.id,
            date: fam.marriageDate,
            place: fam.marriagePlace
        });

        wife.marriages.push({
            spouseId: husband.id,
            date: fam.marriageDate,
            place: fam.marriagePlace
        });
    }

    fam.children.forEach(childId => {

        const child = personsById[childId];

        if (!child) return;

        if (husband) {

            if (!child.parents.includes(husband.id)) {
                child.parents.push(husband.id);
            }

            if (!husband.children.includes(child.id)) {
                husband.children.push(child.id);
            }
        }

        if (wife) {

            if (!child.parents.includes(wife.id)) {
                child.parents.push(wife.id);
            }

            if (!wife.children.includes(child.id)) {
                wife.children.push(child.id);
            }
        }
    });
});

/* ==========================
   FRATRIES
========================== */

Object.values(personsById).forEach(person => {

    const siblings = new Set();

    person.parents.forEach(parentId => {

        const parent = personsById[parentId];

        if (!parent) return;

        parent.children.forEach(childId => {

            if (childId !== person.id) {
                siblings.add(childId);
            }
        });
    });

    person.siblings = [...siblings];
});

/* ==========================
   REMARIAGES
========================== */

const remariages = Object.values(personsById)
    .filter(p => p.spouses.length > 1)
    .map(p => ({
        id: p.id,
        nom: p.nom,
        nbConjoints: p.spouses.length
    }));

/* ==========================
   STATISTIQUES
========================== */

const statistiques = {

    individus: personnes.length,

    familles: familles.length,

    remariages: remariages.length,

    couples: familles.filter(
        f => f.husband && f.wife
    ).length
};

console.log("Personnes :", personnes.length);
console.log("Familles :", familles.length);
console.log("Remariages :", remariages.length);

console.log(
    "Première famille :",
    familles[0]
);

console.log(statistiques);

console.log("Avant export famille.json");

/* ==========================
   EXPORTS
========================== */

fs.writeFileSync(
    "famille.json",
    JSON.stringify(personnes, null, 2),
    "utf8"
);

console.log("famille.json OK");

fs.writeFileSync(
    "familles.json",
    JSON.stringify(familles, null, 2),
    "utf8"
);

console.log("familles.json OK");


fs.writeFileSync(
    "remariages.json",
    JSON.stringify(remariages, null, 2),
    "utf8"
);

console.log("Avant export remariages.json");

fs.writeFileSync(
    "statistiques.json",
    JSON.stringify(statistiques, null, 2),
    "utf8"
);

console.log("Avant export statistiques.json");

Console.log("statistiques.json OK");

console.log("=== FIN DU PROGRAMME ===");

/* ==========================
   RÉSUMÉ
========================== */

console.log(
    `${personnes.length} individus convertis`
);

console.log(
    `${familles.length} familles converties`
);

console.log(
    `${remariages.length} remariages détectés`
);

console.log("famille.json généré");
console.log("familles.json généré");
console.log("remariages.json généré");
console.log("statistiques.json généré");
