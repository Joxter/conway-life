import { combine, createEvent, createStore, sample } from "effector";
import { fuzzy } from "../../utils";
import { useUnit } from "effector-solid";
import commonCss from "../styles.module.css";
import css from "./styles.module.css";
import { allTemplates } from "../../blueprints/all-templates";

const $search = createStore("");
const setSearch = createEvent<string>();

export const selectPattern = createEvent<string>();

$search.on(setSearch, (_, newSearch) => newSearch).reset(selectPattern);

const $isOpen = createStore(false);
const open = createEvent();
const close = createEvent();
$isOpen.on(open, () => true).on([close, selectPattern], () => false);

type CatItem = {
  image: string;
  name: string;
  id: string;
};

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

const $filteredItems = combine($search, $items, $offset, (search, items, offset) => {
  search = search.toLowerCase().trim();
  if (!search) {
    return items.slice(offset, offset + 20);
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

const $pageItems = $filteredItems.map((items) => items.slice(0, 20));

export const Catalogue = () => {
  const [search, filteredItems, pageItems, isOpen] = useUnit([
    $search,
    $filteredItems,
    $pageItems,
    $isOpen,
  ]);

  return (
    <>
      <div
        class={commonCss.whiteBox}
        style={{ position: "absolute", bottom: "90px", left: "10px" }}
      >
        <button onClick={() => open()}>search</button>
      </div>
      <div class={commonCss.modal} style={{ display: isOpen() ? "initial" : "none" }}>
        <div
          class={commonCss.roundBox}
          style={{
            display: "grid",
            "grid-auto-rows": "auto 1fr",
            width: "min(800px, calc(100vw - 50px))",
            height: "min(600px, calc(100vh - 100px))",
            "background-color": "#eee",
          }}
        >
          <div style={{ display: "flex" }}>
            <input
              type="text"
              style={{ width: "100%" }}
              onInput={(ev) => {
                setSearch(ev.target.value);
              }}
              value={search()}
            />
            <p>found: {filteredItems().length}</p>
            <button onClick={() => close()}>close</button>
          </div>
          <div class={css.list}>
            {pageItems().map((it) => {
              return (
                <div class={css.listItem}>
                  <div
                    style={{
                      "background-image": `url("${it.image}")`,
                    }}
                    class={css.patternPreview}
                  />
                  <div>
                    <div style={{ display: "grid" }}>
                      <p
                        style={{
                          "text-overflow": "ellipsis",
                          overflow: "hidden",
                          "white-space": "nowrap",
                        }}
                      >
                        {it.name}
                      </p>
                    </div>
                    <button onClick={() => selectPattern(it.name)}>select</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
