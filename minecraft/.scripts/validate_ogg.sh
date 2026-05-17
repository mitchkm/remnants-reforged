#!/usr/bin/env bash

DIR="${1:-.}"

# Resolve absolute path
DIR="$(realpath "$DIR")"

if [[ ! -d "$DIR" ]]; then
    echo "Directory does not exist: $DIR"
    exit 1
fi

LOG="$DIR/ogg_validation.log"

# Clear previous log
> "$LOG"

VALID_COUNT=0
INVALID_COUNT=0

while IFS= read -r -d '' file; do
    CANONICAL_FILE="$(realpath "$file")"

    # echo "Checking: $CANONICAL_FILE"

    # OUTPUT=$(ffmpeg -nostdin -i "$CANONICAL_FILE" -f null -err_detect +crccheck+bitstream+buffer+explode+careful+compliant+aggressive -v warning -xerror - 2>&1)
    OUTPUT=$(ogginfo "$CANONICAL_FILE" 2>&1)

    STATUS=$?

    if [[ $STATUS -eq 0 ]]; then
        # echo "  OK"
        ((VALID_COUNT++))
    else
        # echo "  INVALID"
        echo "INVALID: $CANONICAL_FILE"
        ((INVALID_COUNT++))
    fi
    {
        echo "=================================================="
        echo "FILE: $CANONICAL_FILE"
        echo "TIME: $(date)"
        echo "STATUS: $STATUS"
        echo "--------------------------------------------------"
        echo "$OUTPUT"
        echo
    } >> "$LOG"

done < <(find "$DIR" -type f -iname "*.ogg" -print0)

echo
echo "Validation complete."
echo "Valid files:   $VALID_COUNT"
echo "Invalid files: $INVALID_COUNT"
echo "Detailed log:  $LOG"