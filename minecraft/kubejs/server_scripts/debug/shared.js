//priority: 1000
//packmode: debug

const DATA_OUTPUT_FOLDER = "kubejs/datagen";

const REGISTRY = {
    ITEMS: "minecraft:item",
    BLOCKS: "minecraft:block",
    ENCHANTMENTS: "minecraft:enchantment",
    BIOMES: "minecraft:worldgen/biome",
    POTIONS: "minecraft:potion",
    FORGE_BIOME_MODS: "forge:biome_modifier"
};

function getJsonFromFile(fileName) {
    const jsonString = JsonIO.readString(`${DATA_OUTPUT_FOLDER}/${fileName}`);
    return JSON.parse(jsonString);
};

function dumpRegistryInfoToJson(outputFile) {
    let BiomeModifier = Java.loadClass("net.minecraftforge.common.world.BiomeModifier");
    let JsonOps = Java.loadClass("com.mojang.serialization.JsonOps");
    let RegistryOps = Java.loadClass("net.minecraft.resources.RegistryOps");

    let ops = RegistryOps.create(
        JsonOps.INSTANCE,
        Utils.getServer().registryAccess()
    );

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
        let annotateLambda = null;
        if (entryName == REGISTRY.ENCHANTMENTS) {
            annotateLambda = (reg, registry, entry) => {
                entry.rarity = `${reg.getRarity()}`;
                entry.isAllowedOnBooks = reg.isAllowedOnBooks();
                entry.isCurse = reg.isCurse();
                entry.isDiscoverable = reg.isDiscoverable();
                entry.isTradeable = reg.isTradeable();
                entry.isTreasureOnly = reg.isTreasureOnly();
            };
        }
        else if (entryName == REGISTRY.FORGE_BIOME_MODS) {
            annotateLambda = (reg, registry, entry) => {
                let result = BiomeModifier.DIRECT_CODEC.encodeStart(ops, reg);

                if (result.result().isPresent()) {
                    let json = result.result().get();
                    entry.modifierData = json
                }
            };
        }
        dumpHelper(registry.value(), dumpList, annotateLambda);
        registryInfo[entryName] = Array.from(dumpList);
    });

    // Write to json
    const fileLoc = `${DATA_OUTPUT_FOLDER}/${outputFile ?? "unknown.json"}`;
    console.log(`Saved json to ${fileLoc}\n`);
    JsonIO.write(fileLoc, registryInfo);
};
