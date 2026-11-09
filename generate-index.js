const fs = require("fs");

// Lecture du fichier famille.json
const personnes = JSON.parse(
    fs.readFileSync("famille.json", "utf8")
);

// Construction de l'index
const index = personnes
    .filter(p => p.nom)
    .map(p => {

        const mots = p.nom.trim().split(" ");
        const nom = (mots.pop() || "").toUpperCase();

        return {
            id: p.id,
            nom: nom,
            prenom: mots.join(" ")
                .replace(/,/g, "")
                .trim(),
            nomComplet: p.nom,
            naissance: p.naissance ?? null,
            deces: p.deces ?? null,
            fid: p.fid ?? null,
            mid: p.mid ?? null
        };
    })
    .sort((a, b) =>
        a.nom.localeCompare(b.nom, "fr") ||
        a.prenom.localeCompare(b.prenom, "fr")
    );

// Création index.json
fs.writeFileSync(
    "index.json",
    JSON.stringify(index, null, 2),
    "utf8"
);

// Comptage des patronymes
const patronymes = {};

index.forEach(personne => {
    const nom = personne.nom;

    if (!patronymes[nom]) {
        patronymes[nom] = 0;
    }

    patronymes[nom]++;
});

// Création index-patronymes.json
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

console.log(
    `${index.length} personnes indexées`
);
