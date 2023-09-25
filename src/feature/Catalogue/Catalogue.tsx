import { useUnit } from "effector-solid";
import commonCss from "../../components/styles.module.css";
import css from "./styles.module.css";
import { catalogue, orderOptions } from "./Catalogue.model";
import { Modal } from "../../components/Modal/Modal";
import { JSX } from "solid-js/types/jsx";
import { createEffect } from "solid-js";

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
  const [search, pageItems, cnt, isOpen, orderBy] = useUnit([
    catalogue.$search,
    catalogue.$pageItems,
    catalogue.$foundCnt,
    catalogue.$isOpen,
    catalogue.$orderBy,
  ]);

  let listEl: HTMLDivElement;
  createEffect(() => {
    search();
    listEl.scrollTo(0, 0);
  });

  return (
    <Modal open={isOpen()} close={catalogue.close}>
      <div
        class={commonCss.roundBox}
        style={{
          display: "grid",
          "grid-auto-rows": "auto 1fr auto",
          width: "min(900px, calc(100vw - 50px))",
          height: "min(600px, calc(100vh - 100px))",
          "background-color": "#eee",
        }}
      >
        <div class={css.header}>
          <input
            type="text"
            onInput={(ev) => {
              catalogue.setSearch(ev.target.value);
            }}
            placeholder={"search"}
            value={search()}
          />
          <div>
            <span>
              sort by:{" "}
              <select
                value={orderBy()}
                onChange={(ev) => catalogue.orderByChanged(ev.target.value as any)}
              >
                {orderOptions.map((val) => {
                  return <option value={val}>{val}</option>;
                })}
              </select>
            </span>
          </div>
        </div>
        <div class={css.list} ref={(el) => (listEl = el)}>
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
                      size:{" "}
                      <b>
                        {it.size[0]}x{it.size[1]}
                      </b>
                      ; population: <b>{it.population}</b>
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
        <div>
          <p>found: {cnt()}</p>
        </div>
      </div>
    </Modal>
  );
};
