type Props = {
  children: React.ReactNode
  isOpened: boolean
  position: [number, number]
}

export const ControllablePopup = ({ children }: Props) => {
  return <div>{children}</div>
}
