const fs = require("fs");

const personnes = JSON.parse(
    fs.readFileSync("famille.json", "utf8")
);

const index = personnes.map(p => {

    const mots = p.nom.split(" ");

    const patronyme = (mots.pop() || "").toUpperCase();

    return {
        id: p.id,

        patronyme: patronyme,

        nomComplet: p.nom,

        sexe: p.sexe,

        naissanceDate: p.naissance?.date || null,
        naissanceLieu: p.naissance?.lieu || null,

        decesDate: p.deces?.date || null,
        decesLieu: p.deces?.lieu || null
    };
});

index.sort((a,b)=>
    a.patronyme.localeCompare(b.patronyme,"fr")
);

fs.writeFileSync(
    "index.json",
    JSON.stringify(index,null,2)
);

console.log("index.json créé");
