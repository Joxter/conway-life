import { combine, createEvent, createStore, sample } from "effector";
import { fuzzy } from "../../utils";
import { useUnit } from "effector-solid";
import css from "../styles.module.css";
import { allTemplates } from "../../blueprints/all-templates";

const $search = createStore("");
const setSearch = createEvent<string>();

$search.on(setSearch, (_, newSearch) => newSearch);

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

const $pageItems = $filteredItems.map((items) => items.slice(0, 20));

export const Catalogue = () => {
  const [search, filteredItems, pageItems] = useUnit([$search, $filteredItems, $pageItems]);

  return (
    <div class={css.modal}>
      <div
        class={css.roundBox}
        style={{
          width: "600px",
          "background-color": "#eee",
        }}
      >
        <input
          type="text"
          style={{ width: "100%" }}
          onInput={(ev) => {
            setSearch(ev.target.value);
          }}
          value={search()}
        />
        <p>found: {filteredItems().length}</p>
        <div
          style={{
            display: "grid",
            "flex-wrap": "wrap",
            gap: "4px",
            "margin-top": "12px",
            "max-height": "400px",
            overflow: "scroll",
          }}
        >
          {pageItems().map((it) => {
            return (
              <div
                style={{
                  display: "grid",
                  "grid-template-columns": "120px 1fr",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    "background-color": "#fff",
                    "border-radius": "4px",
                    width: "120px",
                    height: "120px",
                    "background-image": `url("${it.image}")`,
                    "background-position": "center",
                    "background-repeat": "no-repeat",
                    "background-size": "contain",
                    "image-rendering": "pixelated",
                  }}
                ></div>
                <div>
                  <p>{it.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
