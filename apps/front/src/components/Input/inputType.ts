export interface IFormValues {
  label?: string,
  handleChange: (a: React.ChangeEvent<HTMLInputElement>) => void,
  name: string,
  type: string,
  className?: string,
  placeholder?: string,
  handleBlur?: (e: React.FocusEvent<HTMLInputElement>) => void,
}