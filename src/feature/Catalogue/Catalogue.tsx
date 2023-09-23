import { useUnit } from "effector-solid";
import commonCss from "../../components/styles.module.css";
import css from "./styles.module.css";
import { catalogue } from "./Catalogue.model";
import { Modal } from "../../components/Modal/Modal";
import { JSX } from "solid-js/types/jsx";

export function CurrentPattern(props: { style: JSX.CSSProperties }) {
  const [currentPattern] = useUnit([catalogue.$currentPattern]);

  return (
    <a
      style={{ "font-style": "italic", ...props.style }}
      href={"#" + currentPattern()}
      onClick={catalogue.currentPatternClicked}
    >
      {currentPattern()}
    </a>
  );
}
export function CatalogueButton() {
  return <button onClick={() => catalogue.open()}>Catalogue</button>;
}

export const CatalogueModal = () => {
  const [search, pageItems, cnt, isOpen] = useUnit([
    catalogue.$search,
    catalogue.$pageItems,
    catalogue.$foundCnt,
    catalogue.$isOpen,
  ]);

  return (
    <Modal open={isOpen()} close={catalogue.close}>
      <div
        class={commonCss.roundBox}
        style={{
          display: "grid",
          "grid-auto-rows": "auto 1fr",
          width: "min(900px, calc(100vw - 50px))",
          height: "min(600px, calc(100vh - 100px))",
          "background-color": "#eee",
        }}
      >
        <div style={{ display: "flex" }}>
          <input
            type="text"
            style={{ width: "100%" }}
            onInput={(ev) => {
              catalogue.setSearch(ev.target.value);
            }}
            value={search()}
          />
          <p>found: {cnt()}</p>
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
                    <p>
                      <b>{it.name}</b>
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <p>
                      size: {it.size[0]}*{it.size[1]}
                    </p>
                    <button onClick={() => catalogue.selectPattern(it.fileName)}>OPEN</button>
                  </div>
                  {it.comment && <p>{it.comment}</p>}
                  {it.wikiLink && (
                    <a href={it.wikiLink} target={"_blank"}>
                      wiki
                    </a>
                  )}
                  {it.author && <p style={{ display: "grid" }}>{it.author}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
