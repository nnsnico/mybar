import { React } from 'uebersicht'

export const command = `
BATTERY=$(pmset -g batt | egrep '(\\d+)\%' -o | cut -f1 -d%)
IS_CHARGING=$(if [[ $(pmset -g ps | head -1) =~ "AC" ]]; then echo "true"; else echo "false"; fi)

VOLUME=$(osascript -e 'output volume of (get volume settings)')
IS_MUTED=$(osascript -e 'output muted of (get volume settings)')

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

export const className=`
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

const style = {
  left: "20px",
  top: "20px"
}

export const render = ({ output }) => {
  const outputObj = parseOutput(output);
  return (
    <div style={{width:'100%', bottom: 2, overflow: 'hidden', position: 'fixed'}}>
      <div style={{height: '100%', width: '100%', display: 'flex', justifyContent: 'space-evenly', whiteSpace: 'nowrap'}}>
        <WiFi style={style} output={outputObj}/>
        <Volume style={style} output={outputObj}/>
        <Calendar style={style} />
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
          <div>{`\uFD15 Valid network does not exist`}</div>
        )
      } else {
        return (
          <div>{`\uFAA8 WiFi: ${output.ssid}`}</div>
        )
      }
    } else {
      return (
        <div>{`\uFAA9 WiFi is disabled`}</div>
      )
    }
  }
}

class Volume extends React.Component {
  render() {
    const output = this.props.output
    const volumeIcon = () => {
      if (output.ismuted) {
        return '\uFC5D'
      } else {
        if (output.volume === 0) {
          return '\uFA7E'
        } else if (output.volume <= 60) {
          return '\uFA7F'
        } else {
          return '\uFA7D'
        }
      }
    }
    return (
      <div>{`${volumeIcon()} VOLUME: ${output.volume}, MUTE: ${output.ismuted ? "ON" : "OFF"}`}</div>
    )
  }
}

class Calendar extends React.Component {
  render() {
    const date = new Date();
    return (
      <div>{`\uF5EC ${date.toLocaleDateString()}(${toDayStr(date.getDay())})`}</div>
    )
  }
}
