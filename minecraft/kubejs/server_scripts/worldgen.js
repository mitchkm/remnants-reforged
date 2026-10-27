
ServerEvents.highPriorityData(e => {

    // BoP Volcano and Volcanic Plains feature adjustments //

    /// Create custom lava lake feature replacing stone with Volcano's surface block
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

    /// Create volcano specific placed features mirroring vanilla features
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
    //// Modify BoP volcano lava lake feature
    e.addJson(`biomesoplenty:worldgen/placed_feature/lake_lava_surface_extra.json`, {
        "feature": cfVolcanoLake,
        "placement": [
            { "type": "minecraft:count", "count": 15 },
            { "type": "minecraft:in_square" },
            { "type": "minecraft:heightmap", "heightmap": "WORLD_SURFACE_WG" },
            { "type": "minecraft:biome" }
        ]
    });

    /// Remove vanilla lava lakes
    e.addJson(`${global.namespace}:forge/biome_modifier/remove_vanilla_lava_lakes_volcano.json`, {
        "type": "forge:remove_features",
        "biomes": ["biomesoplenty:volcano", "biomesoplenty:volcanic_plains"],
        "features": [
            "minecraft:lake_lava_underground",
            "minecraft:lake_lava_surface"
        ],
        "step": "lakes"
    });

    /// Add custom lava lakes back
    e.addJson(`${global.namespace}:forge/biome_modifier/add_lava_lakes_volcano.json`, {
        "type": "forge:add_features",
        "biomes": ["biomesoplenty:volcano", "biomesoplenty:volcanic_plains"],
        "features": [
            `${global.namespace}:lake_lava_surface_volcano`,
            `${global.namespace}:lake_lava_underground_volcano`
        ],
        "step": "lakes"
    });
});
