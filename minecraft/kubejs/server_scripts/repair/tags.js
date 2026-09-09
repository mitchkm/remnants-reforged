//priority:900

ServerEvents.tags('item', event => {
    // Darker Depths //
    /// Adds missing silver tag to darkerdepths:raw_silver
    event.add("forge:raw_materials/silver", "darkerdepths:raw_silver");

    /// Adds missing silver ore tag to variant silver ore blocks
    [
        "darkerdepths:aridrock_silver_ore",
        "darkerdepths:limestone_silver_ore"
    ].forEach(id => { event.add("forge:ores/silver", id); });
});

ServerEvents.tags('block', event => {
    // Darker Depths //
    /// Adds missing silver ore tag to variant silver ore blocks
    [
        "darkerdepths:aridrock_silver_ore",
        "darkerdepths:limestone_silver_ore"
    ].forEach(id => { event.add("forge:ores/silver", id); });

    /// Fixes variant coal ore blocks having the incorrect ore tag
    [
        "darkerdepths:aridrock_coal_ore",
        "darkerdepths:limestone_coal_ore"
    ].forEach(id => { 
        event.remove("forge:ores/silver", id);
        event.add("forge:ores/coal", id);
    });
});