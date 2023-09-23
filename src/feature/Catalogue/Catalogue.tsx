import { useUnit } from "effector-solid";
import commonCss from "../../components/styles.module.css";
import css from "./styles.module.css";
import { catalogue } from "./Catalogue.model";

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

  document.onkeydown = function (ev) {
    if (isOpen() && ev.code == "Escape") {
      catalogue.close();
    }
  };

  return (
    <div
      class={commonCss.overlay}
      style={{ display: isOpen() ? "initial" : "none" }}
      onClick={(ev) => {
        if (ev.target.classList.contains(commonCss.overlay)) {
          catalogue.close();
        }
      }}
    >
      <div class={commonCss.modal}>
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
            <button onClick={() => catalogue.close()}>close</button>
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
                        <b>{it.derivedName}</b>
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
      </div>
    </div>
  );
};
