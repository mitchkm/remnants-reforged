//packmode: debug

// command to dump items, blocks, etc. ids including their tags to a json file.
ServerEvents.customCommand("registry_dump", e => {
    const outputFile = "kubejs/datagen/registryInfo.json";
    let registryInfo = {
        items: [],
        blocks: []
    };

    // https://skmedix.github.io/ForgeJavaDocs/javadoc/forge/1.9.4-12.17.0.2051/net/minecraftforge/fml/common/registry/ForgeRegistries.html
    const ForgeRegistries = Java.loadClass("net.minecraftforge.registries.ForgeRegistries");

    for (const block of ForgeRegistries.BLOCKS.getValues()) {
        let blockId = ForgeRegistries.BLOCKS.getKey(block);
        let tags = block.builtInRegistryHolder()
            .tags()
            .toArray();

        registryInfo.blocks.push({
            id: `${blockId}`,
            tags: tags.map(t => t.location().toString())
        });
    }

    for (const item of ForgeRegistries.ITEMS.getValues()) {
        let itemId = ForgeRegistries.ITEMS.getKey(item);
        let tags = item.builtInRegistryHolder()
            .tags()
            .toArray();

        registryInfo.items.push({
            id: `${itemId}`, 
            tags: tags.map(t => t.location().toString())
        });
    }

    JsonIO.write(outputFile, registryInfo);
});
