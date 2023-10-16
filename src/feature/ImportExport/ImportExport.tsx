import { useUnit } from "effector-solid";
import { Modal } from "../../components/Modal/Modal";
import { WhiteBox } from "../../components/WhiteBox/WhiteBox";
import { importExport } from "../../model/app";

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
          <button onClick={importExport.exportClicked}>Export</button>
          <button onClick={importExport.importClicked}>Import</button>
        </div>
        <textarea
          onChange={(ev) => importExport.exportFieldChanged(ev.target.value)}
          style={{ width: "100%" }}
          value={exported()}
        ></textarea>
      </WhiteBox>
    </Modal>
  );
}
