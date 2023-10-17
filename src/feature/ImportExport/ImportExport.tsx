import { useUnit } from "effector-solid";
import { Modal } from "../../components/Modal/Modal";
import { WhiteBox } from "../../components/WhiteBox/WhiteBox";
import { importExport } from "../../model/app";
import css from "./styles.module.css";

export function ImportExportButton() {
  return <button onClick={importExport.open}>import/export</button>;
}

export function ImportExportModal() {
  let [exported, isOpen] = useUnit([importExport.$textField, importExport.$isOpen]);

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
          onChange={(ev) => importExport.exportFieldChanged(ev.target.value)}
          style={{ width: "100%" }}
          value={exported()}
        ></textarea>
        <div style={{ display: "flex", "justify-content": "space-between", "margin-top": "8px" }}>
          <button class={css.buttons} onClick={importExport.exportClicked}>
            Generate RLE
          </button>
          <button class={css.buttons} onClick={importExport.importClicked}>
            Import from RLE
          </button>
        </div>
      </WhiteBox>
    </Modal>
  );
}
