
ServerEvents.tags('item', event => {
    // Move backpacks to curios:backpack slot
    [
        "sophisticatedbackpacks:backpack",
        "sophisticatedbackpacks:copper_backpack",
        "sophisticatedbackpacks:iron_backpack",
        "sophisticatedbackpacks:gold_backpack",
        "sophisticatedbackpacks:diamond_backpack",
        "sophisticatedbackpacks:netherite_backpack",
    ].forEach(id => {
        event.remove('curios:back', id);
        event.add('curios:backpack', id);
    });
});