#!/usr/bin/env bash

filters=(
    # utility mods
    "mcretector"
    # libs
    "architectury-api"
    "balm"
    "blueprint"
    "bookshelf"
    "cb-multipart"
    "cloth-config"
    "codechicken-lib"
    "geckolib"
    "polylib"
    "rhino"
    "scalable-cats-force"
    "selene"
    "sophisticated-core"
    "terrablender"
    "valhelsia-core"
    "yungs-api"
    "mutil"
)

pattern=$(IFS='|'; echo "${filters[*]}")

pakku ls | sed -r "s:\x1B\[[0-9;]*[mK]::g" > _pakkuInstalledMods.txt
cat _pakkuInstalledMods.txt | grep -Ev "$pattern" > _pakkuInstalledMods_filtered.txt

echo "Filtered out Pakku entries:"
diff -y --suppress-common-lines _pakkuInstalledMods.txt _pakkuInstalledMods_filtered.txt