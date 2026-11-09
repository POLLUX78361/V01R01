const patronymes = {};

index.forEach(personne => {
    const nom = personne.nom;

    if (!patronymes[nom]) {
        patronymes[nom] = 0;
    }

    patronymes[nom]++;
});

const indexPatronymes = Object.entries(patronymes)
    .map(([nom, nombre]) => ({
        nom,
        nombre
    }))
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));

fs.writeFileSync(
    "index-patronymes.json",
    JSON.stringify(indexPatronymes, null, 2),
