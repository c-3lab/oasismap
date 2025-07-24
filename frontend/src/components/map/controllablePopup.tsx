type Props = {
  children: React.ReactNode
  isOpened: boolean
  position: [number, number]
}

export const ControllablePopup = ({ children, isOpened, position }: Props) => {
  // Simply return content - let the Marker handle popup opening/closing
  return (
    <div>
      {children}
    </div>
  )
}
