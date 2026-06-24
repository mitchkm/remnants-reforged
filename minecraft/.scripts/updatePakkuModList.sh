#!/usr/bin/env bash

filters=(
    # utility mods
    "betterf3"
    "fps-monitor"
    "mcretector"
    "probejs"
    # libs
    "addonslib"
    "aeroblender"
    "architectury-api"
    "balm"
    "blueprint"
    "bookshelf"
    "caelus"
    "cb-multipart"
    "cloth-config"
    "codechicken-lib"
    "collective"
    "framework"
    "geckolib"
    "iceberg"
    "liolib"
    "mutil"
    "placebo"
    "polylib"
    "puzzles-lib"
    "rhino"
    "scalable-cats-force"
    "selene"
    "sophisticated-core"
    "supermartijn642s-config-lib"
    "terrablender"
    "valhelsia-core"
    "yungs-api"
)

pattern=$(IFS='|'; echo "${filters[*]}")

pakku ls | sed -r "s:\x1B\[[0-9;]*[mK]::g" > _pakkuInstalledMods.txt
cat _pakkuInstalledMods.txt | grep -Ev "$pattern" > _pakkuInstalledMods_filtered.txt

echo "Filtered out Pakku entries ===================================="
diff -y --suppress-common-lines _pakkuInstalledMods.txt _pakkuInstalledMods_filtered.txt