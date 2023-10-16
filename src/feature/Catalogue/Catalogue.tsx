import { useUnit } from "effector-solid";
import commonCss from "../../components/styles.module.css";
import css from "./styles.module.css";
import { catalogue, orderOptions } from "./Catalogue.model";
import { Modal } from "../../components/Modal/Modal";
import { JSX } from "solid-js/types/jsx";
import { createEffect, For, on } from "solid-js";
import { Checkbox } from "../../components/Form";
import { AllPatTypes, Pattern } from "../../types";

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
  const [search, pageItems, cnt, isOpen, orderBy, patType] = useUnit([
    catalogue.$search,
    catalogue.$pageItems,
    catalogue.$foundCnt,
    catalogue.$isOpen,
    catalogue.$orderBy,
    catalogue.$type,
  ]);

  let listEl: HTMLDivElement;

  createEffect(
    on([search, isOpen, orderBy, patType], () => {
      listEl.scrollTo(0, 0);
    }),
  );

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
            <p class={css.types}>
              <b>Type:</b>
              {AllPatTypes.map((name) => {
                return (
                  <Checkbox
                    label={name}
                    value={patType()[name]}
                    onChange={(v) => catalogue.typeChanged({ [name]: v })}
                  />
                );
              })}
            </p>
          </div>
        </div>
        <div class={css.list} ref={(el) => (listEl = el)}>
          <For each={isOpen() ? pageItems() : null}>
            {(it) => {
              return (
                <div class={css.listItem}>
                  <img src={it.image} loading={"lazy"} class={css.patternPreview} />
                  <div>
                    <p>
                      <button onClick={() => catalogue.selectPattern(it.fileName)}>OPEN</button>{" "}
                      <b>{it.name}</b>
                    </p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <p>
                        size:{" "}
                        <b>
                          {it.size[0]}x{it.size[1]}
                        </b>
                        ; population: <b>{it.population}</b>
                        ; type: <PatType type={it.type} />
                      </p>
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
            }}
          </For>
        </div>
        <div>
          <p>found: {cnt()}</p>
        </div>
      </div>
    </Modal>
  );
};

function PatType(props: { type: Pattern["type"] }) {
  if (!props.type) {
    return <span>unknown</span>;
  }

  if (props.type.name === "still-live") {
    return <b>still live</b>;
  }
  if (props.type.name === "oscillator") {
    return <b>oscillator ({props.type.period})</b>;
  }
  if (props.type.name === "will-die") {
    return <b>will-die ({props.type.gen})</b>;
  }
  if (props.type.name === "ship") {
    return <b>ship ({props.type.period})</b>;
  }
  if (props.type.name === "gun") {
    return <b>gun ({props.type.period})</b>;
  }
  if (props.type.name === "stable-at") {
    return (
      <b>
        stable-at (gen {props.type.gen} per{props.type.period})
      </b>
    );
  }
  if (props.type.name === "unknown") {
    return <b>unknown</b>;
  }

  let a: never = props.type;
}
