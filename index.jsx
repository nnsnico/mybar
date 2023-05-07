import {css, React} from 'uebersicht'

export const command = `
BATTERY=$(pmset -g batt | egrep '(\\d+)\%' -o | cut -f1 -d%)
IS_CHARGING=$(if [[ $(pmset -g ps | head -1) =~ "AC" ]]; then echo "true"; else echo "false"; fi)

volume=$(osascript -e 'output volume of (get volume settings)')
if [[ $volume != "missing value" ]]; then
  VOLUME=$volume
else
  VOLUME='"Device could not be detected"'
fi

is_muted=$(osascript -e 'output muted of (get volume settings)')
if [[ $is_muted != "missing value" ]]; then
  IS_MUTED=$is_muted
else
  IS_MUTED='false'
fi

SSID=$(/System/Library/PrivateFrameworks/Apple80211.framework/Resources/airport -I | awk -F': ' '/ SSID/ {print $2}')
WIFI_STATUS=$(if [ -n "$(/System/Library/PrivateFrameworks/Apple80211.framework/Versions/A/Resources/airport -I | grep AirPort | cut -d ':' -f2)" ]; then echo "false"; else echo "true"; fi)

echo $(cat <<-EOF
{
    "volume": $VOLUME,
    "ismuted": $IS_MUTED,
    "ssid": "$SSID",
    "wifistatus": $WIFI_STATUS,
    "ischarging": $IS_CHARGING
}
EOF
);
`

export const className = `
    @import url('https://cdn.jsdelivr.net/npm/hack-font@3/build/web/hack.css');
    @import url('font.css');
    bottom: 0;
    left: 0;
    width: 100%;
    height: 20px;
    padding-bottom: 1px;
    background-color: #202020;
    font-family: 'JetBrainsMono Nerd Font', monospace;
    font-size: 13px;
    color: #fafafa;
    whitespace: nowrap;
`

export const refreshFrequency = 1000

const componentStyle = css`
  left: 20px;
  top: 20p;
`

export const render = ({output}) => {
  const outputObj = parseOutput(output);
  return (
    <div style={{width: '100%', bottom: 2, overflow: 'hidden', position: 'fixed'}}>
      <div style={{height: '100%', width: '100%', display: 'flex', justifyContent: 'space-evenly', whiteSpace: 'nowrap'}}>
        <div style={{flex: 1}} />
        <WiFi className={componentStyle} output={outputObj} />
        <div style={{width: '30px'}} />
        <Volume className={componentStyle} output={outputObj} />
        <div style={{width: '30px'}} />
        <Calendar className={componentStyle} />
        <div style={{width: '15px'}} />
      </div>
    </div>
  )
}

function toDayStr(day) {
  switch (day) {
    case 0:
      return 'Sunday'
    case 1:
      return 'Monday'
    case 2:
      return 'Tuesday'
    case 3:
      return 'Wednesday'
    case 4:
      return 'Thursday'
    case 5:
      return 'Friday'
    case 6:
      return 'Saturday'
    default:
      return ''
  }
}

function parseOutput(output) {
  try {
    return JSON.parse(output);
  } catch (err) {
    return '';
  }
}

class WiFi extends React.Component {
  render() {
    const output = this.props.output
    if (output.wifistatus) {
      if (output.ssid === '') {
        return (
          <div>
            <span style={{color: '#FFFF00'}}>{`\uDB82\uDC17`}</span>
            <span>{` Valid network does not exist`}</span>
          </div>
        )
      } else {
        return (
          <div>
            <span style={{color: '#76FF03'}}>{`\uDB81\uDDA9`}</span>
            <span>{` ${output.ssid}`}</span>
          </div>
        )
      }
    } else {
      return (
        <div>
          <span style={{color: '#FF4081'}}>{`\uDB81\uDDAA`}</span>
          <span>{` WiFi is disabled`}</span>
        </div>
      )
    }
  }
}

class Volume extends React.Component {
  render() {
    const output = this.props.output
    const format = () => {
      if (output.ismuted) {
        return `\uDB81\uDF5F MUTE`
      } else {
        if (output.volume === 0) {
          return `\uDB81\uDD7F ${output.volume}`
        } else if (output.volume <= 60) {
          return `\uDB81\uDD80 ${output.volume}`
        } else {
          return `\uDB81\uDD7E ${output.volume}`
        }
      }
    }
    return <div>{format()}</div>
  }
}

class Calendar extends React.Component {
  render() {
    const date = new Date();
    return (
      <div>{`\uDB80\uDCED ${date.toLocaleDateString()}(${toDayStr(date.getDay())})`}</div>
    )
  }
}
