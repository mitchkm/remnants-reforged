//requires: sophisticatedbackpacks

ServerEvents.tags('item', event => {
    const curioBackSlotItems = event.get('curios:back').getObjectIds();
    curioBackSlotItems
        .filter(id => id.namespace === 'sophisticatedbackpacks')
        .forEach(id => {
            console.log(`Changing ${id} curios:back to curios:backpack slot`);
            event.remove('curios:back', id);
            event.add('curios:backpack', id)
        });
});