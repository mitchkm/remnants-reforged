
ServerEvents.customCommand("testFindBiomeModifiers", e => {
    // const registryInfo = getRegistryInfoJson("registryInfo.json");
    // console.log(registryInfo);
    // analysis(registryInfo.items);

    let manager = Utils.getServer().getResourceManager();

    /** @type {Array<Internal.RegistryAccess$RegistryEntry<any>>} */
    let registry = Utils.getServer().registryAccess().registries().toArray();
    let forgeBiomeModifiers = registry.find(val => val.key().location().toString().trim() == "forge:biome_modifier")
    let entries = forgeBiomeModifiers.value().entrySet();
    entries.forEach(entry => {
        let key = entry.getKey();
        let obj = entry.getValue();

        if (key.namespace == "projectred_exploration") {
            console.log(`${key}`);
            if (obj.features) {
                for (const holder of obj.features()) {
                    console.log(holder);
                    // If it's a reference, this should give you the registry key
                    if (holder.unwrapKey().isPresent()) {
                        console.log(holder.unwrapKey().get().location());
                    }

                    // Or get the actual PlacedFeature
                    let placed = holder.value();
                    console.log(placed);

                    let configured = placed.feature().value();

                    console.log(configured);
                    console.log(configured.getClass().getName());

                    let config = configured.config();
                    console.log(config);
                    console.log(config.getClass().getName());

                    console.log(config.targetStates);
                    console.log(config.size);
                    console.log(config.discardChanceOnAirExposure);

                    config.targetStates.forEach(target => {
                    let state = target.state;

                    console.log(state);

                    let block = state.getBlock();
                    console.log(block);

                    console.log(block.builtInRegistryHolder().key().location());
                });
                }
            }
        }
    });
});

ServerEvents.customCommand("TBD", e => {
    let manager = Utils.getServer().getResourceManager();

    let resources = manager.listResources(
        "forge/biome_modifier",
        path => path.toString().endsWith(".json")
    );

    let keys = Object.keys(resources);
    console.log(keys.length);
    let count = 0;
    keys.forEach(k => {
        count++;
        console.log(k);
        let resource = manager.getResource(k);

        let reader = resource.get().openAsReader();
        let json = JSON.parse(reader.lines().toArray().join("\n"));
        reader.close();

        console.log("=== " + k + " ===");
        console.log(JSON.stringify(json, null, 2));
    });
    console.log(count)
});
