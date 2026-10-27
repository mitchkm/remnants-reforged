
// TerraBlender rules can be modified in post init
StartupEvents.postInit(event => {
    //////////////////////////////
    // TerraBlender helper code //
    //////////////////////////////
    const SurfaceRules = Java.loadClass('net.minecraft.world.level.levelgen.SurfaceRules');
    const SurfaceRuleManager = Java.loadClass('terrablender.api.SurfaceRuleManager');
    const RuleCategory = Java.loadClass('terrablender.api.SurfaceRuleManager\$RuleCategory');
    const JsonOps = Java.loadClass("com.mojang.serialization.JsonOps");
    const JsonParser = Java.loadClass('com.google.gson.JsonParser');

    /** @type {(category: any, namespace: string) => SurfaceRules.RuleSource} */
    function getTBNamespacedRules(category, namespace) {
        let tbRules = SurfaceRuleManager.getNamespacedRules(category, null);
        return tbRules.sources().get(namespace);
    };

    /** @type {(category: any, namespace: string, rules: SurfaceRules.RuleSource) => void } */
    function replaceTBNamespacedRules(category, namespace, rules) {
        SurfaceRuleManager.addSurfaceRules(category, namespace, rules);
    };

    /**
     * @typedef {Object} TBRuleJson
     * @property {string} type
     */

    /**
     * @typedef {Object} TBSequenceRuleJson
     * @property {TBRuleJson[]} sequence
     */

    /**
     * @typedef {Object} TBConditionRuleJson
     * @property {TBRuleJson} if_true
     * @property {TBRuleJson} then_run
     */

    /**
     * @typedef {Object} TBBlockRuleJson
     * @property {{Name: string, Properties?: any}} result_state
     */

    /**
     * @typedef {Object} TBBiomeRuleJson
     * @property {string[]} biome_is
     */

    /**
     * @param {TBRuleJson} rule
     * @returns {rule is TBSequenceRuleJson}
     */
    function isSequenceRule(rule) {
        return rule.type == "minecraft:sequence";
    }
    
    /**
     * @param {TBRuleJson} rule
     * @returns {rule is TBConditionRuleJson}
     */
    function isConditionRule(rule) {
        return rule.type == "minecraft:condition";
    }

    /**
     * @param {TBRuleJson} rule
     * @returns {rule is TBBlockRuleJson}
     */
    function isBlockRule(rule) {
        return rule.type == "minecraft:block";
    }

    /**
     * @param {TBRuleJson} rule
     * @returns {rule is TBBiomeRuleJson}
     */
    function isBiomeRule(rule) {
        return rule.type == "minecraft:biome";
    }

    /**
     * Replaces the block in a Block Rule
     * When biome(s) are provided, only block rules within any of the biomes as a condition will be changed
     *
     * @param {TBRuleJson} rules
     * @param {string} oldBlock
     * @param {string} newBlock
     * @param {string|string[]} biomes
     * @returns {number} The number of block rules changed.
     */
    function replaceBlockRuleBlocks(rules, oldBlock, newBlock, biomes) {
        const targetBiomes = biomes == null
            ? null
            : (Array.isArray(biomes) ? biomes : [biomes]);
        let changedCount = 0;

        /**
         * @param {string[] | null} biomeScope
         * @return {boolean}
         */
        function matchesTargetBiomes(biomeScope) {
            return targetBiomes == null
                || biomeScope != null && biomeScope.some(biome => targetBiomes.indexOf(biome) != -1);
        }

        /**
         * @param {TBRuleJson} node
         * @param {string[] | null} biomeScope
         */
        function visit(node, biomeScope) {
            if (node == null || typeof node != "object") {
                return;
            }

            if (isBlockRule(node)) {
                if (node.result_state && node.result_state.Name == oldBlock && matchesTargetBiomes(biomeScope)) {
                    node.result_state.Name = newBlock;
                    changedCount++;
                }
                return;
            }

            if (isSequenceRule(node)) {
                if (Array.isArray(node.sequence)) {
                    node.sequence.forEach(r => visit(r, biomeScope));
                }                
                return;
            }

            if (isConditionRule(node)) {
                let newBiomeScope = null;
                if (isBiomeRule(node.if_true)) {
                    newBiomeScope = Array.isArray(node.if_true.biome_is) ? node.if_true.biome_is.slice() : null;
                }
                if (biomeScope != null) {
                    newBiomeScope = biomeScope.concat(newBiomeScope);
                }

                visit(node.then_run, newBiomeScope);
                return;
            }
        }

        visit(rules, null);
        return changedCount;
    }

    /** @type {(tBRules: SurfaceRules.RuleSource) => TBRuleJson } */
    function tBRulesToJson(tBRules) {
        let result = SurfaceRules.RuleSource.CODEC.encodeStart(JsonOps.INSTANCE, tBRules).result();
        
        if (result.isPresent()) {
            let jsonString = result.get().toString();
            return JSON.parse(jsonString);
        }
        
        console.warn("tBRulesToJson: Failed to convert to json " + tBRules);
        return null;
    }

    /** @type {(json: TBRuleJson) => SurfaceRules.RuleSource } */
    function jsonToTBRules(json) {
        let gson = JsonParser.parseString(JSON.stringify(json));

        let decodedResult = SurfaceRules.RuleSource.CODEC.parse(JsonOps.INSTANCE, gson).result();
        if (decodedResult.isPresent()) {
            return decodedResult.get();
        }

        console.warn("jsonToTBRules: Failed to convert to TB SurfaceRules.RuleSource " + json);
        return null;
    }

    ////////////////////////////
    // Worldgen modifications //
    ////////////////////////////

    // BoP Overworld
    let bop_overworldTBRules = getTBNamespacedRules(RuleCategory.OVERWORLD, "biomesoplenty");
    let bop_TBRulesJson = tBRulesToJson(bop_overworldTBRules);
    if (bop_TBRulesJson != null) {
        let changedCount = 0;

        // Changes volcano's surface blocks all to projectred_exploration:basalt
        changedCount += replaceBlockRuleBlocks(
            bop_TBRulesJson,
            "minecraft:smooth_basalt",
            "projectred_exploration:basalt",
            "biomesoplenty:volcano"
        );

        changedCount += replaceBlockRuleBlocks(
            bop_TBRulesJson,
            "minecraft:magma_block",
            "projectred_exploration:basalt",
            "biomesoplenty:volcano"
        );

        if (changedCount > 0) {
            let bop_overworldTBRules_modified = jsonToTBRules(bop_TBRulesJson);
            if (bop_overworldTBRules_modified != null) {
                replaceTBNamespacedRules(RuleCategory.OVERWORLD, "biomesoplenty", bop_overworldTBRules_modified);
                console.log("Updated " + changedCount + " TerraBlender surface block rule(s).");
            }
        }
    }
});
