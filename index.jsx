export const command = `
BATTERY=$(pmset -g batt | egrep '(\\d+)\%' -o | cut -f1 -d%)
IS_CHARGING=$(if [[ $(pmset -g ps | head -1) =~ "AC" ]]; then echo "true"; else echo "false"; fi)

VOLUME=$(osascript -e 'output volume of (get volume settings)')
IS_MUTED=$(osascript -e 'output muted of (get volume settings)')

WIFI_STATUS=$(if [ -n "$(/System/Library/PrivateFrameworks/Apple80211.framework/Versions/A/Resources/airport -I | grep AirPort | cut -d ':' -f2)" ]; then echo "false"; else echo "true"; fi)

echo $(cat <<-EOF
{
    "volume": $VOLUME,
    "ismuted": $IS_MUTED,
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
    color: #a8a8a8;
    whitespace: nowrap;
`

export const refreshFrequency = 1000

const style = {
  left: "20px",
  top: "20px"
}

export const render = ({ output }) => {
  const outputObj = parseOutput(output);
  const date = new Date();
  return (
    <div style={{width:'100%', bottom: 2, overflow: 'hidden', position: 'fixed'}}>
      <div style={{height: '100%', width: '100%', display: 'flex', justifyContent: 'space-evenly', whiteSpace: 'nowrap'}}>
        <div style={style}>{`\uF1EB WiFi: ${outputObj.wifistatus ? "on" : "off"}`}</div>
        <div style={style}>{`\uF028 Volume: ${outputObj.volume}, mute: ${outputObj.ismuted ? "on" : "off"}`}</div>
        <div style={style}>{`\uF073 ${date.toLocaleDateString()}(${toDayStr(date.getDate())})`}</div>
      </div>
    </div>
  )
}

function toDayStr(day) {
  switch (day) {
    case 1:
      return 'Sunday'
    case 2:
      return 'Monday'
    case 3:
      return 'Tuesday'
    case 4:
      return 'Wednesday'
    case 5:
      return 'Thursday'
    case 6:
      return 'Friday'
    case 7:
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

