//packmode: debug

// command to dump items, blocks, etc. ids including their tags to a json file.
ServerEvents.customCommand("registry_dump", e => {
    dumpRegistryInfoToJson("registryInfo.json");
});