# CrosswordCoach

A tool for drilling crossword clues quickly

## Running locally

To run the scraper (`scraping/src/index.ts`), go to the scraping directory (`cd scraping`) and run `npm run scrape`.

To run the storage "sandbox" file (`storage/src/index.ts`), go to the storage directory (`cd storage`) and run `npm run store`.

Alternatively, you can run these files with the debugger via the VSCode debug menu.

## Notes

Remember, scripts which only run locally use relative imports, which is ok because we run them directly with Node or `ts-node`. Built code uses aliases as defined by the `paths` section of `tsconfig.json`.
