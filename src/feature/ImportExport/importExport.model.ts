import { createEvent, createStore } from "effector";

export const importExport = createImportExport();

function createImportExport() {
  const $textField = createStore("");
  const $isOpen = createStore(false);
  const open = createEvent<any>();
  const close = createEvent<any>();

  const exportFieldChanged = createEvent<any>();

  const exportClicked = createEvent<any>();
  const importClicked = createEvent<any>();

  $textField.on(exportFieldChanged, (_, val) => val);
  $isOpen.on(open, () => true).on([close, importClicked], () => false);

  return {
    $textField,
    $isOpen,
    open,
    close,
    exportClicked,
    importClicked,
    exportFieldChanged,
  };
}
