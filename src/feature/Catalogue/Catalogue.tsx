import { useUnit } from "effector-solid";
import commonCss from "../../components/styles.module.css";
import css from "./styles.module.css";
import { catalogue } from "./Catalogue.model";

export const Catalogue = () => {
  const [search, pageItems, cnt, isOpen] = useUnit([
    catalogue.$search,
    catalogue.$pageItems,
    catalogue.$foundCnt,
    catalogue.$isOpen,
  ]);

  return (
    <>
      <div
        class={commonCss.whiteBox}
        style={{ position: "absolute", bottom: "90px", left: "10px" }}
      >
        <button onClick={() => catalogue.open()}>Catalogue</button>
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
                    <button onClick={() => catalogue.selectPattern(it.name)}>select</button>
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
