import { combine, createEvent, createStore } from "effector";
import { allTemplates } from "../../blueprints/all-templates";
import { fuzzy } from "../../utils";

type CatItem = {
  image: string;
  name: string;
  id: string;
};

export const catalogue = createCatalogue();

export function createCatalogue() {
  const $search = createStore("");
  const setSearch = createEvent<string>();
  const selectPattern = createEvent<string>();

  $search.on(setSearch, (_, newSearch) => newSearch).reset(selectPattern);

  const $isOpen = createStore(false);
  const open = createEvent();
  const close = createEvent();

  $isOpen.on(open, () => true).on([close, selectPattern], () => false);

  const $items = createStore<CatItem[]>(
    allTemplates.map((name, i) => {
      return {
        image: `https://cerestle.sirv.com/Images/${name}.png`,
        name: name,
        id: String(i),
      };
    }),
  );
  const $offset = createStore(0);

  $offset.on(open, () => {
    return Math.floor(Math.random() * (allTemplates.length - 20));
  });

  const $filteredItems = combine($search, $items, (search, items) => {
    search = search.toLowerCase().trim();
    if (!search) {
      return items;
    }

    return items
      .map((item) => {
        return { score: fuzzy(item.name.toLowerCase(), search), ...item };
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
  });

  const $foundCnt = $filteredItems.map((items) => items.length);

  const $pageItems = combine($search, $filteredItems, $offset, (search, items, offset) => {
    if (!search) {
      return items.slice(offset, offset + 20);
    }
    return items.slice(0, 20);
  });

  return {
    $pageItems,
    $foundCnt,

    $isOpen,
    open,
    close,

    $search,
    setSearch,
    selectPattern,
  };
}
