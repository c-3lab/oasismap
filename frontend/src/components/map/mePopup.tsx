import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Popup } from 'react-leaflet'
import { mapColors } from '@/theme/color'
import { questionTitles } from './map'
import { Pin } from '@/types/pin'

type HappinessTitleProps = {
  title: string
  color: string
  selected: boolean
}

const HappinessTitle: React.FC<HappinessTitleProps> = ({
  title,
  color,
  selected,
}) => {
  return (
    <div style={{ display: 'flex' }}>
      {selected && (
        <CheckCircleIcon
          sx={{
            fontSize: 'large',
            color: color,
          }}
        />
      )}
      <a
        style={{
          fontSize: '15px',
          fontWeight: 'bolder',
          color: selected ? color : 'black',
          opacity: selected ? 1 : 0.3,
          marginLeft: selected ? '0px' : '18px',
        }}
      >
        {title}
      </a>
    </div>
  )
}

export const MePopup = ({
  pin,
  setSelectedPin,
}: {
  pin: Pin
  setSelectedPin: React.Dispatch<React.SetStateAction<Pin | null>>
}) => {
  return (
    <Popup>
      <HappinessTitle
        title={questionTitles.happiness1}
        color={mapColors.BLUE[0]}
        selected={pin.answer1 === 1}
      />
      <HappinessTitle
        title={questionTitles.happiness2}
        color={mapColors.GREEN[0]}
        selected={pin.answer2 === 1}
      />
      <HappinessTitle
        title={questionTitles.happiness3}
        color={mapColors.VIOLET[0]}
        selected={pin.answer3 === 1}
      />
      <HappinessTitle
        title={questionTitles.happiness4}
        color={mapColors.YELLOW[0]}
        selected={pin.answer4 === 1}
      />
      <HappinessTitle
        title={questionTitles.happiness5}
        color={mapColors.ORANGE[0]}
        selected={pin.answer5 === 1}
      />
      <HappinessTitle
        title={questionTitles.happiness6}
        color={mapColors.RED[0]}
        selected={pin.answer6 === 1}
      />
      {pin.memo !== undefined && (
        <div
          style={{
            marginTop: '4px',
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
        <div
          style={{ textAlign: 'right', fontWeight: 'normal', marginTop: '5px' }}
        >
          回答日時：
          {pin.timestamp}
        </div>
      )}
    </Popup>
  )
}
