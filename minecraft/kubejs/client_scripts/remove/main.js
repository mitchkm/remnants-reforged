//priority:800

(() => {

    let removeJson = JsonIO.read("kubejs/toRemove.json");
    let removeList = removeJson.remove;

    ItemEvents.tooltip(event => {
        event.add(
            removeList,
            Text.red("A lost remnant. How did you find it?")
        )
    })

})();