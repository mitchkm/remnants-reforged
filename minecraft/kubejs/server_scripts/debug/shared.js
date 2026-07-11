//priority: 1000
//packmode: debug

const DATA_OUTPUT_FOLDER = "kubejs/datagen";

function dumpRegistryInfoToJson(outputFile) {
    let registryInfo = {
        items: [],
        blocks: [],
        enchantments: [],
        biomes: [],
        potions: []
    };

    // https://skmedix.github.io/ForgeJavaDocs/javadoc/forge/1.9.4-12.17.0.2051/net/minecraftforge/fml/common/registry/ForgeRegistries.html
    const ForgeRegistries = Java.loadClass("net.minecraftforge.registries.ForgeRegistries");

    function dumpHelper(targetRegistry, outputArray, addAnnotation) {
        for (const reg of targetRegistry.getValues()) {
            let id = targetRegistry.getKey(reg);
            let holder = targetRegistry.getHolder(id).get();
            let tags = [];
            if (holder) {
                tags = holder.tags().toArray();
            }
            let entry = {};
            entry.id = `${id}`;
            entry.tags = tags.map(t => t.location().toString());

            if (addAnnotation) {
                addAnnotation(reg, targetRegistry, entry);
            }

            outputArray.push(entry);
        }
        console.log(`\t${outputArray.length} entries found.`);
    };

    console.log("### Dumping Registry Information ###");
    console.log("Items:");
    dumpHelper(ForgeRegistries.ITEMS, registryInfo.items);
    console.log("Blocks:");
    dumpHelper(ForgeRegistries.BLOCKS, registryInfo.blocks);
    console.log("Enchantments:");
    dumpHelper(ForgeRegistries.ENCHANTMENTS, registryInfo.enchantments, (reg, registry, entry) => {
        entry.rarity = `${reg.getRarity()}`;
        entry.isAllowedOnBooks = reg.isAllowedOnBooks();
        entry.isCurse = reg.isCurse();
        entry.isDiscoverable = reg.isDiscoverable();
        entry.isTradeable = reg.isTradeable();
        entry.isTreasureOnly = reg.isTreasureOnly();
    });
    console.log("Biomes:");
    dumpHelper(ForgeRegistries.BIOMES, registryInfo.biomes);
    console.log("Potions:");
    dumpHelper(ForgeRegistries.POTIONS, registryInfo.potions);

    const fileLoc = `${DATA_OUTPUT_FOLDER}/${outputFile ?? "unknown.json"}`;
    console.log(`Json written to ${fileLoc}\n`);
    JsonIO.write(fileLoc, registryInfo);
};

function getRegistryInfoJson(fileName) {
    const jsonString = JsonIO.readString(`${DATA_OUTPUT_FOLDER}/${fileName}`);
    return JSON.parse(jsonString);
};
