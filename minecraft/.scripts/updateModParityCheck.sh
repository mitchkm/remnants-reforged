#!/usr/bin/env bash

.scripts/updatePakkuModList.sh > _modParityCheck.txt
echo >> _modParityCheck.txt
.scripts/diffMods.sh _pakkuInstalledMods_filtered.txt _desiredMods.txt >> _modParityCheck.txt