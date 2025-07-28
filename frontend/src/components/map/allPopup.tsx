import { Box } from '@mui/material'
import { Session } from 'next-auth'
import { Pin } from '@/types/pin'
import { HappinessAllGraph } from '../happiness/happiness-all-graph'

export const AllPopup = ({
  pin,
  setSelectedPin,
}: {
  pin: Pin
  setSelectedPin: React.Dispatch<React.SetStateAction<Pin | null>>
  session: Session | null
}) => {
  if (pin.memos === undefined) {
    return
  }
  const memoArray: string[] = []
  {
    pin.memos.map((memo) => memoArray.push(memo.memo))
  }
  // Using div/Box instead of Popup for better control over styling and positioning
  return (
    <>
      <HappinessAllGraph data={pin} />
      {pin.memos !== undefined && (
        <Box sx={{ fontWeight: 'bolder' }}>
          {memoArray.filter(Boolean).join('').length > 15 ? (
            <>
              {memoArray.filter(Boolean).join(',').slice(0, 15)}…
              <button
                style={{
                  backgroundColor: 'transparent',
                  color: 'blue',
                  border: 'solid 0px',
                }}
                onClick={() => setSelectedPin(pin)}
              >
                もっと見る
              </button>
            </>
          ) : (
            memoArray
          )}
        </Box>
      )}
    </>
  )
}
