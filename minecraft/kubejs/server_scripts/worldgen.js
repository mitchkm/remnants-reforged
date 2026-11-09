
ServerEvents.highPriorityData(e => {
    function addBiomeFeature(name, biomes, features, step) {
        let json = {
            "type": "forge:add_features",
            "biomes": biomes,
            "features": features
        };
        if (step) {
            json.step = step;
        }
        e.addJson(`${global.namespace}:forge/biome_modifier/${name}.json`, json);
    };

    function removeBiomeFeature(name, biomes, features, step) {
        let json = {
            "type": "forge:remove_features",
            "biomes": biomes,
            "features": features
        };
        if (step) {
            json.step = step;
        }
        e.addJson(`${global.namespace}:forge/biome_modifier/${name}.json`, json);
    };

    /////////////////////////////////////////////
    // BoP Volcano and Volcanic Plains changes //
    /////////////////////////////////////////////

    // Create custom lava lake feature replacing stone with Volcano's surface block
    const cfVolcanoLake = `${global.namespace}:lake_lava_volcano`;
    e.addJson(`${global.namespace}:worldgen/configured_feature/lake_lava_volcano.json`, {
        "type": "minecraft:lake",
        "config": {
            "fluid": {
                "type": "minecraft:simple_state_provider",
                "state": {
                    "Name": "minecraft:lava",
                    "Properties": {
                        "level": "0"
                    }
                }
            },
            "barrier": {
                "type": "minecraft:simple_state_provider",
                "state": { "Name": "projectred_exploration:basalt" }
            }
        }
    });

    // Create volcano specific placed features mirroring vanilla features
    e.addJson(`${global.namespace}:worldgen/placed_feature/lake_lava_surface_volcano.json`, {
        "feature": cfVolcanoLake,
        "placement": [
            { "type": "minecraft:rarity_filter", "chance": 200 },
            { "type": "minecraft:in_square" },
            { "type": "minecraft:heightmap", "heightmap": "WORLD_SURFACE_WG" },
            { "type": "minecraft:biome" }
        ]
    });
    e.addJson(`${global.namespace}:worldgen/placed_feature/lake_lava_underground_volcano.json`, {
        "feature": cfVolcanoLake,
        "placement": [
            { "type": "minecraft:rarity_filter", "chance": 9 },
            { "type": "minecraft:in_square" },
            {
                "height": {
                    "min_inclusive": {
                        "absolute": 0
                    },
                    "max_inclusive": {
                        "below_top": 0
                    },
                    "type": "minecraft:uniform"
                },
                "type": "minecraft:height_range"
            },
            {
                "direction_of_search": "down",
                "target_condition": {
                    "predicates": [
                        {
                            "predicate": {
                                "blocks": "minecraft:air",
                                "type": "minecraft:matching_blocks"
                            },
                            "type": "minecraft:not"
                        },
                        {
                            "offset": [
                                0,
                                -5,
                                0
                            ],
                            "type": "minecraft:inside_world_bounds"
                        }
                    ],
                    "type": "minecraft:all_of"
                },
                "max_steps": 32,
                "type": "minecraft:environment_scan"
            },
            {
                "type": "minecraft:surface_relative_threshold_filter",
                "heightmap": "OCEAN_FLOOR_WG",
                "max_inclusive": -5
            },
            { "type": "minecraft:biome" }
        ]
    });

    // Modify BoP volcano lava lake feature
    e.addJson(`biomesoplenty:worldgen/placed_feature/lake_lava_surface_extra.json`, {
        "feature": cfVolcanoLake,
        "placement": [
            { "type": "minecraft:count", "count": 15 },
            { "type": "minecraft:in_square" },
            { "type": "minecraft:heightmap", "heightmap": "WORLD_SURFACE_WG" },
            { "type": "minecraft:biome" }
        ]
    });

    // Remove vanilla lava lakes
    removeBiomeFeature("remove_vanilla_lava_lakes_volcano",
        ["biomesoplenty:volcano", "biomesoplenty:volcanic_plains"],
        ["minecraft:lake_lava_underground", "minecraft:lake_lava_surface"],
        "lakes"
    );

    // Add custom lava lakes back
    addBiomeFeature("add_lava_lakes_volcano",
        ["biomesoplenty:volcano", "biomesoplenty:volcanic_plains"],
        [
            `${global.namespace}:lake_lava_surface_volcano`,
            `${global.namespace}:lake_lava_underground_volcano`
        ],
        "lakes");

    ////////////////////////////////////
    // Adjust ic2c rubber tree spawns //
    ////////////////////////////////////
    function rubberTreePlacement(countMin, countMax) {
        return {
            "feature": "ic2:rubber_tree",
            "placement": [
                {
                    "type": "minecraft:count",
                    "count": {
                        "type": "minecraft:uniform",
                        "value": {
                            "min_inclusive": countMin,
                            "max_inclusive": countMax
                        }
                    }
                },
                { "type": "minecraft:in_square" },
                { "type": "minecraft:surface_water_depth_filter", "max_water_depth": 0 },
                { "type": "minecraft:heightmap", "heightmap": "OCEAN_FLOOR" },
                {
                    "type": "minecraft:block_predicate_filter",
                    "predicate": {
                        "type": "minecraft:would_survive",
                        "state": {
                            "Name": "ic2:rubber_sapling"
                        }
                    }
                },
                { "type": "minecraft:biome" }
            ]
        };
    };

    let pfRubberTreeDefault = "rubber_trees_default";
    e.addJson(`${global.namespace}:worldgen/placed_feature/${pfRubberTreeDefault}.json`, rubberTreePlacement(0, 1));

    let pfRubberTreeSwamps = "rubber_trees_swamps";
    e.addJson(`${global.namespace}:worldgen/placed_feature/${pfRubberTreeSwamps}.json`, rubberTreePlacement(1, 3));

    addBiomeFeature("add_ic2_rubber_tree_forest", "#minecraft:is_forest", `${global.namespace}:${pfRubberTreeDefault}`, "vegetal_decoration");
    addBiomeFeature("add_ic2_rubber_tree_swamp", "#minecraft:is_swamp", `${global.namespace}:${pfRubberTreeSwamps}`, "vegetal_decoration");

    removeBiomeFeature("blacklist_ic2_rubber_tree",
        "biomesoplenty:cherry_blossom_grove",
        [
            `${global.namespace}:${pfRubberTreeDefault}`,
            `${global.namespace}:${pfRubberTreeSwamps}`
        ],
        "vegetal_decoration"
    );
});
