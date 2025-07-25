import { ControllablePopup } from './controllablePopup'
import { mapColors } from '@/theme/color'
import { questionTitles } from '@/libs/constants'
import { Pin } from '@/types/pin'
import { HappinessTitle } from '../happiness/happiness-title'

export const MePopup = ({
  pin,
  initialPopupPin,
  setSelectedPin,
}: {
  pin: Pin
  initialPopupPin: Pin | undefined
  setSelectedPin: React.Dispatch<React.SetStateAction<Pin | null>>
}) => {
  return (
    <ControllablePopup
      isOpened={pin.id === initialPopupPin?.id}
      position={[pin.latitude, pin.longitude]}
    >
      <HappinessTitle
        type="popup"
        title={questionTitles.happiness1 }
        color={mapColors.BLUE[0]}
        selected={pin.answer1 === 1}
      />
      <HappinessTitle
        type="popup"
        title={questionTitles.happiness2}
        color={mapColors.GREEN[0]}
        selected={pin.answer2 === 1}
      />
      <HappinessTitle
        type="popup"
        title={questionTitles.happiness3}
        color={mapColors.VIOLET[0]}
        selected={pin.answer3 === 1}
      />
      <HappinessTitle
        type="popup"
        title={questionTitles.happiness4}
        color={mapColors.YELLOW[0]}
        selected={pin.answer4 === 1}
      />
      <HappinessTitle
        type="popup"
        title={questionTitles.happiness5}
        color={mapColors.ORANGE[0]}
        selected={pin.answer5 === 1}
      />
      <HappinessTitle
        type="popup"
        title={questionTitles.happiness6}
        color={mapColors.RED[0]}
        selected={pin.answer6 === 1}
      />
      {pin.memo !== undefined && (
        <div
          style={{
            marginTop: '5px',
            fontWeight: 'bolder',
          }}
        >
          {pin.memo.length > 10 ? (
            <>
              {pin.memo.slice(0, 10)}…
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
            pin.memo
          )}
        </div>
      )}
      {pin.basetime && (
        <div style={{ textAlign: 'right', marginTop: '5px' }}>
          回答日時：
          {pin.timestamp}
        </div>
      )}
    </ControllablePopup>
  )
}
