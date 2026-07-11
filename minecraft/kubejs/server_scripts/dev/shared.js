//priority:1000

function analysis(items) {
    console.log("Beginning tag analysis...");

    const idsByTag = {};
    const idsByPair = {};

    function createTagPair(a, b) {
        return a < b ? `${a}|${b}` : `${b}|${a}`;
    }

    // Record ids within each tag and tag pair
    for (const item of items) {
        let tags = item.tags || [];
        let id = item.id;

        for (const tag of tags) {
            idsByTag[tag] = idsByTag[tag] || new Set();
            idsByTag[tag].add(id);
        }

        for (let i = 0; i < tags.length; i++) {
            for (let j = i + 1; j < tags.length; j++) {
                let key = createTagPair(tags[i], tags[j]);
                idsByPair[key] = idsByPair[key] || new Set();
                idsByPair[key].add(id);
            }
        }
    }
    
    const results = [];
    for (const [key, idsSet] of Object.entries(idsByPair)) {
        let [tagA, tagB] = key.split("|");
        let idsA = idsByTag[tagA] || new Set();
        let idsB = idsByTag[tagB] || new Set();
        
        let bothIds = Array.from(idsSet || []).sort();
        let onlyAIds = Array.from(idsA).filter((id) => !bothIds.includes(id)).sort();
        let onlyBIds = Array.from(idsB).filter((id) => !bothIds.includes(id)).sort();

        let countA = idsA.size;
        let countB = idsB.size;
        let togetherCount = bothIds.length;
        let confidenceAB = togetherCount / countA;
        let confidenceBA = togetherCount / countB;

        results.push({
            tagA: tagA,
            tagB: tagB,
            together: togetherCount,
            countA: countA,
            countB: countB,
            confidenceAB: confidenceAB,
            confidenceBA: confidenceBA,
            idsWithBoth: bothIds,
            idsWithAOnly: onlyAIds,
            idsWithBOnly: onlyBIds
        });
    }

    // Sort by strongest relationship
    results.sort((a, b) => {
        let scoreA = Math.max(a.confidenceAB, a.confidenceBA);
        let scoreB = Math.max(b.confidenceAB, b.confidenceBA);
        return scoreB - scoreA || b.together - a.together;
    });

    console.log(`Analysis complete.\n\tRecorded ${results.length} tag pairs.`);

    // Report only interesting relationships
    for (const r of results) {
        if (r.together > 5 && (r.confidenceAB >= 0.8 || r.confidenceBA >= 0.8)) {
            console.log(`
                A        : ${r.tagA}
                B        : ${r.tagB}
                together : ${r.together}
                counts   : ${r.countA}, ${r.countB}
                A -> B   : ${(r.confidenceAB * 100).toFixed(1)}%
                B -> A   : ${(r.confidenceBA * 100).toFixed(1)}%
                both ids : ${JSON.stringify(r.idsWithBoth.slice(0, 5), "\n", "  ")}
                Aonly ids: ${JSON.stringify(r.idsWithAOnly.slice(0, 5), "\n", "  ")}
                Bonly ids: ${JSON.stringify(r.idsWithBOnly.slice(0, 5), "\n", "  ")}
            `);
        }
    }
}