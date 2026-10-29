import { View } from 'react-native'
import Svg, { Rect, Polygon, Path, G, Circle, Text as SvgText } from 'react-native-svg'
import { useAppTheme } from '../context/ThemeContext'
import { ZONES, damageById } from '../lib/inspectionData'

// The shape of one tappable car part.
function ZoneShape({ zone, ...props }) {
  if (zone.shape === 'poly') return <Polygon points={zone.points} strokeLinejoin="round" {...props} />
  if (zone.shape === 'path') return <Path d={zone.d} strokeLinejoin="round" {...props} />
  if (zone.shape === 'circle') return <Circle cx={zone.cx} cy={zone.cy} r={zone.rad} {...props} />
  return <Rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx={zone.r ?? 0} {...props} />
}

// Fold-out car, drawn like the paper Vehicle Check List: front view on top, top view in the middle,
// both sides folded out (wheels on the outside), rear view at the bottom. Tap a part to report damage there.
//   marks      - damage marks for this inspection: [{ zone, code }]
//   ghostMarks - marks from the PRE inspection, shown as dashed circles on POST
//   onZonePress(zoneId)
export default function VehicleDiagram({ marks, ghostMarks = [], onZonePress }) {
  const { colors } = useAppTheme()
  const line = colors.textFaint

  // Real marks first, then PRE marks that are not repeated in this inspection.
  const items = [
    ...marks.map((m) => ({ ...m, ghost: false })),
    ...ghostMarks
      .filter((g) => !marks.some((m) => m.zone === g.zone && m.code === g.code))
      .map((g) => ({ ...g, ghost: true })),
  ]

  const byZone = {}
  items.forEach((item) => {
    if (!byZone[item.zone]) byZone[item.zone] = []
    byZone[item.zone].push(item)
  })

  const wheels = ZONES.filter((z) => z.kind === 'wheel')
  const bodyZones = ZONES.filter((z) => z.kind !== 'wheel')

  function zoneProps(zone) {
    const marked = !!byZone[zone.id]?.some((i) => !i.ghost)
    const isWheel = zone.kind === 'wheel'
    const isMirror = zone.id.startsWith('mirror')
    return {
      fill: marked ? colors.danger : isWheel || isMirror || zone.glass ? line : colors.bgSurface2,
      fillOpacity: marked ? 0.3 : isWheel ? 0.4 : isMirror ? 0.55 : zone.glass ? 0.22 : 1,
      stroke: line,
      strokeWidth: 1.5,
    }
  }

  const detail = { stroke: line, strokeWidth: 1, fill: 'none' }
  const lamp = { fill: colors.warning, fillOpacity: 0.5, stroke: line, strokeWidth: 0.8 }

  return (
    <View style={{ width: '100%', maxWidth: 340, aspectRatio: 300 / 464, alignSelf: 'center' }}>
      <Svg width="100%" height="100%" viewBox="0 0 300 464">
        {/* Front view roof and windshield, and the rear view's back window (behind the bumpers) */}
        <Path d="M108 38 L118 12 Q150 6 182 12 L192 38 Z" fill={line} fillOpacity={0.22} stroke={line} strokeWidth={1.5} strokeLinejoin="round" pointerEvents="none" />
        <Path d="M108 424 L118 450 Q150 456 182 450 L192 424 Z" fill={line} fillOpacity={0.22} stroke={line} strokeWidth={1.5} strokeLinejoin="round" pointerEvents="none" />

        {/* Wheels sit behind the folded-out sides, like the paper form */}
        {wheels.map((zone) => (
          <ZoneShape key={zone.id} zone={zone} {...zoneProps(zone)} />
        ))}
        <G pointerEvents="none">
          {wheels.map((zone) => (
            <G key={`ring-${zone.id}`}>
              <Circle cx={zone.cx} cy={zone.cy} r={zone.rad - 7} fill="none" stroke={line} strokeWidth={1.2} />
              <Circle cx={zone.cx} cy={zone.cy} r={3.5} fill={line} />
            </G>
          ))}
        </G>

        {/* Top-view body outline */}
        <Rect x={102} y={78} width={96} height={302} rx={28} fill={colors.bgSurface} stroke={line} strokeWidth={1.5} pointerEvents="none" />

        {/* Tappable body parts */}
        {bodyZones.map((zone) => (
          <ZoneShape key={zone.id} zone={zone} {...zoneProps(zone)} />
        ))}

        {/* Drawing details (not tappable): lights, grille, plates, hood lines, wheel arches, door windows and handles */}
        <G pointerEvents="none">
          <Rect x={98} y={42} width={22} height={9} rx={4} {...lamp} />
          <Rect x={180} y={42} width={22} height={9} rx={4} {...lamp} />
          <Rect x={128} y={42} width={44} height={11} rx={3} {...detail} />
          <Rect x={136} y={58} width={28} height={8} rx={2} {...detail} />
          <Rect x={98} y={407} width={22} height={9} rx={4} {...lamp} />
          <Rect x={180} y={407} width={22} height={9} rx={4} {...lamp} />
          <Rect x={136} y={396} width={28} height={8} rx={2} {...detail} />

          <Path d="M126 92 L128 144 M174 92 L172 144" {...detail} strokeOpacity={0.6} />
          <Path d="M128 322 L128 364 M172 322 L172 364" {...detail} strokeOpacity={0.6} />

          <Path d="M44 95 A24 24 0 0 1 44 139 M44 321 A24 24 0 0 1 44 365" {...detail} strokeWidth={1.2} />
          <Path d="M256 95 A24 24 0 0 0 256 139 M256 321 A24 24 0 0 0 256 365" {...detail} strokeWidth={1.2} />

          {ZONES.filter((z) => z.id.startsWith('door_')).map((z) => {
            const left = z.id.startsWith('door_l')
            return (
              <G key={`win-${z.id}`}>
                <Rect x={left ? z.x + 29 : z.x + 4} y={z.y + 8} width={13} height={z.h - 16} rx={4} fill={line} fillOpacity={0.22} stroke={line} strokeWidth={1} />
                <Rect x={left ? z.x + 8 : z.x + 30} y={z.y + 12} width={8} height={3} rx={1.5} fill={line} />
              </G>
            )
          })}
        </G>

        {/* Tap layer: invisible copies of every part, on top of the drawing details,
            so a tap always reaches the part underneath. Wheels first so the body wins where they overlap. */}
        {[...wheels, ...bodyZones].map((zone) => {
          const tap = { fill: colors.bgVoid, fillOpacity: 0.01, onPress: () => onZonePress(zone.id) }
          return zone.hit ? (
            // Bigger tap area for small parts such as mirrors
            <Rect key={`tap-${zone.id}`} x={zone.x - zone.hit} y={zone.y - zone.hit} width={zone.w + zone.hit * 2} height={zone.h + zone.hit * 2} {...tap} />
          ) : (
            <ZoneShape key={`tap-${zone.id}`} zone={zone} {...tap} />
          )
        })}

        {/* Side labels */}
        <SvgText x={10} y={236} fontSize="11" fill={colors.textMuted} textAnchor="middle" pointerEvents="none">L</SvgText>
        <SvgText x={290} y={236} fontSize="11" fill={colors.textMuted} textAnchor="middle" pointerEvents="none">R</SvgText>

        {/* Damage markers */}
        {ZONES.map((zone) => {
          const list = byZone[zone.id]
          if (!list) return null
          const n = list.length
          return list.map((item, i) => {
            const offset = (i - (n - 1) / 2) * 24
            const x = zone.stack === 'v' ? zone.cx : zone.cx + offset
            const y = zone.stack === 'v' ? zone.cy + offset : zone.cy
            const code = damageById[item.code]?.code ?? item.code
            return (
              <G key={`${zone.id}-${item.code}-${item.ghost ? 'g' : 'm'}`} onPress={() => onZonePress(zone.id)}>
                {item.ghost ? (
                  <Circle cx={x} cy={y} r={11} fill={colors.bgSurface} stroke={colors.warning} strokeWidth={1.5} strokeDasharray="3 3" />
                ) : (
                  <Circle cx={x} cy={y} r={11} fill={colors.danger} />
                )}
                <SvgText
                  x={x}
                  y={y + 3.5}
                  fontSize="9.5"
                  fontWeight="bold"
                  fill={item.ghost ? colors.warning : 'white'}
                  textAnchor="middle"
                >
                  {code}
                </SvgText>
              </G>
            )
          })
        })}
      </Svg>
    </View>
  )
}
