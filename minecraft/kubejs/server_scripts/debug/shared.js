//priority: 1000
//packmode: debug

const DATA_OUTPUT_FOLDER = "kubejs/datagen";

const REGISTRY = {
    ITEMS: "minecraft:item",
    BLOCKS: "minecraft:block",
    ENCHANTMENTS: "minecraft:enchantment",
    BIOMES: "minecraft:worldgen/biome",
    potions: "minecraft:potion"
};

function getJsonFromFile(fileName) {
    const jsonString = JsonIO.readString(`${DATA_OUTPUT_FOLDER}/${fileName}`);
    return JSON.parse(jsonString);
};

function dumpRegistryInfoToJson(outputFile) {
    let registryInfo = {};

    /** @type {Array<Internal.RegistryAccess$RegistryEntry<any>>} */
    let registries = Utils.getServer().registryAccess().registries().toArray();

    function dumpHelper(targetRegistry, outputArray, addAnnotation) {
        targetRegistry.forEach(reg => {
            let id = targetRegistry.getKey(reg);
            let resourceKey = targetRegistry.getResourceKey(reg).get();
            let holder = targetRegistry.getHolder(resourceKey).get();
            let tags = [];
            if (reg) {
                tags = holder.tags().toArray();
            }
            let entry = {};
            entry.id = `${id}`;
            entry.tags = tags.map(t => t.location().toString());

            if (addAnnotation) {
                addAnnotation(reg, targetRegistry, entry);
            }

            outputArray.push(entry);
        });
        console.log(`\t${outputArray.length} entries found.`);
    };

    console.log("### Dumping Registry Information ###");
    registries.forEach(registry => {
        let entryName = registry.key().location().toString().trim();
        console.log(`Dumping ${entryName}:`)
        let dumpList = [];
        if (entryName == REGISTRY.ENCHANTMENTS) {
            dumpHelper(registry.value(), dumpList, (reg, registry, entry) => {
                entry.rarity = `${reg.getRarity()}`;
                entry.isAllowedOnBooks = reg.isAllowedOnBooks();
                entry.isCurse = reg.isCurse();
                entry.isDiscoverable = reg.isDiscoverable();
                entry.isTradeable = reg.isTradeable();
                entry.isTreasureOnly = reg.isTreasureOnly();
            });
        }
        else {
            dumpHelper(registry.value(), dumpList);
        }
        registryInfo[entryName] = Array.from(dumpList);
    });

    // Write to json
    const fileLoc = `${DATA_OUTPUT_FOLDER}/${outputFile ?? "unknown.json"}`;
    console.log(`Saved json to ${fileLoc}\n`);
    JsonIO.write(fileLoc, registryInfo);
};
