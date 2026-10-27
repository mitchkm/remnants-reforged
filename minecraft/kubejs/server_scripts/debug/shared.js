//priority: 1000
//packmode: debug

const DATA_OUTPUT_FOLDER = "kubejs/datagen";

const REGISTRY = {
    ITEMS: "minecraft:item",
    BLOCKS: "minecraft:block",
    ENCHANTMENTS: "minecraft:enchantment",
    POTIONS: "minecraft:potion",
    BIOMES: "minecraft:worldgen/biome",
    CONFIGURED_FEATURE: "minecraft:worldgen/configured_feature",
    PLACED_FEATURE: "minecraft:worldgen/placed_feature",
    NOISE_SETTINGS: "minecraft:worldgen/noise_settings",
    FORGE_BIOME_MODS: "forge:biome_modifier"
};

function getJsonData(fileName) {
    return JsonIO.read(`${DATA_OUTPUT_FOLDER}/${fileName}`);
};

function dumpRegistryInfoToJson(outputFile) {
    let BiomeModifier = Java.loadClass("net.minecraftforge.common.world.BiomeModifier");
    let Biome = Java.loadClass("net.minecraft.world.level.biome.Biome");
    let ConfiguredFeature = Java.loadClass('net.minecraft.world.level.levelgen.feature.ConfiguredFeature');
    let PlacedFeature = Java.loadClass('net.minecraft.world.level.levelgen.placement.PlacedFeature');
    let NoiseGeneratorSetting = Java.loadClass('net.minecraft.world.level.levelgen.NoiseGeneratorSettings');
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
        else if (entryName == REGISTRY.NOISE_SETTINGS) {
            annotateLambda = (reg, registry, entry) => {
                let result = NoiseGeneratorSetting.DIRECT_CODEC.encodeStart(ops, reg);

                let json = result.resultOrPartial(err => {
                    console.warn(`Issue encoding Noise Settings [${entry.id}]: ${err}`);
                });

                if (json && json.isPresent()) {
                    entry.jsonData = json.get();
                }
            };
        }
        else if (entryName == REGISTRY.FORGE_BIOME_MODS) {
            annotateLambda = (reg, registry, entry) => {
                let result = BiomeModifier.DIRECT_CODEC.encodeStart(ops, reg);

                let json = result.resultOrPartial(err => {
                    console.warn(`Issue encoding Biome Modifier [${entry.id}]: ${err}`);
                });

                if (json && json.isPresent()) {
                    entry.jsonData = json.get();
                }
            };
        }
        else if (entryName == REGISTRY.CONFIGURED_FEATURE) {
            annotateLambda = (reg, registry, entry) => {
                let result = ConfiguredFeature.DIRECT_CODEC.encodeStart(ops, reg);

                let json = result.resultOrPartial(err => {
                    console.warn(`Issue encoding Configured Feature [${entry.id}]: ${err}`);
                });

                if (json && json.isPresent()) {
                    entry.jsonData = json.get();
                }
            };
        }
        else if (entryName == REGISTRY.PLACED_FEATURE) {
            annotateLambda = (reg, registry, entry) => {
                let result = PlacedFeature.DIRECT_CODEC.encodeStart(ops, reg);

                let json = result.resultOrPartial(err => {
                    console.warn(`Issue encoding Placed Feature [${entry.id}]: ${err}`);
                });

                if (json && json.isPresent()) {
                    entry.jsonData = json.get();
                }
            };
        }
        else if (entryName == REGISTRY.BIOMES) {
            annotateLambda = (reg, registry, entry) => {
                /// AI Generated Code BEGIN ///
                let dataDump = {
                    precipitation: `${reg.getPrecipitation()}`,
                    temperature: reg.getBaseTemperature(),
                    downfall: reg.getDownfall(),
                    // Maps actual human-readable step indices
                    features: {
                        raw_generation: [],
                        lakes: [],
                        local_modifications: [],
                        underground_structures: [],
                        underground_ores: [],
                        underground_decoration: [],
                        fluid_springs: [],
                        vegetal_decoration: [], // <- Trees, plants, and flowers appear here
                        top_layer_modification: []
                    },
                    surface_blocks: []
                };

                // --- 1. PROPER WORLDGEN FEATURE MAPPING ---
                let genSettings = reg.getGenerationSettings();
                let featureStepsList = genSettings.features(); // java.util.List

                // Human-readable mapping array matching the strict index positions
                let stepNames = [
                    "raw_generation", "lakes", "local_modifications", 
                    "underground_structures", "underground_ores", 
                    "underground_decoration", "fluid_springs", 
                    "vegetal_decoration", "top_layer_modification"
                ];

                // Loop cleanly by exact integer index boundaries 
                for (let i = 0; i < featureStepsList.size(); i++) {
                    if (i >= stepNames.length) break;
                    let currentStepName = stepNames[i];
                    let stepFeaturesSet = featureStepsList.get(i); // Grab individual HolderSet

                    stepFeaturesSet.forEach(featureHolder => {
                        let optionalKey = featureHolder.unwrapKey();
                        if (optionalKey.isPresent()) {
                            dataDump.features[currentStepName].push(optionalKey.get().location().toString());
                        } else {
                            dataDump.features[currentStepName].push(`inline:${featureHolder.value().getClass().getSimpleName()}`);
                        }
                    });
                }

                // Clean out empty generation categories to keep your JSON tidy
                Object.keys(dataDump.features).forEach(key => {
                    if (dataDump.features[key].length === 0) {
                        delete dataDump.features[key];
                    }
                });

                // --- 2. EXTRACT SURFACE BLOCKS VIA STRING RESOLUTION ---
                // Surface Rules are complex tree structures (conditionals, sequences).
                // Translating the live rule tree object directly to text extracts the underlying block placements.
                try {
                    // Try accessing the climate/surface data loop
                    let climateSettings = reg.getClimateSettings(); 
                    if (climateSettings && climateSettings.surfaceBuilder) {
                        let builderStr = String(climateSettings.surfaceBuilder());
                        // Regex scans the rule structure for namespaced block IDs
                        let blockMatches = builderStr.match(/[a-z0-9_.-]+:[a-z0-9_.-]+/g);
                        if (blockMatches) {
                            let uniqueBlocks = new Set(blockMatches.filter(b => b.includes("block") || !b.includes("rule")));
                            dataDump.surface_blocks = Array.from(uniqueBlocks);
                        }
                    }
                } catch (e) {
                    // If climate settings mismatch across mod setups, safely dump raw string data
                    let rawStringValue = String(reg.toString());
                    let blockMatches = rawStringValue.match(/[a-z0-9_.-]+:[a-z0-9_.-]+/g);
                    if (blockMatches) {
                        dataDump.surface_blocks = blockMatches.filter(id => id.includes("block") || id.includes("stone"));
                    }
                }

                // Assign the organized map data back to the output builder
                entry.jsonData = dataDump;
                /// AI Generated Code END ///
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
