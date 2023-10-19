import { useUnit } from "effector-solid";
import { Modal } from "../../components/Modal/Modal";
import { WhiteBox } from "../../components/WhiteBox/WhiteBox";
import { importExport } from "../../model/app";
import css from "./styles.module.css";
import { fixRleFile, parseNormRleFile } from "../../importExport/utils";

export function ImportExportButton() {
  return <button onClick={importExport.open}>import/export</button>;
}

export function ImportExportModal() {
  let [exported, isOpen] = useUnit([importExport.$textField, importExport.$isOpen]);

  function sizeAndPop() {
    let rle = exported().trim();

    if (!rle) {
      return "Enter something";
    }

    return fixRleFile(rle).match({
      ok: (normFile) => {
        let pattern = parseNormRleFile(normFile, "imported");

        let { population, size } = pattern;
        return `x = ${size[0]}, y = ${size[1]}, population = ${population}`;
      },
      err: (err) => {
        return `Err: ${err}`;
      },
    });
  }

  return (
    <Modal open={isOpen()} close={importExport.close}>
      <WhiteBox
        style={{
          position: "relative",
          width: "min(600px, calc(100vw - 50px))",
          height: "min(600px, calc(100vh - 100px))",
          display: "grid",
          "grid-template-rows": "auto 1fr",
        }}
      >
        <div>
          <h2>Import/Export RLE</h2>
        </div>
        <textarea
          onInput={(ev) => importExport.exportFieldChanged(ev.target.value)}
          style={{ width: "100%" }}
          value={exported()}
        ></textarea>
        <div>
          <p>{sizeAndPop()}</p>
          <div style={{ display: "flex", "justify-content": "space-between", "margin-top": "8px" }}>
            <button class={css.buttons} onClick={importExport.exportClicked}>
              Generate RLE
            </button>
            <button
              classList={{ [css.buttons]: true, [css.disabled]: exported().trim().length === 0 }}
              onClick={importExport.importClicked}
            >
              Import
            </button>
          </div>
        </div>
      </WhiteBox>
    </Modal>
  );
}
