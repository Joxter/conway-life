import { combine, createEffect, createEvent, createStore, sample } from "effector";
import { allTemplates } from "../../blueprints/all-templates";
import { fuzzy, newFaunaDataFromRle, objEntries } from "../../utils";
import { Pattern } from "../../types";
import { parseRleFile } from "../../importExport/utils";
import { FaunaData } from "../../model/field";

type CatItem = Omit<Pattern, "rle"> & { image: string };

export const orderOptions = [
  "name-asc",
  "name-desc",
  "size-asc",
  "size-desc",
  "population-asc",
  "population-desc",
] as const;
export type OrderBy = (typeof orderOptions)[number];

export const catalogue = createCatalogue();

export function createCatalogue() {
  const PAGE_SIZE = 50;

  const $search = createStore("");
  const $orderBy = createStore<OrderBy>(orderOptions[0]);
  const setSearch = createEvent<string>();
  const selectPattern = createEvent<string>(); // filename
  const loadInitPattern = createEvent<string>(); // filename

  const $isOpen = createStore(false);
  const open = createEvent();
  const close = createEvent();

  const $currentPattern = createStore("");
  const currentPatternClicked = createEvent<any>();
  const orderByChanged = createEvent<OrderBy>();

  $isOpen.on([open, currentPatternClicked], () => true).on([close, selectPattern], () => false);
  $search.on([setSearch, currentPatternClicked], (_, newSearch) => newSearch);
  $orderBy.on(orderByChanged, (_, newOrderBy) => newOrderBy);

  sample({ source: $currentPattern, clock: currentPatternClicked, target: $search });

  const $items = createStore<CatItem[]>(
    objEntries(allTemplates)
      .map(([key, patt]) => {
        return {
          image: `https://cerestle.sirv.com/Images/png/${patt.fileName.replace(".rle", "")}.png`,
          ...patt,
        };
      })
  );
  const $offset = createStore(0);

  const $filteredItems = combine($search, $items, $orderBy, (search, items) => {
    search = search.toLowerCase().trim();
    if (!search) {
      return items;
    }

    return searchItems(items, search);
  });
  const $foundCnt = $filteredItems.map((items) => items.length);

  const $orderedItems = combine($filteredItems, $orderBy, (items, orderBy) => {
    return ([] as CatItem[]).concat(
      items.sort((a, b) => {
        switch (orderBy) {
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "name-desc":
            return b.name.localeCompare(a.name);
          case "size-asc":
            return a.size[0] * a.size[1] - b.size[0] * b.size[1];
          case "size-desc":
            return b.size[0] * b.size[1] - a.size[0] * a.size[1];
          case "population-asc":
            return a.population - b.population;
          case "population-desc":
            return b.population - a.population;
        }
      }),
    );
  });

  const $pageItems = combine($search, $orderedItems, $offset, (search, items, offset) => {
    if (!search) {
      return items.slice(offset, offset + PAGE_SIZE);
    }
    return items.slice(0, PAGE_SIZE);
  });

  const fetchPatternFx = createEffect(apiFetchPattern);

  const patternFetched = fetchPatternFx.doneData;

  $currentPattern.on(patternFetched, (_, { pattern }) => {
    return pattern.fileName;
  });

  fetchPatternFx.fail.watch(({ params, error }) => {
    if (typeof error === "string") {
      alert(error);
    } else {
      console.error(error);
      alert("Failed to fetch pattern: " + params);
    }
  });

  sample({ clock: [selectPattern, loadInitPattern], target: fetchPatternFx });

  selectPattern.watch((filename) => {
    window.location.hash = filename;
  });

  return {
    $pageItems,
    $foundCnt,

    $orderBy,
    orderByChanged,

    $currentPattern,
    currentPatternClicked,

    $isOpen,
    open,
    close,

    $search,
    setSearch,
    selectPattern,

    loadInitPattern,
    patternFetched,
  };
}

function apiFetchPattern(fileName: string): Promise<{ pattern: Pattern; faunaData: FaunaData }> {
  return fetch("patterns/" + fileName)
    .then((res) => {
      return res.text();
    })
    .then((rleFile): { pattern: Pattern; faunaData: FaunaData } => {
      let pattern = parseRleFile(rleFile, fileName);

      let faunaData = newFaunaDataFromRle(pattern.rle);

      return { faunaData, pattern };
    });
}

export function rankItems(item: CatItem, query: string): number {
  if (item.name.toLowerCase() === query) return 100;
  if (item.fileName.toLowerCase() === query) return 50;

  return fuzzy(item.name.toLowerCase(), query);
}

function searchItems(items: CatItem[], search: string): CatItem[] {
  return items
    .map((item) => {
      return { score: rankItems(item, search), ...item };
    })
    .sort((a, b) => {
      if (a.score < b.score) {
        return 1;
      }
      if (a.score > b.score) {
        return -1;
      }
      return 0;
    })
    .filter(({ score }) => {
      return score > 0;
    });
}
