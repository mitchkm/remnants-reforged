#!/usr/bin/env bash

.scripts/updatePakkuModList.sh > _modParityCheck.txt
cat _modParityCheck.txt > _modParityCheckTemp1.txt
echo >> _modParityCheck.txt
.scripts/diffMods.sh _pakkuInstalledMods_filtered.txt _desiredMods.txt >> _modParityCheck.txt
echo "===============================================================" >> _modParityCheckTemp1.txt
cat _pakkuInstalledMods_filtered.txt >> _modParityCheckTemp1.txt
cat _modParityCheckTemp1.txt > _pakkuInstalledMods.txt

rm _modParityCheckTemp1.txt
rm _pakkuInstalledMods_filtered.txt

echo "_modParityCheck.txt created"
echo "_pakkuInstalledMods.txt created"