#!/usr/bin/env bash

FILE1="$1"
FILE2="$2"

if [[ -z "$FILE1" || -z "$FILE2" ]]; then
    echo "Usage: $0 <file1> <file2>"
    exit 1
fi

# Verify files exist
if [[ ! -f "$FILE1" ]]; then
    echo "Error: File does not exist: $FILE1"
    exit 1
fi

if [[ ! -f "$FILE2" ]]; then
    echo "Error: File does not exist: $FILE2"
    exit 1
fi

###############################################################################
# Read FILE2 IDs into lookup table
###############################################################################

declare -A FILE2_IDS

while IFS= read -r line; do
    if [[ $line =~ (cf|mr)=([^[:space:]]+) ]]; then
        id="${BASH_REMATCH[2]}"
        FILE2_IDS["$id"]=1
    fi
done < "$FILE2"

###############################################################################
# FILE1 lines missing from FILE2
###############################################################################

echo "=== Mods installed but not in desired list ==="

while IFS= read -r line; do

    mapfile -t ids < <(
        grep -oP '(?:\[(?:cf|mr)\s*,\s*(?:cf|mr)\]|cf|mr)\s*=\s*[^,}\s]+' <<< "$line" \
        | grep -oP '[^=]+$' \
        | sed -E 's/[},]+$//'
    )

    [[ ${#ids[@]} -eq 0 ]] && continue

    matched=0

    for id in "${ids[@]}"; do
        if [[ -v FILE2_IDS[$id] ]]; then
            FILE2_IDS["$id"]=0
            matched=1
            break
        fi
    done

    if [[ $matched -eq 0 ]]; then
        echo "$line"
    fi

done < "$FILE1"

###############################################################################
# FILE2 lines missing from FILE1 groups
###############################################################################

echo
echo "=== Desired mods not yet installed (from Obsidian list) ==="

while IFS= read -r line; do
    if [[ $line =~ (cf|mr)=([^[:space:]]+) ]]; then
        id="${BASH_REMATCH[2]}"
        if [[ FILE2_IDS[$id] -eq 1 ]]; then
            echo "$line"
        fi
    fi
done < "$FILE2" | sort

###############################################################################
# FILE2 lines found in FILE1
###############################################################################

echo
echo "=== Mods installed (from Obsidian list) ==="

while IFS= read -r line; do
    if [[ $line =~ (cf|mr)=([^[:space:]]+) ]]; then
        id="${BASH_REMATCH[2]}"
        if [[ FILE2_IDS[$id] -eq 0 ]]; then
            echo "$line"
        fi
    fi
done < "$FILE2" | sort