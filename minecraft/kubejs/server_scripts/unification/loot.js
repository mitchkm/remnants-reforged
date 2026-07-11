//priority:800

// Modify ore loot tables to always return unified raw material item.
LootJS.modifiers(event => {
    if (global.debug) { event.enableLogging(); }
    event.addBlockLootModifier('#forge:ores').modifyLoot('#forge:raw_materials', item => {
        const replacement = AlmostUnified.getReplacementForItem(item);
        if (replacement.isEmpty() || item == replacement) {
            return item;
        }

        replacement.setCount(item.getCount());
        return replacement;
    });
});