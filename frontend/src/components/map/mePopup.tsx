import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Popup } from 'react-leaflet'
import { graphColors } from '@/theme/color'
import { questionTitles } from './map'
import { Pin } from '@/types/pin'

type PinProps = {
  title: string
  color: string
  selected: boolean
}

const HappinessTitle: React.FC<PinProps> = ({ title, color, selected }) => {
  return (
    <div style={{ display: 'flex' }}>
      {selected === true && (
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
          color: color,
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
        color={graphColors[0]}
        selected={pin.answer1 === 1}
      />
      <HappinessTitle
        title={questionTitles.happiness2}
        color={graphColors[1]}
        selected={pin.answer2 === 1}
      />
      <HappinessTitle
        title={questionTitles.happiness3}
        color={graphColors[2]}
        selected={pin.answer3 === 1}
      />
      <HappinessTitle
        title={questionTitles.happiness4}
        color={graphColors[3]}
        selected={pin.answer4 === 1}
      />
      <HappinessTitle
        title={questionTitles.happiness5}
        color={graphColors[4]}
        selected={pin.answer5 === 1}
      />
      <HappinessTitle
        title={questionTitles.happiness6}
        color={graphColors[5]}
        selected={pin.answer6 === 1}
      />
      {pin.memo !== undefined && (
        <div
          style={{
            marginTop: '4px',
          }}
        >
          <h4>
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
          </h4>
        </div>
      )}
      {pin.basetime && (
        <div
          style={{
            marginTop: '4px',
            marginLeft: '30%',
          }}
        >
          <h5>
            回答日時：
            {pin.timestamp}
          </h5>
        </div>
      )}
    </Popup>
  )
}
