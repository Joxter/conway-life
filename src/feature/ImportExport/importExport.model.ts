import { createEffect, createEvent, createStore, sample } from "effector";
import { fixRleFile, rleToFauna } from "../../importExport/utils";

export function createImportExport() {
  const $textField = createStore("");
  const $isOpen = createStore(false);
  const open = createEvent<any>();
  const close = createEvent<any>();

  const exportFieldChanged = createEvent<any>();

  const exportClicked = createEvent<any>();
  const importClicked = createEvent<any>();

  $textField.on(exportFieldChanged, (_, val) => val);
  $isOpen.on(open, () => true).on([close, importClicked], () => false);

  let importToFaunaFx = createEffect((content: string) => {
    let fixed = fixRleFile(content);

    if (fixed.isErr()) {
      throw new Error(fixed.unwrapErr());
    }
    let rle = fixed.unwrap().split("\n").at(-1)!;

    return rleToFauna(rle).unwrap();
  });

  sample({
    source: $textField,
    clock: importClicked,
    target: importToFaunaFx,
  });

  return {
    $textField,
    $isOpen,
    open,
    close,
    exportClicked,
    importClicked,
    exportFieldChanged,
    imported: {
      ok: importToFaunaFx.doneData,
      err: importToFaunaFx.failData,
    },
  };
}
