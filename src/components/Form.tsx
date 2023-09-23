export function Checkbox(props: {
  label: string;
  value: boolean;
  onChange: (val: boolean) => any;
}) {
  return (
    <label>
      {props.label}
      <input
        type="checkbox"
        checked={props.value}
        onChange={(ev) => props.onChange(ev.target.checked)}
      />
    </label>
  );
}
