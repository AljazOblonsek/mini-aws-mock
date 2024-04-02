#!/bin/bash

# Check if there's exactly one file in the /assets folder
file_count=$(ls -1 ./packages/web/dist/assets/*.js | wc -l)
if [ "$file_count" -ne 1 ]; then
    echo "Error: Expected exactly one .js file in the /assets folder, found $file_count."
    exit 1
fi

# Get the filename
filename=$(ls ./packages/web/dist/assets/*.js)

# Read the content of the file
file_content=$(<"$filename")

# Replace "@nestjs/swagger" with "my-swagger"
modified_content=${file_content//@nestjs\/swagger/.\/nestjs-swagger.shim.js}

# Write the modified content back to the file
echo "$modified_content" > "$filename"

echo "Web index js file modified - replaced `@nestjs/swagger` with `./nestjs-swagger.shim.js`."
