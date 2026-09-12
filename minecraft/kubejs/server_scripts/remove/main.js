//priority:800

(() => {

    let removeJson = JsonIO.read("kubejs/toRemove.json");
    let removeList = removeJson.remove;

    /** @type (event: TagEvent.Item) => void */ 
    let tagEventHandler = (event) => {
        event.removeAllTagsFrom(removeList);
        event.add(global.removedTag, removeList);
        event.add("c:hidden_from_recipe_viewers", removeList)
    };

    ServerEvents.tags("item", tagEventHandler);
    ServerEvents.tags("block", tagEventHandler);
    ServerEvents.tags("fluid", tagEventHandler);

    ServerEvents.recipes((event) => {
        event.remove({ input: removeList })
        event.remove({ output: removeList })
    })

    LootJS.modifiers((event) => {
        event.addLootTypeModifier(
            LootType.ENTITY,
            LootType.UNKNOWN,
            LootType.BLOCK,
            LootType.CHEST,
            LootType.FISHING,
            LootType.GIFT,
            LootType.ADVANCEMENT_ENTITY,
            LootType.ADVANCEMENT_REWARD,
            LootType.PIGLIN_BARTER
        ).removeLoot(removeList)
    })

})();